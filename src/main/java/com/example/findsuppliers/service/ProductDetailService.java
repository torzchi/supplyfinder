package com.example.findsuppliers.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ProductDetailService {

    private final WebClient webClient;

    @Value("${rapid.api.key}")
    private String rapidApiKey;

    public ProductDetailService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://real-time-amazon-data.p.rapidapi.com")
                .defaultHeader("x-rapidapi-host", "real-time-amazon-data.p.rapidapi.com")
                .build();
    }

    public Mono<String> searchProductDetails(
            String asin,
            String country
         ) {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/product-details")
                        .queryParam("asin", asin)
                        .queryParam("country", country)
                        .build())
                .header("x-rapidapi-key", rapidApiKey)
                .retrieve()
                .bodyToMono(String.class);
    }
}