package com.example.findsuppliers.controller;

import com.example.findsuppliers.service.CypherService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cypher")
public class CypherController {
    private final CypherService cypherService;

    public CypherController(CypherService cypherService) {
        this.cypherService = cypherService;
    }

    @PostMapping("/execute")
    public List<Map<String, Object>> executeCypherQuery(@RequestBody String query) {
        return cypherService.executeQuery(query);
    }
}

