package com.maitri.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.LoginRequest;
import com.maitri.dto.LoginResponse;
import com.maitri.dto.ProfileUpdateRequest;
import com.maitri.dto.RegisterRequest;
import com.maitri.dto.UserResponse;
import com.maitri.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow React frontend
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    /**
     * User Registration Endpoint
     * React calls: POST http://localhost:8080/api/auth/register
     * @param request - signup form data from React
     * @return ResponseEntity - success with user info or error message
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Call AuthService to register user
            UserResponse userResponse = authService.register(request);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully!");
            response.put("user", userResponse);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * User Login Endpoint
     * React calls: POST http://localhost:8080/api/auth/login
     * @param request - login form data from React
     * @return ResponseEntity - success with token + user info or error message
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // Call AuthService to login user
            LoginResponse loginResponse = authService.login(request);
            
            // Return success response with token
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful!");
            response.put("token", loginResponse.getToken());
            response.put("tokenType", loginResponse.getType());
            response.put("user", loginResponse.getUser());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            // Return error response
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Check Email Availability Endpoint
     * React calls: GET http://localhost:8080/api/auth/check-email?email=user@example.com
     * @param email - email to check
     * @return ResponseEntity - whether email is available
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        try {
            boolean isAvailable = authService.isEmailAvailable(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("available", isAvailable);
            response.put("message", isAvailable ? "Email is available" : "Email is already taken");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error checking email availability");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get User Profile Endpoint (for authenticated users)
     * React calls: GET http://localhost:8080/api/auth/profile?email=user@example.com
     * @param email - user's email
     * @return ResponseEntity - user profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam String email) {
        try {
            UserResponse userResponse = authService.getUserByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", userResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
    
    /**
     * Update User Profile Endpoint
     * React calls: PUT http://localhost:8080/api/auth/profile
     * @param request - updated user data from React
     * @return ResponseEntity - success with updated user info or error message
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        try {
            System.out.println("Received profile update request: " + request);
            
            // Call AuthService to update user profile
            UserResponse userResponse = authService.updateUserProfile(request);
            
            System.out.println("Profile updated successfully: " + userResponse);
            
            // Return success response with updated user data
            return ResponseEntity.ok(userResponse); // Return the updated user directly for frontend
            
        } catch (RuntimeException e) {
            System.out.println("Profile update error: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.out.println("Unexpected error during profile update: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while updating profile. Please try again.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Health Check Endpoint
     * React calls: GET http://localhost:8080/api/auth/health
     * @return ResponseEntity - API status
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Maitri Auth API is running!");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}
