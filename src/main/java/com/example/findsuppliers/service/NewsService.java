package com.example.findsuppliers.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Value("${news.api.key}")
    private String apiKey;

    public NewsService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://serpapi.com").build();
        this.ratingClient = webClientBuilder.baseUrl("http://localhost:8080").build(); // Adjust if deployed elsewhere
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
                            .concatMap(article -> Mono.delay(Duration.ofSeconds(5)) // Delay between rating calls
                                    .then(rateTitle(article.get("title").toString()))
                                    .map(rating -> {
                                        Map<String, Object> filtered = new HashMap<>();
                                        filtered.put("title", article.get("title"));
                                        Map<String, Object> source = (Map<String, Object>) article.get("source");
                                        if (source != null) {
                                            filtered.put("source", source.get("name"));
                                            filtered.put("icon", source.get("icon"));
                                        }
                                        filtered.put("link", article.get("link"));
                                        filtered.put("date", article.get("date"));
                                        filtered.put("rating", rating);
                                        return filtered;
                                    }));
                })
                .collectList();
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
            // Remove markdown formatting like ```json and ```
            json = json.replaceAll("(?s)```json|```", "").trim();

            // Extract only the portion that looks like a JSON object
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
}

