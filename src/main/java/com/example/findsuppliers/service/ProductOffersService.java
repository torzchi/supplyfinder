package com.example.findsuppliers.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ProductOffersService {

    private final WebClient webClient;

    @Value("${rapid.api.key}")
    private String rapidApiKey;

    public ProductOffersService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://real-time-amazon-data.p.rapidapi.com")
                .defaultHeader("x-rapidapi-host", "real-time-amazon-data.p.rapidapi.com")
                .build();
    }

    public Mono<String> searchProductOffers(
            String asin,
            String country,
            int limit,
            int page
    ) {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/product-offers")
                        .queryParam("asin", asin)
                        .queryParam("country", country)
                        .queryParam("limit", limit)
                        .queryParam("page", page)
                        .build())
                .header("x-rapidapi-key", rapidApiKey)
                .retrieve()
                .bodyToMono(String.class);
    }
}