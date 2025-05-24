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
        String context = "Trebuie sa generezi un cypher din limbaj natural, baza de data este graf este structurata astfel: " +
                "avem nodurile Produs cu campurile name, si photo, avem nodurile Furnizor cu campurile name si address, " +
                "iar relatia dintre ele este PROVIDE, pe care se afla price, DECI Furnizor PROVIDE Produs, " +
                "tu trebuie sa generezi cod CYPHER pentru urmatorul produs: " + prompt;

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