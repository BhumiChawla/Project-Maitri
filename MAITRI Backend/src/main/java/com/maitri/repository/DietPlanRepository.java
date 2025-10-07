package com.maitri.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.maitri.model.DietPlan;

@Repository
public interface DietPlanRepository extends JpaRepository<DietPlan, Long> {
    
    /**
     * Find the latest diet plan for a specific user
     */
    Optional<DietPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Delete all diet plans for a specific user
     */
    void deleteByUserId(Long userId);
    
    /**
     * Check if user has any diet plan
     */
    boolean existsByUserId(Long userId);
}