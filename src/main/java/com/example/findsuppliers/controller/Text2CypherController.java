package com.example.findsuppliers.controller;


import com.example.findsuppliers.service.Text2CypherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api")
public class Text2CypherController {

    @Autowired
    private Text2CypherService text2CypherService;

    @GetMapping("/cyphergenerate/{prompt}")
    public ResponseEntity<Map<String, String>> generateCypher(@PathVariable String prompt) {
        try {
            String decodedPrompt = URLDecoder.decode(prompt, StandardCharsets.UTF_8);
            String cypher = text2CypherService.getCypherFromPrompt(decodedPrompt).get();
            return ResponseEntity.ok(Map.of("cypher", cypher));
        } catch (InterruptedException | ExecutionException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to retrieve Cypher query"));
        }
    }
}
