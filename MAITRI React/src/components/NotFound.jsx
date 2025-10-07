import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="not-found-container">
      <div className="container d-flex flex-column justify-content-center align-items-center h-100 text-center">
        {/* Maitri character animation for 404 page */}
        <div className="character-container">
          <img 
            src="/404-character-unscreen.gif" 
            alt="Maitri Character - 404 Error"
            className="maitri-character"
          />
        </div>

        <div className="error-content">
          {/* Large 404 error number */}
          <h1 className="display-1 fw-bold text-pink mb-3" style={{fontSize: '5rem', lineHeight: '1'}}>
            404
          </h1>

          {/* Heart pulse icon */}
          <div className="mb-3">
            <i className="fas fa-heart-pulse text-pink" style={{fontSize: '2rem'}}></i>
          </div>

          {/* Error message and description */}
          <h2 className="h4 mb-3 text-dark">Oops! I couldn't find that page</h2>
          <p className="text-muted mb-4">
            Let me help you get back on track with your wellness journey!
          </p>

          {/* Home navigation button */}
          <button 
            className="btn btn-primary btn-lg px-4 py-2"
            onClick={handleGoHome}
            style={{
              backgroundColor: '#e91e63',
              borderColor: '#e91e63',
              borderRadius: '25px',
              fontWeight: '500'
            }}
          >
            Take me home
          </button>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          height: 100vh;
          background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
          margin: 0;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .character-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: -50px;
          z-index: 2;
          position: relative;
        }

        .maitri-character {
          width: 300px;
          height: auto;
          border-radius: 15px;
          background: transparent;
          margin-bottom: 50px;
          margin-right: 20px;
        }

        .error-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 25px;
          padding: 4rem 3rem 3rem 3rem;
          box-shadow: 0 15px 35px rgba(233, 30, 99, 0.15);
          backdrop-filter: blur(10px);
          max-width: 450px;
          width: 100%;
          margin: 0;
          z-index: 1;
          position: relative;
        }

        .btn:hover {
          background-color: #c2185b !important;
          border-color: #c2185b !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(233, 30, 99, 0.3);
        }

        @media (max-width: 768px) {
          .not-found-container {
            padding: 1rem;
          }
          
          .maitri-character {
            width: 200px;
          }
          
          h1 {
            font-size: 4rem !important;
          }
          
          .error-content {
            padding: 3rem 2rem 2rem 2rem;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default NotFound
