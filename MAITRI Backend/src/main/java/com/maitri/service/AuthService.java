package com.maitri.service;

import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.maitri.dto.LoginRequest;
import com.maitri.dto.LoginResponse;
import com.maitri.dto.ProfileUpdateRequest;
import com.maitri.dto.RegisterRequest;
import com.maitri.dto.UserResponse;
import com.maitri.model.User;
import com.maitri.repository.UserRepository;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ModelMapper modelMapper;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                      JwtService jwtService, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.modelMapper = modelMapper;
    }
    
    /**
     * Register a new user
     * This is like filling out a membership form for the gym
     * @param request - signup form data
     * @return UserResponse - created user information
     * @throws RuntimeException if email already exists
     */
    public UserResponse register(RegisterRequest request) {
        // Step 1: Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists! Please use a different email.");
        }
        
        // Step 2: Create new user object
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase()); // Store email in lowercase
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Encrypt password
        user.setAge(request.getAge());
        user.setRole(User.Role.USER); // Default role
        user.setIsActive(true); // Account is active by default
        
        // Step 3: Save user to database
        User savedUser = userRepository.save(user);
        
        // Step 4: Convert to UserResponse (without password) and return
        return modelMapper.map(savedUser, UserResponse.class);
    }
    
    /**
     * Login user
     * This is like checking your membership card at the gym
     * @param request - login form data (email + password)
     * @return LoginResponse - JWT token + user info
     * @throws RuntimeException if login fails
     */
    public LoginResponse login(LoginRequest request) {
        // Step 1: Find user by email
        Optional<User> userOptional = userRepository.findByEmailAndIsActive(
            request.getEmail().toLowerCase(), true
        );
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found. Please check your email address or sign up for a new account.");
        }
        
        User user = userOptional.get();
        
        // Step 2: Check if password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again or reset your password.");
        }
        
        // Step 3: Generate JWT token (like giving a temporary access card)
        String token = jwtService.generateToken(user.getEmail());
        
        // Step 4: Convert user to UserResponse (without password)
        UserResponse userResponse = modelMapper.map(user, UserResponse.class);
        
        // Step 5: Return token + user info
        return new LoginResponse(token, userResponse);
    }
    
    /**
     * Check if email is available for registration
     * @param email - email to check
     * @return boolean - true if available, false if taken
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email.toLowerCase());
    }
    
    /**
     * Get user by email
     * @param email - user's email
     * @return UserResponse - user information
     * @throws RuntimeException if user not found
     */
    public UserResponse getUserByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email.toLowerCase());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found!");
        }
        
        return modelMapper.map(userOptional.get(), UserResponse.class);
    }
    
    /**
     * Update user profile information
     * @param request - updated user data
     * @return UserResponse - updated user information
     * @throws RuntimeException if user not found
     */
    public UserResponse updateUserProfile(ProfileUpdateRequest request) {
        System.out.println("AuthService: Updating profile for email: " + request.getEmail());
        
        // Step 1: Find the existing user by email
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail().toLowerCase());
        
        if (userOptional.isEmpty()) {
            System.out.println("AuthService: User not found with email: " + request.getEmail());
            throw new RuntimeException("User not found!");
        }
        
        // Step 2: Update the user fields
        User user = userOptional.get();
        System.out.println("AuthService: Found user: " + user.getFullName() + " (ID: " + user.getId() + ")");
        
        user.setFullName(request.getFullName());
        user.setAge(request.getAge());
        
        System.out.println("AuthService: Updated user fields - Name: " + user.getFullName() + ", Age: " + user.getAge());
        
        // Step 3: Save the updated user
        User updatedUser = userRepository.save(user);
        
        System.out.println("AuthService: User saved to database with ID: " + updatedUser.getId());
        
        // Step 4: Convert and return the updated user
        UserResponse response = modelMapper.map(updatedUser, UserResponse.class);
        System.out.println("AuthService: Returning response: " + response);
        
        return response;
    }
}
