import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorCard from './DoctorCard'
import BookingModal from './BookingModal'

const Doctors = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [sortByRating, setSortByRating] = useState(false)
  const [likedDoctors, setLikedDoctors] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  // Sample doctors data
  const doctors = [
    {
      id: 1,
      name: 'Dr. Anita Sharma',
      specialization: 'Gynecologist',
      experience: '12 years',
      rating: 4.8,
      location: 'Mumbai',
      price: '₹800',
      image: "/doctors/female1.jpg",
      availability: 'Available Today',
      languages: ['English', 'Hindi', 'Marathi'],
      education: 'MBBS, MD (Obstetrics & Gynecology)',
      about: 'Specialized in women\'s health and reproductive medicine with 12+ years of experience.'
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialization: 'General Physician',
      experience: '10 years',
      rating: 4.6,
      location: 'Delhi',
      price: '₹500',
      image: "/doctors/male3.jpg",
      availability: 'Available Today',
      languages: ['English', 'Hindi'],
      education: 'MBBS, MD (Internal Medicine)',
      about: 'Experienced general physician with expertise in preventive healthcare and chronic disease management.'
    },
    {
      id: 3,
      name: 'Dr. Anita Patel',
      specialization: 'Dermatologist',
      experience: '8 years',
      rating: 4.6,
      location: 'Delhi',
      price: '₹600',
      image: "/doctors/female2.jpg",
      availability: 'Available Tomorrow',
      languages: ['English', 'Hindi', 'Gujarati'],
      education: 'MBBS, MD (Dermatology)',
      about: 'Expert in skin care and cosmetic dermatology for women of all ages.'
    },
    {
      id: 4,
      name: 'Dr. Amit Singh',
      specialization: 'Endocrinologist',
      experience: '14 years',
      rating: 4.9,
      location: 'Bangalore',
      price: '₹750',
      image: "/doctors/male2.jpg",
      availability: 'Available Today',
      languages: ['English', 'Hindi', 'Kannada'],
      education: 'MBBS, MD (Endocrinology)',
      about: 'Specialist in diabetes, thyroid disorders, and hormonal imbalances with 14+ years of experience.'
    },
    {
      id: 5,
      name: 'Dr. Kavitha Reddy',
      specialization: 'Nutritionist',
      experience: '6 years',
      rating: 4.7,
      location: 'Bangalore',
      price: '₹500',
      image: "/doctors/female3.jpg",
      availability: 'Available Today',
      languages: ['English', 'Telugu', 'Tamil'],
      education: 'MSc (Nutrition), PhD (Food Science)',
      about: 'Specialized in women\'s nutrition and therapeutic diet planning.'
    },
    {
      id: 6,
      name: 'Dr. Suresh Patel',
      specialization: 'Psychiatrist',
      experience: '16 years',
      rating: 4.8,
      location: 'Mumbai',
      price: '₹900',
      image: "/doctors/male4.jpg",
      availability: 'Available Tomorrow',
      languages: ['English', 'Hindi', 'Gujarati'],
      education: 'MBBS, MD (Psychiatry)',
      about: 'Mental health specialist with extensive experience in anxiety, depression, and stress management.'
    },
    {
      id: 7,
      name: 'Dr. Meera Singh',
      specialization: 'Psychiatrist',
      experience: '10 years',
      rating: 4.9,
      location: 'Chennai',
      price: '₹900',
      image: "/doctors/female4.jpg",
      availability: 'Available Today',
      languages: ['English', 'Hindi', 'Tamil'],
      education: 'MBBS, MD (Psychiatry)',
      about: 'Mental health specialist focusing on women\'s psychological well-being.'
    },
    {
      id: 8,
      name: 'Dr. Vikram Joshi',
      specialization: 'Dermatologist',
      experience: '11 years',
      rating: 4.7,
      location: 'Pune',
      price: '₹650',
      image: "/doctors/male1.jpg",
      availability: 'Available Today',
      languages: ['English', 'Hindi', 'Marathi'],
      education: 'MBBS, MD (Dermatology)',
      about: 'Skin specialist focusing on acne treatment, anti-aging therapies, and cosmetic procedures.'
    },
    {
      id: 9,
      name: 'Dr. Rashni Gupta',
      specialization: 'General Physician',
      experience: '15 years',
      rating: 4.5,
      location: 'Pune',
      price: '₹400',
      image: "/doctors/female5.jpg",
      availability: 'Available Tomorrow',
      languages: ['English', 'Hindi', 'Marathi'],
      education: 'MBBS, MD (Internal Medicine)',
      about: 'Primary care physician with extensive experience in women\'s health.'
    },
    {
      id: 10,
      name: 'Dr. Arjun Reddy',
      specialization: 'Nutritionist',
      experience: '8 years',
      rating: 4.6,
      location: 'Hyderabad',
      price: '₹550',
      image: "/doctors/male5.jpg",
      availability: 'Available Today',
      languages: ['English', 'Telugu', 'Hindi'],
      education: 'MSc (Nutrition), Certified Sports Nutritionist',
      about: 'Sports and clinical nutritionist specializing in weight management and metabolic health.'
    },
    {
      id: 11,
      name: 'Dr. Sunita Joshi',
      specialization: 'Endocrinologist',
      experience: '9 years',
      rating: 4.7,
      location: 'Hyderabad',
      price: '₹700',
      image: "/doctors/female6.jpg",
      availability: 'Available Today',
      languages: ['English', 'Hindi', 'Telugu'],
      education: 'MBBS, MD (Endocrinology)',
      about: 'Hormone specialist treating PCOS, thyroid, and diabetes in women.'
    },
    {
      id: 12,
      name: 'Dr. Kiran Sharma',
      specialization: 'Gynecologist',
      experience: '13 years',
      rating: 4.8,
      location: 'Chennai',
      price: '₹850',
      image: "/doctors/female7.jpg",
      availability: 'Available Tomorrow',
      languages: ['English', 'Hindi', 'Tamil'],
      education: 'MBBS, MD (Obstetrics & Gynecology)',
      about: 'Experienced gynecologist specializing in high-risk pregnancies and minimally invasive surgery.'
    }
  ]

  const specializations = [
    'All Specializations',
    'Gynecologist',
    'Dermatologist',
    'Nutritionist',
    'Psychiatrist',
    'General Physician',
    'Endocrinologist'
  ]

  const locations = [
    'All Locations',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Pune',
    'Hyderabad'
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = selectedSpecialization === '' || 
                                 selectedSpecialization === 'All Specializations' ||
                                 doctor.specialization === selectedSpecialization
    const matchesLocation = selectedLocation === '' || 
                           selectedLocation === 'All Locations' ||
                           doctor.location === selectedLocation
    
    return matchesSearch && matchesSpecialization && matchesLocation
  })

  // Sort doctors by rating if sorting is enabled
  const sortedDoctors = sortByRating 
    ? [...filteredDoctors].sort((a, b) => b.rating - a.rating)
    : filteredDoctors

  const handleSortByRating = () => {
    setSortByRating(!sortByRating)
  }

  const handleLikeDoctor = (doctorId) => {
    setLikedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    )
  }

  const handleBookConsultation = (doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingModal(true)
  }

  const handleBookingSubmit = async (bookingData) => {
    // Booking is already created by BookingModal, just show success message
    try {
      alert(`✅ Consultation booked successfully with ${bookingData.doctorName} on ${bookingData.date} at ${bookingData.time}`)
    } catch (error) {
      console.error('Error displaying booking confirmation:', error)
    }
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedDoctor(null)
  }

  const handleShare = (doctor) => {
    if (navigator.share) {
      navigator.share({
        title: `Dr. ${doctor.name}`,
        text: `Check out ${doctor.name}, a ${doctor.specialization} in ${doctor.location}`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `Check out ${doctor.name}, a ${doctor.specialization} in ${doctor.location}. Visit ${window.location.href}`
      navigator.clipboard.writeText(text).then(() => {
        alert('Doctor information copied to clipboard!')
      }).catch(() => {
        alert('Unable to share. Please try again.')
      })
    }
  }

  return (
    <>
      {/* Header Section */}
      <section className="hero-section doctors-hero">
        <div className="container-fluid">
          <div className="text-center" style={{ marginTop: '40px' }}>
            <h1 className="display-4 fw-bold mb-4">Find <span className="text-pink">Doctors</span></h1>
            <p className="lead">Connect with qualified healthcare professionals</p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-5 bg-light">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="search-container bg-white p-4 rounded shadow">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Search Doctors</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Doctor name or specialization"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Specialization</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-stethoscope"></i>
                      </span>
                      <select
                        className="form-control"
                        value={selectedSpecialization}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                      >
                        {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Location</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-map-marker-alt"></i>
                      </span>
                      <select
                        className="form-control"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Available Doctors ({sortedDoctors.length})</h3>
                <div className="d-flex gap-2">
                  <button 
                    className={`btn btn-sm ${sortByRating ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={handleSortByRating}
                  >
                    <i className="fas fa-sort me-2"></i>
                    {sortByRating ? 'Sorted by Rating' : 'Sort by Rating'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {sortedDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id}
                doctor={doctor}
                isLiked={likedDoctors.includes(doctor.id)}
                onLike={handleLikeDoctor}
                onBookConsultation={handleBookConsultation}
                onShare={handleShare}
              />
            ))}
          </div>

          {sortedDoctors.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h4>No doctors found</h4>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container-fluid">
          <div className="text-center mb-5">
            <h3>Why Choose Maitri for Healthcare?</h3>
            <p className="text-muted">Experience the best in women's healthcare</p>
          </div>
          <div className="row g-4">
            <div className="col-md-3 text-center">
              <i className="fas fa-shield-alt fa-3x text-pink mb-3"></i>
              <h5>Verified Doctors</h5>
              <p className="text-muted">All doctors are verified and licensed professionals</p>
            </div>
            <div className="col-md-3 text-center">
              <i className="fas fa-clock fa-3x text-pink mb-3"></i>
              <h5>Quick Booking</h5>
              <p className="text-muted">Book consultations in just a few clicks</p>
            </div>
            <div className="col-md-3 text-center">
              <i className="fas fa-video fa-3x text-pink mb-3"></i>
              <h5>Online Consultations</h5>
              <p className="text-muted">Consult from the comfort of your home</p>
            </div>
            <div className="col-md-3 text-center">
              <i className="fas fa-lock fa-3x text-pink mb-3"></i>
              <h5>Secure & Private</h5>
              <p className="text-muted">Your health data is completely secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
          onBookingSubmit={handleBookingSubmit}
        />
      )}
    </>
  )
}

export default Doctors
