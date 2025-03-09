package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.ProductDetailService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/product-details")
public class ProductDetailController {

    private final ProductDetailService productDetailService;

    public ProductDetailController(ProductDetailService productDetailService) {
        this.productDetailService = productDetailService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> searchProducts(
            @RequestParam String asin,
            @RequestParam String country
    ) {

        return productDetailService.searchProductDetails(
                asin,
                country
        ).map(response -> ResponseEntity.ok().body(response));
    }
}
