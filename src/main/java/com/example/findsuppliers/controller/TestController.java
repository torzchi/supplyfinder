package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.CypherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final CypherService cypherService;

    public TestController(CypherService cypherService) {
        this.cypherService = cypherService;
    }

    @GetMapping("/connection")
    public String testConnection() {
        try {
            var query = "RETURN 'Connection Successful' AS message";
            var results = cypherService.executeQuery(query);
            return results.isEmpty() ? "No results" : results.get(0).get("message").toString();
        } catch (Exception e) {
            return "Connection Failed: " + e.getMessage();
        }
    }
}

