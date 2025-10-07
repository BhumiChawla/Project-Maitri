package com.maitri.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maitri.dto.BookingResponse;
import com.maitri.service.BookingService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Get all pending bookings for admin review
     */
    @GetMapping("/bookings/pending")
    public ResponseEntity<?> getPendingBookings() {
        try {
            // This would typically get pending bookings for all doctors
            // For now, we'll use a simple approach
            List<BookingResponse> pendingBookings = bookingService.getBookingsByStatus("pending");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("pendingBookings", pendingBookings);
            response.put("count", pendingBookings.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching pending bookings: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get bookings by status (for admin dashboard)
     */
    @GetMapping("/bookings/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(@PathVariable String status) {
        try {
            List<BookingResponse> bookings = bookingService.getBookingsByStatus(status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            response.put("status", status);
            response.put("count", bookings.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching bookings: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Admin force-confirm booking (bypass doctor validation)
     */
    @PutMapping("/bookings/{bookingId}/admin-confirm")
    public ResponseEntity<?> adminConfirmBooking(@PathVariable Long bookingId) {
        try {
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, "confirmed");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking confirmed by admin");
            response.put("booking", booking);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error confirming booking: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get booking statistics for admin dashboard
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getBookingStatistics() {
        try {
            Map<String, Integer> stats = new HashMap<>();
            stats.put("pending", bookingService.getBookingsByStatus("pending").size());
            stats.put("confirmed", bookingService.getBookingsByStatus("confirmed").size());
            stats.put("completed", bookingService.getBookingsByStatus("completed").size());
            stats.put("cancelled", bookingService.getBookingsByStatus("cancelled").size());
            
            int total = stats.values().stream().mapToInt(Integer::intValue).sum();
            stats.put("total", total);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error fetching statistics: " + e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}