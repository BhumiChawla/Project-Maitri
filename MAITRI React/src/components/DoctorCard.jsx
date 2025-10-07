import React from 'react'

const DoctorCard = ({ 
  doctor, 
  isLiked, 
  onLike, 
  onBookConsultation, 
  onShare 
}) => {
  return (
    <div className="col-lg-6 col-xl-4">
      <div className="doctor-card h-100">
        <div className="card-header d-flex align-items-center">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="doctor-avatar me-3"
          />
          <div className="flex-grow-1">
            <h5 className="mb-1">{doctor.name}</h5>
            <p className="text-pink mb-1">{doctor.specialization}</p>
            <div className="d-flex align-items-center">
              <div className="rating me-2">
                <i className="fas fa-star text-warning"></i>
                <span className="ms-1">{doctor.rating}</span>
              </div>
              <span className="text-muted">•</span>
              <span className="ms-2 text-muted">{doctor.experience}</span>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                <i className="fas fa-map-marker-alt me-1"></i>
                {doctor.location}
              </span>
              <span className="fw-bold text-pink">{doctor.price}</span>
            </div>
            <div className="mb-2">
              <span className={`badge ${doctor.availability.includes('Today') ? 'bg-success' : 'bg-warning'}`}>
                {doctor.availability}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <strong>Education:</strong>
            <p className="text-muted mb-2">{doctor.education}</p>
          </div>

          <div className="mb-3">
            <strong>Languages:</strong>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {doctor.languages.map(lang => (
                <span key={lang} className="badge bg-light text-dark">{lang}</span>
              ))}
            </div>
          </div>

          <p className="text-muted">{doctor.about}</p>
        </div>

        <div className="card-footer">
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary flex-grow-1"
              onClick={() => onBookConsultation(doctor)}
            >
              <i className="fas fa-video me-2"></i>
              Book Consultation
            </button>
            <button 
              className={`btn ${isLiked ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onLike(doctor.id)}
              title={isLiked ? 'Unlike doctor' : 'Like doctor'}
            >
              <i className={`fas fa-heart ${isLiked ? 'text-white' : ''}`}></i>
            </button>
            <button 
              className="btn btn-outline-primary"
              onClick={() => onShare(doctor)}
            >
              <i className="fas fa-share"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorCard