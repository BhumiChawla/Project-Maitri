package com.maitri.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.maitri.model.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Find all bookings for a specific patient
    List<Booking> findByPatientIdOrderByDateDescTimeDesc(Long patientId);
    
    // Find all bookings for a specific doctor
    List<Booking> findByDoctorIdOrderByDateDescTimeDesc(Long doctorId);
    
    // Check if a specific time slot is already booked with a doctor
    @Query("SELECT b FROM Booking b WHERE b.doctorId = :doctorId AND b.date = :date AND b.time = :time AND b.status != 'cancelled'")
    Optional<Booking> findByDoctorIdAndDateAndTimeAndStatusNot(
        @Param("doctorId") Long doctorId, 
        @Param("date") LocalDate date, 
        @Param("time") LocalTime time
    );
    
    // Find bookings by date range for a doctor
    @Query("SELECT b FROM Booking b WHERE b.doctorId = :doctorId AND b.date BETWEEN :startDate AND :endDate ORDER BY b.date, b.time")
    List<Booking> findByDoctorIdAndDateBetween(
        @Param("doctorId") Long doctorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Find upcoming bookings for a patient
    @Query("SELECT b FROM Booking b WHERE b.patientId = :patientId AND (b.date > :currentDate OR (b.date = :currentDate AND b.time > :currentTime)) AND b.status != 'cancelled' ORDER BY b.date, b.time")
    List<Booking> findUpcomingBookingsByPatientId(
        @Param("patientId") Long patientId,
        @Param("currentDate") LocalDate currentDate,
        @Param("currentTime") LocalTime currentTime
    );
    
    // Find past bookings for a patient
    @Query("SELECT b FROM Booking b WHERE b.patientId = :patientId AND (b.date < :currentDate OR (b.date = :currentDate AND b.time <= :currentTime)) ORDER BY b.date DESC, b.time DESC")
    List<Booking> findPastBookingsByPatientId(
        @Param("patientId") Long patientId,
        @Param("currentDate") LocalDate currentDate,
        @Param("currentTime") LocalTime currentTime
    );
    
    // Find bookings by status
    List<Booking> findByStatusOrderByDateDescTimeDesc(String status);
    
    // Find past bookings by status (for auto-completion)
    @Query("SELECT b FROM Booking b WHERE b.status = :status AND (b.date < :currentDate OR (b.date = :currentDate AND b.time <= :currentTime)) ORDER BY b.date DESC, b.time DESC")
    List<Booking> findPastBookingsByStatus(
        @Param("status") String status,
        @Param("currentDate") LocalDate currentDate,
        @Param("currentTime") LocalTime currentTime
    );
    
    // Count bookings for a specific doctor on a specific date
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.doctorId = :doctorId AND b.date = :date AND b.status != 'cancelled'")
    Long countByDoctorIdAndDateAndStatusNot(
        @Param("doctorId") Long doctorId,
        @Param("date") LocalDate date
    );
}