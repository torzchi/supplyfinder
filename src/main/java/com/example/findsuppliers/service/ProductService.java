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

        // Fix: Give the node a variable name 'p' to reference in ON CREATE SET
        String query = "MERGE (p:Produs {asin: '" + asin + "'}) " +
                "ON CREATE SET " +
                "  p.name = '" + name + "', " +
                "  p.price = '" + price + "', " +
                "  p.photo = '" + photo + "', " +
                "  p.climateFriendly = '" + climateFriendly + "'";
        cypherService.executeQuery(query);
        return fetchAndStoreOffers(asin);
    }

    private Mono<Void> fetchAndStoreOffers(String asin) {
        String offerUrl = "/api/product-offers?asin=" + asin + "&limit=4&page=1";

        return webClient.get()
                .uri(offerUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(response -> {
                    List<Map<String, Object>> offers = (List<Map<String, Object>>) ((Map<String, Object>) response.get("data")).get("product_offers");

                    return Mono.when(
                            offers.stream()
                                    .map(offer -> processOfferAndSeller(asin, offer))
                                    .toList()
                    );
                });
    }

    // Combined method to handle both offer and seller in one chain
    private Mono<Void> processOfferAndSeller(String asin, Map<String, Object> offer) {
        String price = (String) offer.get("product_price");
        String condition = (String) offer.get("product_condition");
        String sellerId = (String) offer.get("seller_id");

        return fetchSellerDetails(sellerId)
                .flatMap(sellerDetails -> {
                    String name = (String) sellerDetails.get("name");
                    String address = (String) sellerDetails.get("business_address");
                    String country = (String) sellerDetails.get("country");
                    double rating = (Double) sellerDetails.get("rating");

                    String query = "MATCH (p:Produs {asin: '" + asin + "'}) " +
                            "MERGE (f:Furnizor {sellerId: '" + sellerId + "'}) " +
                            "ON CREATE SET " +
                            "  f.name = '" + name + "', " +
                            "  f.rating = " + rating + ", " +
                            "  f.address = '" + (address != null ? address : "Unknown") + "' " +
                            "MERGE (l:Locatie {country: '" + (country != null ? country : "Unknown") + "'}) " +
                            "MERGE (f)-[:LOCATED_IN]->(l) " +
                            "MERGE (f)-[:PROVIDE {price: '" + price + "', condition: '" + condition + "'}]->(p)";

                    cypherService.executeQuery(query);
                    return Mono.empty();
                });
    }

    // Method to fetch seller details
    private Mono<Map<String, Object>> fetchSellerDetails(String sellerId) {
        String sellerUrl = "/api/seller?seller_id=" + sellerId;

        return webClient.get()
                .uri(sellerUrl)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (Map<String, Object>) response.get("data"));
    }
}