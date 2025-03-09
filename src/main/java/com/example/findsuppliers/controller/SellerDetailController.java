package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.SellerDetailService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/seller")
public class SellerDetailController {

    private final SellerDetailService SearchService;

    public SellerDetailController(SellerDetailService amazonSearchService) {
        this.SearchService = amazonSearchService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<String>> searchProducts(
            @RequestParam String seller_id,
            @RequestParam String country
    ) {

        return SearchService.searchSellerDetails(
                seller_id,
                country
        ).map(response -> ResponseEntity.ok().body(response));
    }
}
