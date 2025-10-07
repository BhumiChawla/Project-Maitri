package com.maitri.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.UserResponse;
import com.maitri.service.AuthService;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * Debug endpoint to check user data including createdAt
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserDebug(@PathVariable String email) {
        try {
            UserResponse user = authService.getUserByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            response.put("createdAt", user.getCreatedAt());
            response.put("createdAtString", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "null");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}