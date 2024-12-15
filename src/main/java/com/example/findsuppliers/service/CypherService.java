package com.example.findsuppliers.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CypherService {
    private final Driver driver;

    public CypherService(Driver driver) {
        this.driver = driver;
    }

    public List<Map<String, Object>> executeQuery(String query) {
        try (Session session = driver.session()) {
            Result result = session.run(query);
            List<Map<String, Object>> resultList = new ArrayList<>();

            while (result.hasNext()) {
                resultList.add(result.next().asMap());
            }

            return resultList;
        } catch (Exception e) {
            throw new RuntimeException("Error executing query: " + e.getMessage(), e);
        }
    }
}
