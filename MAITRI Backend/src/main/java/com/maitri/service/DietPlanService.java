package com.maitri.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.maitri.dto.DietPlanRequest;
import com.maitri.dto.DietPlanResponse;
import com.maitri.model.DietPlan;
import com.maitri.repository.DietPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DietPlanService {
    
    @Autowired
    private DietPlanRepository dietPlanRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Save or update a diet plan for a user (replaces existing one)
     */
    public DietPlanResponse saveDietPlan(DietPlanRequest request) {
        try {
            // Delete existing diet plan for this user (if any)
            dietPlanRepository.deleteByUserId(request.getUserId());
            
            // Convert lists to JSON strings
            String symptomsJson = objectMapper.writeValueAsString(request.getSymptoms());
            String healthGoalsJson = objectMapper.writeValueAsString(request.getHealthGoals());
            
            // Create new diet plan
            DietPlan dietPlan = new DietPlan(
                request.getUserId(),
                request.getUserName(),
                request.getAge(),
                request.getWeight(),
                request.getHeight(),
                request.getActivityLevel(),
                symptomsJson,
                healthGoalsJson,
                request.getAllergies(),
                request.getDietaryPreferences(),
                request.getPlanContent(),
                request.getCaloriesPerDay()
            );
            
            DietPlan savedPlan = dietPlanRepository.save(dietPlan);
            return mapToResponse(savedPlan);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing diet plan data: " + e.getMessage());
        }
    }
    
    /**
     * Get the user's current diet plan
     */
    public Optional<DietPlanResponse> getUserDietPlan(Long userId) {
        Optional<DietPlan> planOpt = dietPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return planOpt.map(this::mapToResponse);
    }
    
    /**
     * Delete user's diet plan
     */
    public boolean deleteDietPlan(Long userId) {
        if (dietPlanRepository.existsByUserId(userId)) {
            dietPlanRepository.deleteByUserId(userId);
            return true;
        }
        return false;
    }
    
    /**
     * Check if user has a diet plan
     */
    public boolean hasDietPlan(Long userId) {
        return dietPlanRepository.existsByUserId(userId);
    }
    
    /**
     * Map DietPlan entity to DietPlanResponse DTO
     */
    private DietPlanResponse mapToResponse(DietPlan dietPlan) {
        try {
            // Parse JSON strings back to lists
            List<String> symptoms = new ArrayList<>();
            List<String> healthGoals = new ArrayList<>();
            
            if (dietPlan.getSymptoms() != null && !dietPlan.getSymptoms().trim().isEmpty()) {
                symptoms = objectMapper.readValue(dietPlan.getSymptoms(), new TypeReference<List<String>>() {});
            }
            
            if (dietPlan.getHealthGoals() != null && !dietPlan.getHealthGoals().trim().isEmpty()) {
                healthGoals = objectMapper.readValue(dietPlan.getHealthGoals(), new TypeReference<List<String>>() {});
            }
            
            return new DietPlanResponse(
                dietPlan.getId(),
                dietPlan.getUserId(),
                dietPlan.getUserName(),
                dietPlan.getAge(),
                dietPlan.getWeight(),
                dietPlan.getHeight(),
                dietPlan.getActivityLevel(),
                symptoms,
                healthGoals,
                dietPlan.getAllergies(),
                dietPlan.getDietaryPreferences(),
                dietPlan.getPlanContent(),
                dietPlan.getCaloriesPerDay(),
                dietPlan.getCreatedAt(),
                dietPlan.getUpdatedAt()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing diet plan data: " + e.getMessage());
        }
    }
}