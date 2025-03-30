package com.example.findsuppliers.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    private final WebClient webClient;
    private final CypherService cypherService;

    public ProductService(WebClient.Builder webClientBuilder, CypherService cypherService) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:8080").build();
        this.cypherService = cypherService;
    }

    public Mono<Void> fetchAndStoreProducts(String query, int page, String country, String sortBy, String productCondition, boolean isPrime, String dealsAndDiscounts) {
        String searchUrl = "/api/search?query=" + query + "&page=" + page + "&country=" + country + "&sort_by=" + sortBy +
                "&product_condition=" + productCondition + "&is_prime=" + isPrime + "&deals_and_discounts=" + dealsAndDiscounts;

        return webClient.get()
                .uri(searchUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    List<Map<String, Object>> products = (List<Map<String, Object>>) ((Map<String, Object>) response.get("data")).get("products");

                    return Mono.when(
                            products.stream()
                                    .map(this::processProduct)
                                    .toList()
                    );
                });
    }

    private Mono<Void> processProduct(Map<String, Object> product) {
        String asin = (String) product.get("asin");
        String name = (String) product.get("product_title");
        String price = (String) product.get("product_price");
        String photo = (String) product.get("product_photo");
        boolean climateFriendly = (Boolean) product.get("climate_pledge_friendly");

        String query = "CREATE (:Produs {asin: '" + asin + "', name: '" + name + "', price: '" + price + "', photo: '" + photo + "', climateFriendly: '" + climateFriendly + "'})";
        cypherService.executeQuery(query);
        return fetchAndStoreOffers(asin);
    }

    private Mono<Void> fetchAndStoreOffers(String asin) {
        String offerUrl = "/api/product-offers?asin=" + asin + "&limit=10&page=1";

        return webClient.get()
                .uri(offerUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    List<Map<String, Object>> offers = (List<Map<String, Object>>) ((Map<String, Object>) response.get("data")).get("product_offers");

                    return Mono.when(
                            offers.stream()
                                    .map(offer -> storeOffer(asin, offer))
                                    .toList()
                    );
                });
    }

    private Mono<Void> storeOffer(String asin, Map<String, Object> offer) {
        String price = (String) offer.get("product_price");
        String condition = (String) offer.get("product_condition");
        String sellerId = (String) offer.get("seller_id");

        String query = "MATCH (p:Produs {asin: '" + asin + "'}) " +
                "MERGE (f:Furnizor {sellerId: '" + sellerId + "'}) " +
                "MERGE (f)-[:PROVIDE {price: '" + price + "', condition: '" + condition + "'}]->(p)";
        cypherService.executeQuery(query);

        return fetchAndStoreSeller(sellerId);
    }

    private Mono<Void> fetchAndStoreSeller(String sellerId) {
        String sellerUrl = "/api/seller?seller_id=" + sellerId;

        return webClient.get()
                .uri(sellerUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnNext(response -> {
                    Map<String, Object> seller = (Map<String, Object>) response.get("data");
                    String name = (String) seller.get("name");
                    String address = (String) seller.get("business_address");
                    String country = (String) seller.get("country");
                    double rating = (Double) seller.get("rating");

                    storeSeller(sellerId, name, address, country, rating);
                })
                .then();
    }

    private void storeSeller(String sellerId, String name, String address, String country, double rating) {
        String query = "MERGE (f:Furnizor {sellerId: '" + sellerId + "', name: '" + name + "', rating: " + rating + "}) " +
                "MERGE (l:Locatie {country: '" + country + "', address: '" + address + "'}) " +
                "MERGE (f)-[:FOUND_IN]->(l)";
        cypherService.executeQuery(query);
    }
}