package com.maitri.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "diet_plans")
public class DietPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "user_name", nullable = false)
    private String userName;
    
    @Column(name = "age", nullable = false)
    private Integer age;
    
    @Column(name = "weight", nullable = false)
    private Double weight;
    
    @Column(name = "height", nullable = false)
    private Double height;
    
    @Column(name = "activity_level", nullable = false)
    private String activityLevel;
    
    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms; // JSON string of selected symptoms
    
    @Column(name = "health_goals", columnDefinition = "TEXT")
    private String healthGoals; // JSON string of selected health goals
    
    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;
    
    @Column(name = "dietary_preferences", columnDefinition = "TEXT")
    private String dietaryPreferences;
    
    @Column(name = "plan_content", columnDefinition = "TEXT", nullable = false)
    private String planContent; // The actual diet plan content
    
    @Column(name = "calories_per_day")
    private Integer caloriesPerDay;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public DietPlan() {}
    
    public DietPlan(Long userId, String userName, Integer age, Double weight, Double height, 
                   String activityLevel, String symptoms, String healthGoals, 
                   String allergies, String dietaryPreferences, String planContent, 
                   Integer caloriesPerDay) {
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
        this.createdAt = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public String getSymptoms() {
        return symptoms;
    }
    
    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
    
    public String getHealthGoals() {
        return healthGoals;
    }
    
    public void setHealthGoals(String healthGoals) {
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}