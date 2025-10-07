package com.maitri.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.BookingRequest;
import com.maitri.dto.BookingResponse;
import com.maitri.model.Booking;
import com.maitri.repository.BookingRepository;
import com.maitri.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    /**
     * Create a new booking
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            // Enhanced debug logging
            System.out.println("=== BOOKING REQUEST RECEIVED ===");
            System.out.println("Full request object: " + request);
            System.out.println("Doctor ID: " + request.getDoctorId() + " (type: " + (request.getDoctorId() != null ? request.getDoctorId().getClass().getSimpleName() : "null") + ")");
            System.out.println("Patient ID: " + request.getPatientId() + " (type: " + (request.getPatientId() != null ? request.getPatientId().getClass().getSimpleName() : "null") + ")");
            System.out.println("Date: " + request.getDate() + " (type: " + (request.getDate() != null ? request.getDate().getClass().getSimpleName() : "null") + ")");
            System.out.println("Time: " + request.getTime() + " (type: " + (request.getTime() != null ? request.getTime().getClass().getSimpleName() : "null") + ")");
            System.out.println("Doctor Name: " + request.getDoctorName());
            System.out.println("Patient Name: " + request.getPatientName());
            System.out.println("Patient Email: " + request.getPatientEmail());
            System.out.println("Consultation Type: " + request.getConsultationType());
            System.out.println("Symptoms: " + request.getSymptoms());
            System.out.println("Notes: " + request.getNotes());
            System.out.println("Price: " + request.getPrice());
            System.out.println("=====================================");
            
            // Validate required fields
            if (request.getDoctorId() == null) {
                throw new RuntimeException("Doctor ID is required");
            }
            if (request.getPatientId() == null) {
                throw new RuntimeException("Patient ID is required");
            }
            if (request.getDate() == null) {
                throw new RuntimeException("Date is required");
            }
            if (request.getTime() == null) {
                throw new RuntimeException("Time is required");
            }
            if (request.getDoctorName() == null || request.getDoctorName().trim().isEmpty()) {
                throw new RuntimeException("Doctor name is required");
            }
            if (request.getPatientName() == null || request.getPatientName().trim().isEmpty()) {
                throw new RuntimeException("Patient name is required");
            }
            if (request.getPatientEmail() == null || request.getPatientEmail().trim().isEmpty()) {
                throw new RuntimeException("Patient email is required");
            }
            
            BookingResponse booking = bookingService.createBooking(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("booking", booking);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while creating the booking");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all bookings for the current user
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(@RequestParam(required = false) Long userId) {
        try {
            // If no userId provided in request, use default for testing
            if (userId == null) {
                userId = 1L; // Default for testing
            }
            
            List<BookingResponse> bookings = bookingService.getBookingsByPatientId(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            response.put("userId", userId); // Add for debugging
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while fetching bookings");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get upcoming bookings for the current user
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingBookings(@RequestParam(required = false) Long userId) {
        try {
            // If no userId provided in request, use default for testing
            if (userId == null) {
                userId = 1L; // Default for testing
            }
            
            List<BookingResponse> bookings = bookingService.getUpcomingBookingsByPatientId(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            response.put("userId", userId); // Add for debugging
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while fetching upcoming bookings");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get past bookings for the current user
     */
    @GetMapping("/history")
    public ResponseEntity<?> getBookingHistory() {
        try {
            // TODO: Get user ID from authentication
            Long userId = 1L; // Placeholder
            
            List<BookingResponse> bookings = bookingService.getPastBookingsByPatientId(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while fetching booking history");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Cancel a booking
     */
    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            // TODO: Get user ID from authentication
            Long userId = 1L; // Placeholder
            
            BookingResponse booking = bookingService.cancelBooking(bookingId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking cancelled successfully");
            response.put("booking", booking);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while cancelling the booking");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get available time slots for a doctor on a specific date
     */
    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableTimeSlots(
            @RequestParam Long doctorId,
            @RequestParam String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<LocalTime> availableSlots = bookingService.getAvailableTimeSlots(doctorId, localDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("availableSlots", availableSlots);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while fetching available time slots");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update booking status (for admin/doctor use)
     */
    @PutMapping("/{bookingId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam String status) {
        try {
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking status updated successfully");
            response.put("booking", booking);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while updating booking status");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Confirm a pending booking (for doctors)
     */
    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId, @RequestParam Long doctorId) {
        try {
            BookingResponse booking = bookingService.confirmBooking(bookingId, doctorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking confirmed successfully");
            response.put("booking", booking);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while confirming the booking");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Complete a confirmed booking (for doctors after appointment)
     */
    @PutMapping("/{bookingId}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long bookingId, @RequestParam Long doctorId) {
        try {
            BookingResponse booking = bookingService.completeBooking(bookingId, doctorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking completed successfully");
            response.put("booking", booking);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while completing the booking");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Auto-complete past confirmed appointments
     */
    @PostMapping("/auto-complete")
    public ResponseEntity<?> autoCompleteBookings() {
        try {
            int completedCount = bookingService.autoCompleteBookings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", completedCount + " bookings automatically completed");
            response.put("completedCount", completedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred during auto-completion: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Debug endpoint to get ALL bookings in the system
     */
    @GetMapping("/debug/all")
    public ResponseEntity<?> getAllBookingsDebug() {
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalBookings", allBookings.size());
            response.put("bookings", allBookings);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Debug endpoint failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}