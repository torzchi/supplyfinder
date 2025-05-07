package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.ApiProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ApiProductService productService;

    @GetMapping("/searching/{product}")
    public ResponseEntity<List<Map<String, Object>>> searchProduct(@PathVariable String product) {
        List<Map<String, Object>> productInfoList = productService.getProductInfo(product);
        return ResponseEntity.ok(productInfoList);
    }
}
