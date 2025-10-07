package com.maitri.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class BookingSchedulerService {
    
    private static final Logger logger = LoggerFactory.getLogger(BookingSchedulerService.class);
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Automatically complete past confirmed appointments
     * Runs every hour at the top of the hour
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void autoCompleteBookings() {
        try {
            int completedCount = bookingService.autoCompleteBookings();
            if (completedCount > 0) {
                logger.info("✅ Auto-completed {} past confirmed appointments", completedCount);
            }
        } catch (Exception e) {
            logger.error("❌ Error during auto-completion of bookings: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Alternative method - run every 30 minutes for more frequent updates
     */
    // @Scheduled(fixedRate = 1800000) // 30 minutes
    public void autoCompleteBookingsFrequent() {
        try {
            int completedCount = bookingService.autoCompleteBookings();
            if (completedCount > 0) {
                System.out.println("✅ Auto-completed " + completedCount + " past confirmed appointments (frequent check)");
            }
        } catch (Exception e) {
            System.err.println("❌ Error during frequent auto-completion of bookings: " + e.getMessage());
        }
    }
}