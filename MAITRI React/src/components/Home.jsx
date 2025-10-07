import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import AICharacter from './AICharacter'

const Home = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Add scroll animations and cloud navigation
    const cloudItems = document.querySelectorAll('.cloud-item')
    cloudItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.getAttribute('data-page')
        if (page) {
          navigate(`/${page.replace('.html', '')}`)
        }
      })
    })

    return () => {
      cloudItems.forEach(item => {
        item.removeEventListener('click', () => {})
      })
    }
  }, [navigate])

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Home Section */}
      <section id="home" className="hero-section">
        <div className="container-fluid">
          <div className="row align-items-center hero-content">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Welcome to <span className="text-pink">Maitri</span></h1>
              <p className="lead mb-4">Your trusted companion for women's health and wellness. Get personalized diet plans, find doctors, and connect with a supportive community.</p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start align-items-center">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/chatbot')}
                  style={{
                    width: '140px',
                    height: '50px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Get Started
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={scrollToFeatures}
                  style={{
                    width: '140px',
                    height: '50px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              {/* AI Character Section */}
              <AICharacter />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5 bg-light">
        <div className="container-fluid">
          <h2 className="text-center mb-5">Our Services</h2>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4" onClick={() => navigate('/chatbot')}>
                <i className="fas fa-robot fa-3x text-pink mb-3"></i>
                <h5>AI Assistant - Maitri</h5>
                <p>Chat with Maitri, your AI wellness companion for guidance and support</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4" onClick={() => navigate('/diet-planner')}>
                <i className="fas fa-utensils fa-3x text-pink mb-3"></i>
                <h5>Diet Planner</h5>
                <p>Personalized nutrition plans based on your symptoms and health needs</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4" onClick={() => navigate('/doctors')}>
                <i className="fas fa-user-md fa-3x text-pink mb-3"></i>
                <h5>Find Doctors</h5>
                <p>Connect with qualified healthcare professionals and book online sessions</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4" onClick={() => navigate('/community')}>
                <i className="fas fa-users fa-3x text-pink mb-3"></i>
                <h5>Community</h5>
                <p>Share experiences and home remedies with other women</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-5">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="mb-4">Why Choose <span className="text-pink">Maitri</span>?</h2>
              <div className="feature-list">
                <div className="feature-item d-flex mb-3">
                  <i className="fas fa-check-circle text-pink me-3 mt-1"></i>
                  <div>
                    <h6>Personalized Care</h6>
                    <p className="mb-0">Tailored recommendations based on your unique health profile</p>
                  </div>
                </div>
                <div className="feature-item d-flex mb-3">
                  <i className="fas fa-check-circle text-pink me-3 mt-1"></i>
                  <div>
                    <h6>AI-Powered Assistance</h6>
                    <p className="mb-0">24/7 support from our intelligent health companion</p>
                  </div>
                </div>
                <div className="feature-item d-flex mb-3">
                  <i className="fas fa-check-circle text-pink me-3 mt-1"></i>
                  <div>
                    <h6>Trusted Community</h6>
                    <p className="mb-0">Connect with women who understand your journey</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image-placeholder text-center">
                <i className="fas fa-heart-pulse fa-8x text-pink opacity-50"></i>
                <p className="mt-3 text-muted">Health & Wellness</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
