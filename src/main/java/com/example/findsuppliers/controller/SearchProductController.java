package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.ProductService;
import com.example.findsuppliers.service.SearchProductService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/search")
public class SearchProductController {

    private final SearchProductService SearchService;
    private final ProductService productService;

    public SearchProductController(SearchProductService searchProductService, ProductService productService) {
        this.productService = productService;
        this.SearchService = searchProductService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> searchProducts(
            @RequestParam String query,
            @RequestParam int page,
            @RequestParam String country,
            @RequestParam String sort_by,
            @RequestParam String product_condition,
            @RequestParam boolean is_prime,
            @RequestParam String deals_and_discounts) {

        return SearchService.searchProducts(
                query,
                page,
                country,
                sort_by,
                product_condition,
                is_prime,
                deals_and_discounts
        ).map(response -> ResponseEntity.ok().body(response));
    }
    @GetMapping("/fetch")
    public Mono<ResponseEntity<String>> fetchProductsAndStore(
            @RequestParam String query,
            @RequestParam int page,
            @RequestParam String country,
            @RequestParam String sort_by,
            @RequestParam String product_condition,
            @RequestParam boolean is_prime,
            @RequestParam String deals_and_discounts) {

        return productService.fetchAndStoreProducts(query, page, country, sort_by, product_condition, is_prime, deals_and_discounts)
                .thenReturn(ResponseEntity.ok("Products fetched and stored successfully!"));
    }




}
