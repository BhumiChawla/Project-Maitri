package com.maitri.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.maitri.dto.RegisterRequest;
import com.maitri.dto.UserResponse;
import com.maitri.model.User;
import com.maitri.repository.UserRepository;

/**
 * Test class for User Registration functionality
 * This will be used for viva demonstration to show that user creation works
 * Uses Mockito to mock dependencies so it doesn't require a database
 */
@ExtendWith(MockitoExtension.class)
class UserRegistrationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest testRegisterRequest;
    private User testUser;
    private UserResponse testUserResponse;

    @BeforeEach
    void setUp() {
        // Set up test data
        testRegisterRequest = new RegisterRequest();
        testRegisterRequest.setFullName("Test User");
        testRegisterRequest.setEmail("testuser@maitri.com");
        testRegisterRequest.setPassword("SecurePassword123!");
        testRegisterRequest.setAge(25);

        testUser = new User();
        testUser.setId(1L);
        testUser.setFullName("Test User");
        testUser.setEmail("testuser@maitri.com");
        testUser.setPassword("encoded_password");
        testUser.setAge(25);
        testUser.setRole(User.Role.USER);
        testUser.setIsActive(true);
        testUser.setCreatedAt(LocalDateTime.now());

        testUserResponse = new UserResponse();
        testUserResponse.setId(1L);
        testUserResponse.setFullName("Test User");
        testUserResponse.setEmail("testuser@maitri.com");
        testUserResponse.setAge(25);
        testUserResponse.setRole(User.Role.USER);
        testUserResponse.setIsActive(true);
        testUserResponse.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should successfully register a new user with valid details")
    void testSuccessfulUserRegistration() {
        // Arrange - Mock the dependencies
        when(userRepository.existsByEmail("testuser@maitri.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePassword123!")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(modelMapper.map(testUser, UserResponse.class)).thenReturn(testUserResponse);

        // Act - Perform user registration
        UserResponse result = authService.register(testRegisterRequest);

        // Assert - Verify the user was created successfully
        assertNotNull(result, "User response should not be null");
        assertNotNull(result.getId(), "User ID should be generated");
        assertEquals("Test User", result.getFullName(), "Full name should match");
        assertEquals("testuser@maitri.com", result.getEmail(), "Email should match");
        assertEquals(25, result.getAge(), "Age should match");
        assertEquals(User.Role.USER, result.getRole(), "Role should be USER");
        assertTrue(result.isActive(), "User should be active");

        System.out.println("✅ User Registration Test Passed!");
        System.out.println("👤 Created User: " + result.getFullName());
        System.out.println("📧 Email: " + result.getEmail());
        System.out.println("🆔 User ID: " + result.getId());
    }

    @Test
    @DisplayName("Should throw exception when trying to register with duplicate email")
    void testDuplicateEmailRegistration() {
        // Arrange - Mock that email already exists
        when(userRepository.existsByEmail("testuser@maitri.com")).thenReturn(true);

        // Act & Assert - Should throw exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(testRegisterRequest);
        });

        assertTrue(exception.getMessage().contains("Email already exists"), 
                   "Exception message should mention email already exists");
        
        System.out.println("✅ Duplicate Email Test Passed!");
        System.out.println("🚫 Correctly prevented duplicate email: " + testRegisterRequest.getEmail());
        System.out.println("📝 Error message: " + exception.getMessage());
    }

    @Test
    @DisplayName("Should validate user data correctly")
    void testUserDataValidation() {
        // Arrange - Mock successful registration
        when(userRepository.existsByEmail("testuser@maitri.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePassword123!")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(modelMapper.map(testUser, UserResponse.class)).thenReturn(testUserResponse);

        // Act
        UserResponse result = authService.register(testRegisterRequest);

        // Assert - Check all user data was properly set
        assertEquals("Test User", result.getFullName(), "Name should be preserved");
        assertEquals("testuser@maitri.com", result.getEmail(), "Email should be preserved");
        assertEquals(25, result.getAge(), "Age should be preserved");
        assertNotNull(result.getCreatedAt(), "Created date should be set");
        
        System.out.println("✅ User Data Validation Test Passed!");
        System.out.println("📊 All user fields correctly validated and preserved");
        System.out.println("📅 Account created at: " + result.getCreatedAt());
    }
}