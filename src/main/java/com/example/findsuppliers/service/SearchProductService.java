package com.example.findsuppliers.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class SearchProductService {

    private final WebClient webClient;

    @Value("${rapid.api.key}")
    private String rapidApiKey;

    public SearchProductService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://real-time-amazon-data.p.rapidapi.com")
                .defaultHeader("x-rapidapi-host", "real-time-amazon-data.p.rapidapi.com")
                .build();
    }

    public Mono<String> searchProducts(
            String query,
            int page,
            String country,
            String sortBy,
            String productCondition,
            boolean isPrime,
            String dealsAndDiscounts) {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .queryParam("country", country)
                        .queryParam("sort_by", sortBy)
                        .queryParam("product_condition", productCondition)
                        .queryParam("is_prime", isPrime)
                        .queryParam("deals_and_discounts", dealsAndDiscounts)
                        .build())
                .header("x-rapidapi-key", rapidApiKey)
                .retrieve()
                .bodyToMono(String.class);
    }
}