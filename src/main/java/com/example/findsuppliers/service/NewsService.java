package com.example.findsuppliers.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NewsService {

    private final WebClient webClient;
    private final WebClient ratingClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private CypherService cypherService;

    @Value("${news.api.key}")
    private String apiKey;

    public NewsService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://serpapi.com").build();
        this.ratingClient = webClientBuilder.baseUrl("http://localhost:8080").build();
    }

    public Mono<List<Map<String, Object>>> fetchNews(String query) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search.json")
                        .queryParam("engine", "google_news")
                        .queryParam("q", query)
                        .queryParam("gl", "ro")
                        .queryParam("hl", "ro")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .flatMapMany(json -> {
                    List<Map<String, Object>> newsResults = (List<Map<String, Object>>) json.getOrDefault("news_results", Collections.emptyList());

                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy, hh:mm a, Z z", Locale.ENGLISH);

                    List<Map<String, Object>> topArticles = newsResults.stream()
                            .filter(article -> article.get("date") != null)
                            .sorted((a, b) -> {
                                try {
                                    ZonedDateTime d1 = ZonedDateTime.parse((String) b.get("date"), formatter);
                                    ZonedDateTime d2 = ZonedDateTime.parse((String) a.get("date"), formatter);
                                    return d1.compareTo(d2);
                                } catch (Exception e) {
                                    return 0;
                                }
                            })
                            .limit(5)
                            .collect(Collectors.toList());

                    return Flux.fromIterable(topArticles)
                            .concatMap(article -> Mono.delay(Duration.ofSeconds(5))
                                    .then(rateTitle(article.get("title").toString()))
                                    .map(rating -> {
                                        Map<String, Object> filtered = new HashMap<>();
                                        filtered.put("name", article.get("title")); // ← title becomes name
                                        Map<String, Object> source = (Map<String, Object>) article.get("source");
                                        if (source != null) {
                                            filtered.put("source", source.get("name"));
                                            filtered.put("icon", source.get("icon"));
                                        }
                                        filtered.put("link", article.get("link"));
                                        filtered.put("date", article.get("date"));
                                        filtered.put("rating", rating);

                                        saveToNeo4j(filtered);
                                        return filtered;
                                    }));
                })
                .collectList();
    }

    private void saveToNeo4j(Map<String, Object> article) {
        // Save the Stire node
        String createStire = String.format("""
                MERGE (s:Stire {link: '%s'})
                SET s.name = '%s',
                    s.source = '%s',
                    s.icon = '%s',
                    s.date = '%s',
                    s.rating = %s
                """,
                escape((String) article.get("link")),
                escape(article.get("name").toString()),
                escape(article.getOrDefault("source", "").toString()),
                escape(article.getOrDefault("icon", "").toString()),
                escape(article.get("date").toString()),
                article.get("rating").toString()
        );
        cypherService.executeQuery(createStire);

        // Get all Furnizor names
        List<Map<String, Object>> furnizors = cypherService.executeQuery("MATCH (f:Furnizor) RETURN f.name AS name");
        String stireName = article.get("name").toString().toLowerCase();

        for (Map<String, Object> furnizor : furnizors) {
            String furnizorName = furnizor.get("name").toString();
            if (stireName.contains(furnizorName.toLowerCase())) {
                String relateQuery = String.format("""
                        MATCH (f:Furnizor {name: '%s'})
                        MATCH (s:Stire {link: '%s'})
                        MERGE (f)-[:MENTIONED_IN]->(s)
                        """,
                        escape(furnizorName),
                        escape(article.get("link").toString())
                );
                cypherService.executeQuery(relateQuery);
            }
        }
    }

    private Mono<Double> rateTitle(String title) {
        return ratingClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/positivity")
                        .queryParam("prompt", title)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractRatingFromJson)
                .onErrorReturn(0.0);
    }

    private Double extractRatingFromJson(String json) {
        try {
            json = json.replaceAll("(?s)```json|```", "").trim();
            int start = json.indexOf("{");
            int end = json.lastIndexOf("}") + 1;
            if (start >= 0 && end > start) {
                json = json.substring(start, end);
            }

            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            Object ratingObj = map.get("rating");
            if (ratingObj instanceof Number) {
                return ((Number) ratingObj).doubleValue();
            } else if (ratingObj instanceof String) {
                return Double.parseDouble((String) ratingObj);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0.0;
    }

    private String escape(String input) {
        return input.replace("'", "\\'");
    }
}
