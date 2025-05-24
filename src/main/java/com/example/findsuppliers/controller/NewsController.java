package com.example.findsuppliers.controller;


import com.example.findsuppliers.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsService newsService;

    @GetMapping("/{query}")
    public Mono<List<Map<String, Object>>> getNews(@PathVariable String query) {
        return newsService.fetchNews(query);
    }
}