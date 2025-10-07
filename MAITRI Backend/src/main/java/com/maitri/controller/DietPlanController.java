package com.maitri.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.DietPlanRequest;
import com.maitri.dto.DietPlanResponse;
import com.maitri.service.DietPlanService;
import com.maitri.service.SpoonacularService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/diet")
@CrossOrigin(origins = "*")
public class DietPlanController {

    private static final Logger logger = LoggerFactory.getLogger(DietPlanController.class);
    
    private final SpoonacularService spoonacularService;
    
    @Autowired
    private DietPlanService dietPlanService;

    public DietPlanController(SpoonacularService spoonacularService) {
        this.spoonacularService = spoonacularService;
    }

    /**
     * Save a diet plan for a user (replaces existing one)
     */
    @PostMapping("/save-plan")
    public ResponseEntity<?> saveDietPlan(@RequestBody DietPlanRequest request) {
        try {
            // Validation
            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User ID is required"
                ));
            }
            
            if (request.getPlanContent() == null || request.getPlanContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Plan content is required"
                ));
            }
            
            DietPlanResponse savedPlan = dietPlanService.saveDietPlan(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Diet plan saved successfully");
            response.put("dietPlan", savedPlan);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error saving diet plan: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error saving diet plan: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get user's saved diet plan
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserDietPlan(@PathVariable Long userId) {
        try {
            Optional<DietPlanResponse> planOpt = dietPlanService.getUserDietPlan(userId);
            
            if (planOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("hasPlan", true);
                response.put("dietPlan", planOpt.get());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("hasPlan", false);
                response.put("message", "No diet plan found for this user");
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving diet plan: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error retrieving diet plan: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Delete user's diet plan
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteDietPlan(@PathVariable Long userId) {
        try {
            boolean deleted = dietPlanService.deleteDietPlan(userId);
            
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Diet plan deleted successfully"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "No diet plan found to delete"
                ));
            }
            
        } catch (Exception e) {
            logger.error("Error deleting diet plan: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error deleting diet plan: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/generate-plan")
    public Mono<ResponseEntity<Map<String, Object>>> generateDietPlan(@RequestBody Map<String, Object> userRequirements) {
        logger.info("Generating diet plan for user requirements: {}", userRequirements);
        
        // Validate required fields
        if (!isValidRequest(userRequirements)) {
            return Mono.just(ResponseEntity.badRequest()
                .body(Map.of("error", "Missing required fields: age, weight, height, activityLevel")));
        }
        
        return spoonacularService.generateMealPlan(userRequirements)
                .map(result -> {
                    if (result.isEmpty()) {
                        return ResponseEntity.internalServerError()
                            .<Map<String, Object>>body(Map.of("error", "Failed to generate meal plan"));
                    }
                    
                    // Add success response structure
                    result.put("success", true);
                    result.put("message", "Diet plan generated successfully");
                    
                    return ResponseEntity.ok(result);
                })
                .doOnError(error -> logger.error("Error in generateDietPlan: {}", error.getMessage()))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error while generating diet plan")));
    }

    @PostMapping("/nutrition-info")
    public Mono<ResponseEntity<Map<String, Object>>> getNutritionInfo(@RequestBody Map<String, Object> request) {
        logger.info("Getting nutrition info for foods: {}", request.get("foods"));
        
        @SuppressWarnings("unchecked")
        List<String> foods = (List<String>) request.get("foods");
        
        if (foods == null || foods.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest()
                .body(Map.of("error", "Foods list is required")));
        }
        
        return spoonacularService.getNutritionInfo(foods)
                .map(result -> {
                    result.put("success", true);
                    return ResponseEntity.ok(result);
                })
                .doOnError(error -> logger.error("Error in getNutritionInfo: {}", error.getMessage()))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body(Map.of("error", "Internal server error while getting nutrition info")));
    }

    @GetMapping("/test-api")
    public ResponseEntity<Map<String, Object>> testSpoonacularAPI() {
        logger.info("Testing Spoonacular API connectivity");
        
        try {
            // Simple test URL
            String testUrl = "https://api.spoonacular.com/mealplanner/generate?targetCalories=2000&timeFrame=day&apiKey=6e83ed8acd6149e0bb24c30ccbe4eadd";
            logger.info("Test URL: {}", testUrl);
            
            Map<String, Object> testResult = Map.of(
                "status", "testing",
                "url", testUrl,
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(testResult);
            
        } catch (Exception e) {
            logger.error("Error in testSpoonacularAPI: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Test failed: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "Diet Plan Service",
            "timestamp", System.currentTimeMillis()
        ));
    }

    private boolean isValidRequest(Map<String, Object> request) {
        return request.containsKey("age") && 
               request.containsKey("weight") && 
               request.containsKey("height") && 
               request.containsKey("activityLevel");
    }
}