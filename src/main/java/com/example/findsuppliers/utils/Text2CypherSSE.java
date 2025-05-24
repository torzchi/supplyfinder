package com.example.findsuppliers.utils;

import okhttp3.*;
import okhttp3.sse.EventSource;
import okhttp3.sse.EventSourceListener;
import okhttp3.sse.EventSources;
import okio.BufferedSource;
import org.jetbrains.annotations.NotNull;


public class Text2CypherSSE {

    public static void main(String[] args) {
        OkHttpClient client = new OkHttpClient.Builder()
               // .readTimeout(0, TimeUnit.MILLISECONDS) // important for SSE
                .build();

        // Prepare JSON body
        String jsonBody = """
                {
                    "llm": "gpt-4o",
                    "database": "recommendations",
                    "workflow": "text2cypher_with_1_retry_and_output_check",
                    "context": "Graful meu are urmatoarele noduri: Produs, Furnizor si legatura dintre ele, Furnizor PROVIDE Produs, pe aceasta relatie se afla pretul, vreau un scaun de bucatarie"
                }
                """;

        Request request = new Request.Builder()
                .url("https://text2cypher-llama-agent.up.railway.app/workflow/")
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "text/event-stream")
                .addHeader("Origin", "https://text2cypher-llama-agent.up.railway.app")
                .addHeader("Referer", "https://text2cypher-llama-agent.up.railway.app/")
                .post(RequestBody.create(jsonBody, MediaType.parse("application/json")))
                .build();

        EventSourceListener listener = new EventSourceListener() {
            @Override
            public void onEvent(@NotNull EventSource eventSource, String id, String type, @NotNull String data) {
                System.out.println("[SSE Event] " + data);
            }

            @Override
            public void onFailure(@NotNull EventSource eventSource, Throwable t, Response response) {
                System.err.println("SSE connection failed: " + t.getMessage());
            }
        };

        EventSource.Factory factory = EventSources.createFactory(client);
        factory.newEventSource(request, listener);
    }
}
