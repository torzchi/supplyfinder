package com.example.findsuppliers.controller;


import com.example.findsuppliers.service.CypherService;
import com.example.findsuppliers.service.LogsService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
public class GeminiController {

    private final CypherService cypherService;
    @Value("${gemini.api.key}")  // Load API key from application.properties
    private String geminiApiKey;
    LogsService logsService = new LogsService();

    public GeminiController(
            CypherService cypherService,
            @Value("${gemini.api.key}") String geminiApiKey
    ) {
        this.cypherService = cypherService;
        this.geminiApiKey = geminiApiKey;
    }
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    @GetMapping("/generate")
    public ResponseEntity<String> generateText(@RequestParam String prompt) {
        String url = GEMINI_API_URL + geminiApiKey;

        prompt = "Generează cod Cypher conform următoarei structuri a bazei de date: \n" +
        "CREATE ()<-[:FOUND_IN]-(Furnizor)-[:PROVIDE]->(Produs)-[:PART_OF]->(), \n" +
                "(Stil)<-[:HAS_STYLE]-(Produs)-[:FOUND_IN]->()-[:HAS_STYLE]->(Stil), \n" +
               "()<-[:_RELATED]-(Client)<-[:CONTACT]-(Furnizor)<-[:CONTACT]-(Client)-[:BOUGHT|INTERESTED]->(Produs)-[:RELATED]->(Produs). foloseste numele la proprietati in engleza (name, price, description) dar nodurile generale in romana ca in schema descrisa \n" +
                "Respectă schema existentă și folosește noduri deja create acolo unde este posibil. Creează nodurile necesare pentru produsul căutat, utilizând relațiile corespunzătoare.\n" +
        "Nu adăuga explicații, comentarii sau return la final. Omite delimitatorii de cod cypher ." +
                "Produsul căutat este" + prompt;
        // Prepare request payload
        String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \""  + prompt + "\" }]}]}";

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");




        // Make HTTP request
        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        String extractedText = extractText(response.getBody());
        logsService.logResponse(extractedText);
        try {
            List<Map<String, Object>> queryResult = cypherService.executeQuery(extractedText);
            return ResponseEntity.ok(extractedText);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error executing query: " + e.getMessage());
        }
    }
    private String extractText(String jsonResponse) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            String text = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText()
                    .trim();  // Trim leading/trailing spaces or newlines

            // More flexible regex-based trimming
            if (text.startsWith("```cypher") && text.endsWith("```")) {
                text = text.replaceFirst("^```cypher\\s*", "").replaceFirst("\\s*```$", "");
            }

            return text;
        } catch (IOException e) {
            return "Error parsing response";
        }
    }

}

