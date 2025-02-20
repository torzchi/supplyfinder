package com.example.findsuppliers.controller;


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
import java.util.Map;

@RestController
public class GeminiController {

    @Value("${gemini.api.key}")  // Load API key from application.properties
    private String apiKey;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=";

    @GetMapping("/generate")
    public ResponseEntity<String> generateText(@RequestParam String prompt) {
        String url = GEMINI_API_URL + apiKey;

        //prompt = "Generate a JSON response based on the funiture described :"  + prompt;
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

        return ResponseEntity.ok(extractedText);
    }
    private String extractText(String jsonResponse) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (IOException e) {
            return "Error parsing response";
        }
    }
}

