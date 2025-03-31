package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.CypherService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cypher")
public class CypherController {
    private final CypherService cypherService;
    private final ObjectMapper objectMapper;

    public CypherController(CypherService cypherService, ObjectMapper objectMapper) {
        this.cypherService = cypherService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/execute")
    public List<Map<String, Object>> executeCypherQuery(@RequestBody String requestBody) {
        try {
            // Try to parse as JSON
            JsonNode jsonNode = objectMapper.readTree(requestBody);
            if (jsonNode.has("query")) {
                return cypherService.executeQuery(jsonNode.get("query").asText());
            }
            // If no "query" property, treat the whole body as query
            return cypherService.executeQuery(requestBody);
        } catch (Exception e) {
            // If not valid JSON, treat as plain query string
            return cypherService.executeQuery(requestBody);
        }
    }
}