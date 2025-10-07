package com.maitri.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.maitri.dto.BookingRequest;
import com.maitri.dto.BookingResponse;
import com.maitri.model.Booking;
import com.maitri.repository.BookingRepository;

@Service
@Transactional
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    /**
     * Create a new booking
     */
    public BookingResponse createBooking(BookingRequest request) {
        // Check if the time slot is already booked
        Optional<Booking> existingBooking = bookingRepository.findByDoctorIdAndDateAndTimeAndStatusNot(
            request.getDoctorId(), request.getDate(), request.getTime()
        );
        
        if (existingBooking.isPresent()) {
            throw new RuntimeException("This time slot is already booked with Dr. " + request.getDoctorName());
        }
        
        // Create new booking
        Booking booking = new Booking(
            request.getDoctorId(),
            request.getDoctorName(),
            request.getPatientId(),
            request.getPatientName(),
            request.getPatientEmail(),
            request.getDate(),
            request.getTime(),
            request.getConsultationType(),
            request.getSymptoms(),
            request.getNotes(),
            "pending",
            request.getPrice()
        );
        
        Booking savedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(savedBooking);
    }
    
    /**
     * Get all bookings for a patient
     */
    public List<BookingResponse> getBookingsByPatientId(Long patientId) {
        List<Booking> bookings = bookingRepository.findByPatientIdOrderByDateDescTimeDesc(patientId);
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming bookings for a patient
     */
    public List<BookingResponse> getUpcomingBookingsByPatientId(Long patientId) {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        List<Booking> bookings = bookingRepository.findUpcomingBookingsByPatientId(
            patientId, currentDate, currentTime
        );
        
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get past bookings for a patient
     */
    public List<BookingResponse> getPastBookingsByPatientId(Long patientId) {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        List<Booking> bookings = bookingRepository.findPastBookingsByPatientId(
            patientId, currentDate, currentTime
        );
        
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all bookings for a doctor
     */
    public List<BookingResponse> getBookingsByDoctorId(Long doctorId) {
        List<Booking> bookings = bookingRepository.findByDoctorIdOrderByDateDescTimeDesc(doctorId);
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get bookings by status (for admin/dashboard use)
     */
    public List<BookingResponse> getBookingsByStatus(String status) {
        List<Booking> bookings = bookingRepository.findByStatusOrderByDateDescTimeDesc(status);
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Update booking status (enhanced with business rules)
     */
    public BookingResponse updateBookingStatus(Long bookingId, String newStatus) {
        // Validate status
        List<String> validStatuses = List.of("pending", "confirmed", "completed", "cancelled");
        if (!validStatuses.contains(newStatus)) {
            throw new RuntimeException("Invalid status. Valid statuses are: " + validStatuses);
        }
        
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        
        if (!optionalBooking.isPresent()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = optionalBooking.get();
        String oldStatus = booking.getStatus();
        
        // Business rules for status transitions
        if ("cancelled".equals(oldStatus)) {
            throw new RuntimeException("Cannot change status of cancelled booking");
        }
        
        if ("completed".equals(oldStatus) && !"completed".equals(newStatus)) {
            throw new RuntimeException("Cannot change status of completed booking");
        }
        
        // Update status
        booking.setStatus(newStatus);
        Booking savedBooking = bookingRepository.save(booking);
        
        return mapToBookingResponse(savedBooking);
    }
    
    /**
     * Cancel a booking
     */
    public BookingResponse cancelBooking(Long bookingId, Long patientId) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        
        if (bookingOptional.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = bookingOptional.get();
        
        // Verify the booking belongs to the patient
        if (!booking.getPatientId().equals(patientId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        
        // Check if booking can be cancelled (e.g., not already completed)
        if ("completed".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot cancel completed consultations");
        }
        
        booking.setStatus("cancelled");
        Booking cancelledBooking = bookingRepository.save(booking);
        
        return mapToBookingResponse(cancelledBooking);
    }
    
    /**
     * Get available time slots for a doctor on a specific date
     */
    public List<LocalTime> getAvailableTimeSlots(Long doctorId, LocalDate date) {
        // Generate all possible time slots (9 AM to 6 PM, 30-minute intervals)
        List<LocalTime> allSlots = generateAllTimeSlots();
        
        // Get booked slots for this doctor on this date
        List<Booking> bookedSlots = bookingRepository.findByDoctorIdAndDateBetween(
            doctorId, date, date
        ).stream()
         .filter(booking -> !"cancelled".equals(booking.getStatus()))
         .collect(Collectors.toList());
        
        // Remove booked slots from available slots
        List<LocalTime> bookedTimes = bookedSlots.stream()
                .map(Booking::getTime)
                .collect(Collectors.toList());
        
        return allSlots.stream()
                .filter(slot -> !bookedTimes.contains(slot))
                .collect(Collectors.toList());
    }
    
    /**
     * Generate all possible time slots
     */
    private List<LocalTime> generateAllTimeSlots() {
        return List.of(
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(11, 0), LocalTime.of(11, 30),
            LocalTime.of(12, 0), LocalTime.of(12, 30),
            LocalTime.of(13, 0), LocalTime.of(13, 30),
            LocalTime.of(14, 0), LocalTime.of(14, 30),
            LocalTime.of(15, 0), LocalTime.of(15, 30),
            LocalTime.of(16, 0), LocalTime.of(16, 30),
            LocalTime.of(17, 0), LocalTime.of(17, 30),
            LocalTime.of(18, 0)
        );
    }
    
    /**
     * Confirm a pending booking (for doctors/admin)
     */
    public BookingResponse confirmBooking(Long bookingId, Long doctorId) {
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        
        if (!optionalBooking.isPresent()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = optionalBooking.get();
        
        // Verify the doctor has authority to confirm this booking
        if (!booking.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("You can only confirm your own appointments");
        }
        
        // Only pending bookings can be confirmed
        if (!"pending".equals(booking.getStatus())) {
            throw new RuntimeException("Only pending bookings can be confirmed. Current status: " + booking.getStatus());
        }
        
        // Update status to confirmed
        booking.setStatus("confirmed");
        Booking savedBooking = bookingRepository.save(booking);
        
        return mapToBookingResponse(savedBooking);
    }
    
    /**
     * Complete a confirmed booking (after appointment is done)
     */
    public BookingResponse completeBooking(Long bookingId, Long doctorId) {
        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        
        if (!optionalBooking.isPresent()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = optionalBooking.get();
        
        // Verify the doctor has authority to complete this booking
        if (!booking.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("You can only complete your own appointments");
        }
        
        // Only confirmed bookings can be completed
        if (!"confirmed".equals(booking.getStatus())) {
            throw new RuntimeException("Only confirmed bookings can be completed. Current status: " + booking.getStatus());
        }
        
        // Update status to completed
        booking.setStatus("completed");
        Booking savedBooking = bookingRepository.save(booking);
        
        return mapToBookingResponse(savedBooking);
    }
    
    /**
     * Automatically complete past confirmed appointments
     */
    public int autoCompleteBookings() {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        
        // Find confirmed bookings that are in the past
        List<Booking> pastConfirmedBookings = bookingRepository.findPastBookingsByStatus("confirmed", currentDate, currentTime);
        
        int completedCount = 0;
        for (Booking booking : pastConfirmedBookings) {
            booking.setStatus("completed");
            bookingRepository.save(booking);
            completedCount++;
        }
        
        return completedCount;
    }

    /**
     * Map Booking entity to BookingResponse DTO
     */
    private BookingResponse mapToBookingResponse(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getDoctorId(),
            booking.getDoctorName(),
            booking.getPatientId(),
            booking.getPatientName(),
            booking.getPatientEmail(),
            booking.getDate(),
            booking.getTime(),
            booking.getConsultationType(),
            booking.getSymptoms(),
            booking.getNotes(),
            booking.getStatus(),
            booking.getPrice(),
            booking.getCreatedAt(),
            booking.getUpdatedAt()
        );
    }
}