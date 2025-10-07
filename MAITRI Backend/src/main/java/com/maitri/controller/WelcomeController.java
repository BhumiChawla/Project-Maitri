package com.maitri.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public Map<String, Object> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🚀 Maitri Backend Server is Running Successfully!");
        response.put("description", "Women's Health & Wellness Platform API");
        response.put("status", "✅ ONLINE");
        response.put("timestamp", System.currentTimeMillis());
        response.put("version", "1.0.0");
        response.put("serverPort", "8080");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Auth - Login", "POST /api/auth/login");
        endpoints.put("Auth - Register", "POST /api/auth/register");
        endpoints.put("Auth - Health Check", "GET /api/auth/health");
        endpoints.put("Auth - Check Email", "GET /api/auth/check-email");
        endpoints.put("Auth - Get Profile", "GET /api/auth/profile");
        endpoints.put("Chat - AI Assistant", "POST /api/chat/message");
        endpoints.put("Chat - Health Check", "GET /api/chat/health");
        endpoints.put("API - Welcome Message", "GET /api/welcome");
        endpoints.put("API - General Info", "GET /api");
        
        response.put("availableEndpoints", endpoints);
        response.put("developmentNote", "This page confirms your backend is working correctly");
        
        return response;
    }

    @GetMapping("/api")
    public Map<String, Object> apiInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "📍 Maitri API Information");
        response.put("version", "1.0.0");
        response.put("status", "🟢 ACTIVE");
        response.put("baseUrl", "http://localhost:8080");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Authentication APIs", "/api/auth/*");
        endpoints.put("Chat APIs", "/api/chat/*");
        
        response.put("availableModules", endpoints);
        response.put("healthCheck", "GET /api/auth/health");
        response.put("documentation", "RESTful API for Maitri platform");
        
        return response;
    }
}
