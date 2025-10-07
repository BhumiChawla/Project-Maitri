// Import React hooks and components needed for chatbot
import { useState, useEffect, useRef } from 'react'
import { useUser } from '../context/UserContext'
import ReactMarkdown from 'react-markdown'
import './Chatbot.css'

const Chatbot = () => {
  const { user } = useUser()
  // Initialize chat with welcome message from Maitri
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm Maitri, your compassionate AI health companion. 🌸\n\nI'm here to support you through your wellness journey with:\n• Personalized health guidance\n• Women's health expertise\n• Emotional support and understanding\n• Evidence-based wellness advice\n\nHow can I help you feel your best today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false) // Show typing indicator
  const messagesEndRef = useRef(null) // Reference for auto-scrolling to latest message

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on initial load
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages])

  // New AI-powered response function
  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:8080/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.email || 'anonymous',
          timestamp: Date.now()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('Error getting AI response:', error)
      // For network errors (internet off), provide a simple network error message
      return "⚠️ Unable to connect to AI service. Please check your internet connection and try again. For immediate health guidance, please consult a healthcare provider."
    }
  }

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Get AI response (handles both success and failure cases)
      const aiResponse = await getAIResponse(currentMessage)

      const botResponse = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error in sendMessage:', error)
      // Fallback for unexpected errors
      const botResponse = {
        id: messages.length + 2,
        text: "⚠️ Something went wrong. Please try again or consult a healthcare provider for immediate assistance.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const sendQuickMessage = (message) => {
    setInputMessage(message)
    setTimeout(() => sendMessage(), 100)
  }

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      setMessages([{
        id: 1,
        text: "Hi there! I'm Maitri, your personal wellness companion. 🌸\n\nHow can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="chat-container" style={{width: '100vw', margin: 0, padding: 0}}>
      <div className="row h-100" style={{margin: 0}}>
        {/* Chat Sidebar */}
        <div className="col-md-3 chat-sidebar" style={{backgroundColor: '#ffc0cb', padding: '20px', margin: 0}}>
          <div className="sidebar-header">
            <div className="ai-avatar">
              <i className="fas fa-heart fa-2x text-pink"></i>
            </div>
            <h5>Maitri</h5>
            <p className="text-muted">Your Compassionate AI Health Companion</p>
            <small className="text-muted">Powered by AI • Always here to listen</small>
          </div>
          
          <div className="quick-actions">
            <h6>Quick Actions</h6>
            <div className="action-buttons">
              <button 
                className="btn btn-outline-primary btn-sm mb-2 w-100" 
                onClick={() => sendQuickMessage('I need guidance about my menstrual health and cycle tracking')}
              >
                <i className="fas fa-calendar-alt me-2"></i>Menstrual Health
              </button>
              <button 
                className="btn btn-outline-primary btn-sm mb-2 w-100" 
                onClick={() => sendQuickMessage('I am feeling stressed and overwhelmed. Can you help me?')}
              >
                <i className="fas fa-heart me-2"></i>Emotional Support
              </button>
              <button 
                className="btn btn-outline-primary btn-sm mb-2 w-100" 
                onClick={() => sendQuickMessage('What are some healthy nutrition tips for women my age?')}
              >
                <i className="fas fa-apple-alt me-2"></i>Nutrition Guidance
              </button>
              <button 
                className="btn btn-outline-primary btn-sm mb-2 w-100" 
                onClick={() => sendQuickMessage('I feel stressed, help me')}
              >
                <i className="fas fa-leaf me-2"></i>Stress Management
              </button>
            </div>
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="col-md-9 chat-main" style={{padding: 0, margin: 0}}>
          <div className="chat-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="status-indicator online"></div>
              <h5 className="mb-0 ms-2">Chat with Maitri</h5>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={clearChat}>
              <i className="fas fa-trash me-2"></i>Clear Chat
            </button>
          </div>

          <div className="chat-messages" id="chatMessages" style={{
            height: 'calc(100vh - 200px)', 
            overflowY: 'auto', 
            padding: '15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            marginBottom: '80px'
          }}>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}-message`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <div className="user-logo" style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ffc0cb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  ) : (
                    <div className="bot-logo" style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ffc0cb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#333',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      M
                    </div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <ReactMarkdown
                      components={{
                        // Custom styling for markdown elements
                        p: ({children}) => <div style={{margin: '0 0 8px 0'}}>{children}</div>,
                        strong: ({children}) => <strong style={{fontWeight: 'bold', color: '#c2185b'}}>{children}</strong>,
                        em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>,
                        ul: ({children}) => <ul style={{marginLeft: '16px', marginBottom: '8px'}}>{children}</ul>,
                        li: ({children}) => <li style={{marginBottom: '4px'}}>{children}</li>
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot-message">
                <div className="message-avatar">
                  <div className="bot-logo" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#ffc0cb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    M
                  </div>
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container" style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            left: '25%',
            backgroundColor: 'white',
            padding: '15px',
            borderTop: '1px solid #e0e0e0',
            zIndex: 1000
          }}>
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to Maitri..."
              />
              <button className="btn btn-primary" type="button" onClick={sendMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            {isTyping && (
              <div className="typing-indicator-text">
                <small className="text-muted">
                  <i className="fas fa-robot me-1"></i>Maitri is typing...
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
