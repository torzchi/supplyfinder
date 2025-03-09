package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.ProductOffersService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/product-offers")
public class ProductOffersController {

    private final ProductOffersService productOffersService;

    public ProductOffersController(ProductOffersService productOffersService) {
        this.productOffersService = productOffersService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> searchProducts(
            @RequestParam String asin,
            @RequestParam String country,
            @RequestParam int limit,
            @RequestParam int page
    ) {

        return productOffersService.searchProductOffers(
                asin,
                country,
                limit,
                page
        ).map(response -> ResponseEntity.ok().body(response));
    }
}
