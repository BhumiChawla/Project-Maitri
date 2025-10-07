package com.maitri.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.maitri.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email address
     * Used for login validation
     * @param email - user's email
     * @return Optional<User> - user if found, empty if not found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if email already exists in database
     * Used during registration to prevent duplicate emails
     * @param email - email to check
     * @return boolean - true if email exists, false if not
     */
    boolean existsByEmail(String email);
    
    /**
     * Find user by email and check if account is active
     * Used for login to ensure account is not disabled
     * @param email - user's email
     * @param isActive - account status
     * @return Optional<User> - active user if found
     */
    Optional<User> findByEmailAndIsActive(String email, Boolean isActive);
    
    /**
     * Custom query to find user by email (case insensitive)
     * Alternative method for more flexible email searching
     * @param email - email to search (case insensitive)
     * @return Optional<User> - user if found
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmailIgnoreCase(@Param("email") String email);
    
    /**
     * Count total number of active users
     * Useful for admin dashboard statistics
     * @return Long - count of active users
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    Long countActiveUsers();
}
