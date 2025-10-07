import React from 'react'
import { useNavigate } from 'react-router-dom'
import './AICharacter.css'

const AICharacter = () => {
  const navigate = useNavigate()

  return (
    <div className="ai-character-container">
      {/* Cloud Navigation */}
      <div className="cloud-navigation">
        <div className="cloud-item" onClick={() => navigate('/chatbot')}>
          <div className="cloud">
            <i className="fas fa-robot"></i>
            <span>AI Assistant</span>
          </div>
        </div>
        <div className="cloud-item" onClick={() => navigate('/diet-planner')}>
          <div className="cloud">
            <i className="fas fa-utensils"></i>
            <span>Diet Planner</span>
          </div>
        </div>
        <div className="cloud-item" onClick={() => navigate('/doctors')}>
          <div className="cloud">
            <i className="fas fa-user-md"></i>
            <span>Find Doctors</span>
          </div>
        </div>
        <div className="cloud-item" onClick={() => navigate('/community')}>
          <div className="cloud">
            <i className="fas fa-users"></i>
            <span>Community</span>
          </div>
        </div>
      </div>

      {/* Character Section with Left Bubble */}
      <div className="character-section">
        {/* Greeting Bubble on Left */}
        <div className="greeting-bubble-left">
          <h4 className="character-name">Hi, I'm Maitri!</h4>
          <p className="character-subtitle">Your AI Health Companion</p>
        </div>

        {/* AI Character GIF */}
        <div className="character-wrapper">
          <img 
            src="/female_animation.gif" 
            alt="Maitri AI Character" 
            className="ai-character-gif"
          />
        </div>
      </div>
    </div>
  )
}

export default AICharacter
