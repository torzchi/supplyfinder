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

//        prompt = "Generează cod Cypher conform următoarei structuri a bazei de date: \n" +
//        "CREATE ()<-[:FOUND_IN]-(Furnizor)-[:PROVIDE]->(Produs)-[:PART_OF]->(), \n" +
//                "(Stil)<-[:HAS_STYLE]-(Produs)-[:FOUND_IN]->()-[:HAS_STYLE]->(Stil), \n" +
//               "()<-[:_RELATED]-(Client)<-[:CONTACT]-(Furnizor)<-[:CONTACT]-(Client)-[:BOUGHT|INTERESTED]->(Produs)-[:RELATED]->(Produs). foloseste numele la proprietati in engleza (name, price, description) dar nodurile generale in romana ca in schema descrisa \n" +
//                "Respectă schema existentă și folosește noduri deja create acolo unde este posibil. Creează nodurile necesare pentru produsul căutat, utilizând relațiile corespunzătoare.\n" +
//        "Nu adăuga explicații, comentarii sau return la final. Omite delimitatorii de cod cypher ." +
//                "Produsul căutat este" + prompt;
        // Prepare request payload

//        prompt = "Rol: Asistent designer interior. Caută online produsul: " + prompt +
//                ". Returnează *doar* JSON brut (fără ```json) cu informații actuale: " +
//                "trebuie sa arate asa: {produs {nume,pret, poza, furnizor {nume, adresa, contact}} returneaza doar 1 produs " +
//                "nume furnizor (produs.furnizor.contact) și adresă furnizor (produs.furnizor.adresa). " +
//                "Verifică existența produsului și a pozei. ASIGURA TE CA DATELE SUNT REALE";
       // prompt = "Ultimele stiri interesante despre compania " + prompt;
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
           // List<Map<String, Object>> queryResult = cypherService.executeQuery(extractedText);
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
    @GetMapping("/positivity")
    public ResponseEntity<String> generateReport(@RequestParam String prompt) {
        String url = GEMINI_API_URL + geminiApiKey;

//        prompt = "Generează cod Cypher conform următoarei structuri a bazei de date: \n" +
//        "CREATE ()<-[:FOUND_IN]-(Furnizor)-[:PROVIDE]->(Produs)-[:PART_OF]->(), \n" +
//                "(Stil)<-[:HAS_STYLE]-(Produs)-[:FOUND_IN]->()-[:HAS_STYLE]->(Stil), \n" +
//               "()<-[:_RELATED]-(Client)<-[:CONTACT]-(Furnizor)<-[:CONTACT]-(Client)-[:BOUGHT|INTERESTED]->(Produs)-[:RELATED]->(Produs). foloseste numele la proprietati in engleza (name, price, description) dar nodurile generale in romana ca in schema descrisa \n" +
//                "Respectă schema existentă și folosește noduri deja create acolo unde este posibil. Creează nodurile necesare pentru produsul căutat, utilizând relațiile corespunzătoare.\n" +
//        "Nu adăuga explicații, comentarii sau return la final. Omite delimitatorii de cod cypher ." +
//                "Produsul căutat este" + prompt;
        // Prepare request payload

//        prompt = "Rol: Asistent designer interior. Caută online produsul: " + prompt +
//                ". Returnează *doar* JSON brut (fără ```json) cu informații actuale: " +
//                "trebuie sa arate asa: {produs {nume,pret, poza, furnizor {nume, adresa, contact}} returneaza doar 1 produs " +
//                "nume furnizor (produs.furnizor.contact) și adresă furnizor (produs.furnizor.adresa). " +
//                "Verifică existența produsului și a pozei. ASIGURA TE CA DATELE SUNT REALE";
        prompt = prompt + ".Acesta este titlul unei stiri, tu trebuie sa determini daca acesta are un impact pozitiv sau negativ. Trebuie sa ii acorzi un scor de pozitivitate, cuprins intre 1-100 in functie de impact, raspunde doar cu JSON care cuprinde {rating : scor }";
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
            // List<Map<String, Object>> queryResult = cypherService.executeQuery(extractedText);
            return ResponseEntity.ok(extractedText);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error executing query: " + e.getMessage());
        }
    }



    @GetMapping("/language")
    public ResponseEntity<String> generateQuery(@RequestParam String prompt) {
        String url = GEMINI_API_URL + geminiApiKey;

        prompt = "Trebuie sa generezi un cypher din limbaj natural, baza de data este graf este structurata astfel: avem nodurile Produs cu campurile name, si photo, avem nodurile Furnizor cu campurile name si address, iar relatia dintre ele este PROVIDE, pe care se afla price, DECI Furnizor PROVIDE Produs, tu trebuie sa generezi cod CYPHER pentru urmatorul produs " + prompt + " raspunde doar cu codul si nimic altceva";
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
            // List<Map<String, Object>> queryResult = cypherService.executeQuery(extractedText);
            return ResponseEntity.ok(extractedText);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error executing query: " + e.getMessage());
        }
    }

}

