package com.example.findsuppliers.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import okhttp3.sse.EventSource;
import okhttp3.sse.EventSourceListener;
import okhttp3.sse.EventSources;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class Text2CypherService {

    private final OkHttpClient client = new OkHttpClient.Builder()
            //.readTimeout(0, TimeUnit.MILLISECONDS)
            .build();

    public CompletableFuture<String> getCypherFromPrompt(String prompt) {
        String context = "Ești un agent creat pentru a interacționa cu o bază de date grafică." +
                "Având în vedere o întrebare, creează o interogare Cypher sintactic corectă pentru a o executa, apoi analizează rezultatele interogării și returnează răspunsul." +
                "Dacă utilizatorul nu specifică un număr precis de exemple pe care dorește să le obțină, limitează întotdeauna interogarea la maximum {top_k} rezultate." +
                "Poți ordona rezultatele după o proprietate relevantă pentru a returna cele mai interesante exemple din baza de date." +
                "Nu interoga niciodată toate proprietățile din toate nodurile sau relațiile, ci solicită doar proprietățile relevante pentru întrebarea dată." +
                "Ai acces la instrumente pentru a interacționa cu baza de date." +
                "Folosește doar instrumentele furnizate. Folosește doar informațiile returnate de instrumente pentru a construi răspunsul final." +
                "TREBUIE să verifici dublu interogarea înainte de a o executa. Dacă primești o eroare în timpul executării unei interogări, rescrie interogarea și încearcă din nou." +
                "Baza de date conține următoarele noduri Produs, Furnizor, Locație, iar relațiile sunt PROVIDE între Furnizor și Produs (cu o proprietate 'price') și LOCATED_IN pentru Furnizor și Locație. Deocamdată, concentrează-te doar pe numele nodurilor și relațiilor." +
                "NU efectua nicio operațiune de modificare a datelor (de exemplu, CREATE, SET, DELETE, REMOVE) în baza de date." +
                "raspunde in romana" + prompt;
        String jsonBody = String.format("""
                {
                  "llm": "gpt-4o",
                  "database": "recommendations",
                  "workflow": "text2cypher_with_1_retry_and_output_check",
                  "context": "%s"
                }
                """, context.replace("\"", "\\\""));

        Request request = new Request.Builder()
                .url("https://text2cypher-llama-agent.up.railway.app/workflow/")
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "text/event-stream")
                .addHeader("Origin", "https://text2cypher-llama-agent.up.railway.app")
                .addHeader("Referer", "https://text2cypher-llama-agent.up.railway.app/")
                .post(RequestBody.create(jsonBody, MediaType.parse("application/json")))
                .build();

        CompletableFuture<String> future = new CompletableFuture<>();

        EventSource.Factory factory = EventSources.createFactory(client);
        factory.newEventSource(request, new EventSourceListener() {
            @Override
            public void onEvent(EventSource eventSource, String id, String type, String data) {
                if (data.contains("\"cypher\"")) {
                    try {
                        // Use a proper JSON parser instead of regex
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode root = mapper.readTree(data);
                        JsonNode result = root.path("result");
                        if (result.has("cypher")) {
                            String rawCypher = result.get("cypher").asText(); // This auto-unescapes \" and \n
                            String cleanedCypher = rawCypher
                                    .replace("\n", " ")  // remove line breaks
                                    .trim();
                            future.complete(cleanedCypher);
                            eventSource.cancel();
                        }
                    } catch (Exception e) {
                        future.completeExceptionally(e);
                    }
                }
            }

            @Override
            public void onFailure(EventSource eventSource, Throwable t, Response response) {
                future.completeExceptionally(t);
            }
        });

        return future;
    }
}