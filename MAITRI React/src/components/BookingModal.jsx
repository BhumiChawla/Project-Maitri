import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'

const BookingModal = ({ doctor, isOpen, onClose, onBookingSubmit }) => {
  const { user } = useUser()
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    consultationType: 'video', // video or in-person
    symptoms: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [errors, setErrors] = useState({})

  // Get today's date for minimum date validation (ensure it's always today)
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const today = getTodayDate()
  
  // Get date 30 days from now for maximum date validation
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Generate available time slots (9 AM to 5:30 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) { // 9 AM to 5:30 PM
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 30) break // Stop at 5:30 PM
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  // Check if selected date/time is in the past
  const isDateTimeInPast = (date, time) => {
    const selectedDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return selectedDateTime < now
  }

  // Fetch available time slots for selected date
  const fetchAvailableSlots = async (date) => {
    if (!date) return

    setLoadingSlots(true)
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/available-slots?doctorId=${doctor.id}&date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAvailableSlots(result.availableSlots)
        } else {
          setAvailableSlots(generateTimeSlots())
        }
      } else {
        console.error('Failed to fetch available slots:', response.status)
        setAvailableSlots(generateTimeSlots())
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
      setAvailableSlots(generateTimeSlots())
    } finally {
      setLoadingSlots(false)
    }
  }

  // Load available slots when date changes
  useEffect(() => {
    if (bookingData.date) {
      fetchAvailableSlots(bookingData.date)
      setBookingData(prev => ({ ...prev, time: '' }))
    }
  }, [bookingData.date])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}

    if (!bookingData.date) {
      newErrors.date = 'Please select a date'
    } else if (bookingData.date < today) {
      newErrors.date = 'Cannot book appointments in the past'
    }

    if (!bookingData.time) {
      newErrors.time = 'Please select a time'
    } else if (bookingData.date && isDateTimeInPast(bookingData.date, bookingData.time)) {
      newErrors.time = 'Cannot book appointments in the past'
    }

    if (!bookingData.symptoms.trim()) {
      newErrors.symptoms = 'Please describe your symptoms or reason for consultation'
    }

    if (!user) {
      newErrors.user = 'You must be logged in to book an appointment'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      // Debug logging to identify the issue
      console.log('=== BOOKING DEBUG INFO ===')
      console.log('user object:', user)
      console.log('user.id:', user?.id, 'type:', typeof user?.id)
      console.log('user.name:', user?.name)
      console.log('user.email:', user?.email)
      console.log('doctor object:', doctor)
      console.log('doctor.id:', doctor?.id, 'type:', typeof doctor?.id)
      console.log('bookingData:', bookingData)
      
      // Validate user data
      if (!user?.id) {
        throw new Error('User ID is missing or invalid')
      }
      
      if (!user?.name) {
        throw new Error('User full name is missing')
      }
      
      if (!user?.email) {
        throw new Error('User email is missing')
      }
      
      // Validate doctor data
      if (!doctor?.id) {
        throw new Error('Doctor ID is missing')
      }
      
      const bookingRequest = {
        doctorId: parseInt(doctor.id, 10),
        doctorName: doctor.name,
        patientId: parseInt(user.id, 10),
        patientName: user.name,  // Use user.name instead of user.fullName
        patientEmail: user.email,
        date: bookingData.date,
        time: bookingData.time,
        consultationType: bookingData.consultationType,
        symptoms: bookingData.symptoms,
        notes: bookingData.notes,
        price: doctor.price
      }

      // Validate parsed IDs
      if (isNaN(bookingRequest.doctorId)) {
        throw new Error(`Invalid doctor ID: ${doctor.id}`)
      }
      
      if (isNaN(bookingRequest.patientId)) {
        throw new Error(`Invalid patient ID: ${user.id}`)
      }

      console.log('Final booking request:', bookingRequest)
      console.log('User token:', user?.token ? 'Present' : 'Missing')

      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(bookingRequest)
      })
      
      console.log('✅ Request sent, response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          onBookingSubmit(result.booking)
          onClose()
          // Reset form
          setBookingData({
            date: '',
            time: '',
            consultationType: 'video',
            symptoms: '',
            notes: ''
          })
        } else {
          alert('Booking failed: ' + (result.message || 'Unknown error'))
        }
      } else {
        console.log('❌ Response not OK:', response.status, response.statusText)
        let errorResult
        try {
          errorResult = await response.json()
          console.log('❌ Parsed error response:', errorResult)
        } catch (parseError) {
          console.log('❌ Failed to parse error response:', parseError)
          errorResult = { message: `Network error - Status: ${response.status}` }
        }
        console.error('Server error response:', errorResult)
        alert('Booking failed: ' + (errorResult.message || `Server error (${response.status})`))
      }
    } catch (error) {
      console.error('❌ Exception in booking process:', error)
      console.error('Error stack:', error.stack)
      alert('Booking failed: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Custom CSS for enhanced styling */}
      <style jsx>{`
        .booking-modal-overlay {
          background: linear-gradient(135deg, rgba(233, 30, 99, 0.05), rgba(248, 187, 217, 0.1));
          backdrop-filter: blur(10px);
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .booking-modal-content {
          border: none;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: slideIn 0.4s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .gradient-header {
          background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
          color: white;
          padding: 1.5rem;
        }
        
        .doctor-card-enhanced {
          background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
          border: none;
          border-radius: 15px;
          padding: 1rem;
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 25px rgba(233, 30, 99, 0.2);
        }
        
        .form-section {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 4px solid #e91e63;
        }
        
        .form-control-enhanced {
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-control-enhanced:focus {
          border-color: #e91e63;
          box-shadow: 0 0 0 0.2rem rgba(233, 30, 99, 0.15);
          transform: translateY(-1px);
        }
        
        .consultation-type-card {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
          text-align: center;
          background: white;
        }
        
        .consultation-type-card:hover {
          border-color: #e91e63;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(233, 30, 99, 0.1);
        }
        
        .consultation-type-card.selected {
          border-color: #e91e63;
          background: #e91e63;
          color: white;
        }
        
        .btn-book-now {
          background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
          border: none;
          border-radius: 12px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(233, 30, 99, 0.2);
        }
        
        .btn-book-now:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(233, 30, 99, 0.3);
          color: white;
        }
        
        .btn-book-now:disabled {
          background: #6c757d;
          transform: none;
          box-shadow: none;
        }
        
        .section-title {
          color: #495057;
          font-weight: 600;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .time-slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.5rem;
        }
        
        .time-slot-option {
          padding: 0.5rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        
        .time-slot-option:hover:not(:disabled) {
          border-color: #e91e63;
          background: #f8f9fa;
        }
        
        .time-slot-option.selected {
          border-color: #e91e63;
          background: #e91e63;
          color: white;
        }
        
        .time-slot-option:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #e91e63;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .icon-gradient {
          color: #e91e63;
        }
        
        .status-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          background: #28a745;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .status-badge::before {
          content: '';
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
      `}</style>

      <div className="modal show d-block booking-modal-overlay" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content booking-modal-content">
            {/* Enhanced Header */}
            <div className="gradient-header">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="modal-title mb-1">
                    <i className="fas fa-calendar-check me-2"></i>
                    Book Your Consultation
                  </h5>
                  <small className="opacity-75">Schedule your appointment with {doctor.name}</small>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={onClose}
                  disabled={isSubmitting}
                ></button>
              </div>
            </div>
            
            <div className="modal-body p-3">
              {/* Enhanced Doctor Info */}
              <div className="doctor-card-enhanced">
                <div className="d-flex align-items-center">
                  <div className="position-relative me-3">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="rounded-circle"
                      style={{ width: '70px', height: '70px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }}
                    />
                    <div className="status-badge"></div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-bold">{doctor.name}</h6>
                    <p className="mb-1 opacity-90">
                      <i className="fas fa-user-md me-2"></i>
                      {doctor.specialization}
                    </p>
                    <p className="mb-0 opacity-90">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {doctor.location}
                      <span className="ms-3">
                        <i className="fas fa-tag me-1"></i>
                        {doctor.price}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Date & Time Selection */}
                <div className="form-section">
                  <h6 className="section-title">
                    <i className="fas fa-calendar-alt me-2 icon-gradient"></i>
                    Select Date & Time
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label fw-semibold">Select Date *</label>
                      <input
                        type="date"
                        className={`form-control form-control-enhanced ${errors.date ? 'is-invalid' : ''}`}
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        min={today}
                        max={maxDate}
                      />
                      {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-2">
                      <label className="form-label fw-semibold">Available Time Slots *</label>
                      {loadingSlots ? (
                        <div className="text-center py-3">
                          <div className="loading-spinner"></div>
                          <small className="d-block mt-2 text-muted">Loading available slots...</small>
                        </div>
                      ) : (
                        <div className="time-slot-grid">
                          {availableSlots.map(slot => (
                            <div
                              key={slot}
                              className={`time-slot-option ${bookingData.time === slot ? 'selected' : ''}`}
                              onClick={() => !isDateTimeInPast(bookingData.date, slot) && setBookingData(prev => ({ ...prev, time: slot }))}
                              style={{ opacity: isDateTimeInPast(bookingData.date, slot) ? 0.5 : 1 }}
                            >
                              {slot}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.time && <div className="text-danger mt-2">{errors.time}</div>}
                      <small className="form-text text-muted mt-2">
                        <i className="fas fa-info-circle me-1"></i>
                        Available: 9:00 AM - 5:30 PM (30-minute slots)
                      </small>
                    </div>
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="form-section">
                  <h6 className="section-title">
                    <i className="fas fa-video me-2 icon-gradient"></i>
                    Consultation Type
                  </h6>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <div 
                        className={`consultation-type-card ${bookingData.consultationType === 'video' ? 'selected' : ''}`}
                        onClick={() => setBookingData(prev => ({ ...prev, consultationType: 'video' }))}
                      >
                        <i className="fas fa-video fa-lg mb-1"></i>
                        <div className="fw-semibold">Video Call</div>
                        <small>Online consultation</small>
                      </div>
                    </div>
                    <div className="col-6 mb-2">
                      <div 
                        className={`consultation-type-card ${bookingData.consultationType === 'in-person' ? 'selected' : ''}`}
                        onClick={() => setBookingData(prev => ({ ...prev, consultationType: 'in-person' }))}
                      >
                        <i className="fas fa-hospital fa-lg mb-1"></i>
                        <div className="fw-semibold">In-Person</div>
                        <small>Visit clinic</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Symptoms Description */}
                <div className="form-section">
                  <h6 className="section-title">
                    <i className="fas fa-stethoscope me-2 icon-gradient"></i>
                    Medical Information
                  </h6>
                  <div className="row">
                    <div className="col-md-7 mb-2">
                      <label className="form-label fw-semibold">Symptoms/Reason for consultation *</label>
                      <textarea
                        className={`form-control form-control-enhanced ${errors.symptoms ? 'is-invalid' : ''}`}
                        name="symptoms"
                        value={bookingData.symptoms}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Describe your symptoms or reason for consultation..."
                      />
                      {errors.symptoms && <div className="invalid-feedback">{errors.symptoms}</div>}
                    </div>
                    
                    <div className="col-md-5 mb-2">
                      <label className="form-label fw-semibold">Additional notes</label>
                      <textarea
                        className="form-control form-control-enhanced"
                        name="notes"
                        value={bookingData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Any additional information..."
                      />
                      <small className="text-muted">Optional</small>
                    </div>
                  </div>
                </div>

                {/* Login Warning */}
                {!user && (
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    You must be logged in to book an appointment. Please log in first.
                  </div>
                )}

                {/* Submit Button */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    <small>
                      <i className="fas fa-shield-alt me-1"></i>
                      Your information is secure and confidential
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-book-now"
                      disabled={isSubmitting || !user}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }}></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-calendar-check me-2"></i>
                          Book Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BookingModal