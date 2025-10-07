package com.maitri.dto;

import java.util.List;

public class DietPlanRequest {
    private Long userId;
    private String userName;
    private Integer age;
    private Double weight;
    private Double height;
    private String activityLevel;
    private List<String> symptoms;
    private List<String> healthGoals;
    private String allergies;
    private String dietaryPreferences;
    private String planContent;
    private Integer caloriesPerDay;
    
    // Constructors
    public DietPlanRequest() {}
    
    public DietPlanRequest(Long userId, String userName, Integer age, Double weight, 
                          Double height, String activityLevel, List<String> symptoms, 
                          List<String> healthGoals, String allergies, String dietaryPreferences, 
                          String planContent, Integer caloriesPerDay) {
        this.userId = userId;
        this.userName = userName;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.activityLevel = activityLevel;
        this.symptoms = symptoms;
        this.healthGoals = healthGoals;
        this.allergies = allergies;
        this.dietaryPreferences = dietaryPreferences;
        this.planContent = planContent;
        this.caloriesPerDay = caloriesPerDay;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public Integer getAge() {
        return age;
    }
    
    public void setAge(Integer age) {
        this.age = age;
    }
    
    public Double getWeight() {
        return weight;
    }
    
    public void setWeight(Double weight) {
        this.weight = weight;
    }
    
    public Double getHeight() {
        return height;
    }
    
    public void setHeight(Double height) {
        this.height = height;
    }
    
    public String getActivityLevel() {
        return activityLevel;
    }
    
    public void setActivityLevel(String activityLevel) {
        this.activityLevel = activityLevel;
    }
    
    public List<String> getSymptoms() {
        return symptoms;
    }
    
    public void setSymptoms(List<String> symptoms) {
        this.symptoms = symptoms;
    }
    
    public List<String> getHealthGoals() {
        return healthGoals;
    }
    
    public void setHealthGoals(List<String> healthGoals) {
        this.healthGoals = healthGoals;
    }
    
    public String getAllergies() {
        return allergies;
    }
    
    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }
    
    public String getDietaryPreferences() {
        return dietaryPreferences;
    }
    
    public void setDietaryPreferences(String dietaryPreferences) {
        this.dietaryPreferences = dietaryPreferences;
    }
    
    public String getPlanContent() {
        return planContent;
    }
    
    public void setPlanContent(String planContent) {
        this.planContent = planContent;
    }
    
    public Integer getCaloriesPerDay() {
        return caloriesPerDay;
    }
    
    public void setCaloriesPerDay(Integer caloriesPerDay) {
        this.caloriesPerDay = caloriesPerDay;
    }
}