package com.maitri.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    public SecurityConfig() {
        // Default constructor
    }
    
    /**
     * Configure security filter chain
     * This is like setting up security rules for your building
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for REST APIs with JWT)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable CORS (so React can talk to Spring Boot)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure which endpoints need authentication
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication needed)
                .requestMatchers(
                    "/",                         // Root welcome page
                    "/api",                      // API info page
                    "/api/welcome",              // API welcome page
                    "/api/auth/login",           // Login endpoint
                    "/api/auth/register",        // Signup endpoint  
                    "/api/auth/check-email",     // Email check endpoint
                    "/api/auth/profile",         // Profile endpoints (GET and PUT)
                    "/api/auth/health",          // Health check endpoint
                    "/api/chat/**",              // Chat endpoints (AI chatbot)
                    "/api/diet/**",              // Diet planner endpoints (Spoonacular integration)
                    "/api/bookings/available-slots",  // Available time slots (public access)
                    "/api/bookings",             // Booking creation (temporarily public for testing)
                    "/api/bookings/my-bookings", // User bookings (temporarily public for testing)
                    "/api/bookings/upcoming",    // Upcoming bookings (temporarily public for testing)
                    "/api/bookings/history",     // Booking history (temporarily public for testing)
                    "/api/bookings/debug/all",   // Debug endpoint to see all bookings
                    "/api/bookings/*/confirm",   // Confirm bookings (temporarily public for testing)
                    "/api/bookings/*/complete",  // Complete bookings (temporarily public for testing)
                    "/api/bookings/*/cancel",    // Cancel bookings (temporarily public for testing)
                    "/api/bookings/auto-complete", // Auto-complete past bookings (temporarily public)
                    "/api/admin/**",             // Admin endpoints (temporarily public for testing)
                    "/api/community/**",         // Community endpoints (temporarily public for testing)
                    "/error"                     // Spring Boot error page
                ).permitAll()
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            
            // Use stateless session (JWT tokens, no server sessions)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
            
        return http.build();
    }
    
    /**
     * Password encoder bean
     * This encrypts passwords using BCrypt (super secure)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * CORS configuration
     * This allows React frontend to communicate with Spring Boot backend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow requests from React frontend
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",  // Create React App dev server
            "http://127.0.0.1:5173",  // Alternative localhost
            "http://127.0.0.1:3000"   // Alternative localhost
        ));
        
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allow common headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
