import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'

const Profile = () => {
  const { user, isAuthenticated, logout, updateUser } = useUser()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    age: user?.age || ''
  })
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' or 'history'
  const [dietPlan, setDietPlan] = useState(null)
  const [loadingDietPlan, setLoadingDietPlan] = useState(false)
  const [hasDietPlan, setHasDietPlan] = useState(false)

  // Get current user data from context or localStorage
  const currentUser = user || (() => {
    const savedUser = localStorage.getItem('maitriUser')
    return savedUser ? JSON.parse(savedUser) : null
  })()

  // Debug: Log user data to check structure
  React.useEffect(() => {
    console.log('👤 Current User Data:', currentUser)
    if (currentUser) {
      console.log('📅 User createdAt:', currentUser.createdAt)
      console.log('📅 User createdAt type:', typeof currentUser.createdAt)
    }
    
    // Check if user data is missing createdAt field and clear localStorage
    const savedUser = localStorage.getItem('maitriUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (!userData.createdAt) {
        console.log('🧹 User data missing createdAt field - clearing localStorage for fresh login')
        localStorage.removeItem('maitriUser')
        localStorage.removeItem('maitriToken')
        alert('Please login again to update your profile data.')
        navigate('/login')
        return
      }
    }
  }, [currentUser, navigate])

  // Redirect to login if not authenticated
  React.useEffect(() => {
    const checkAuthentication = async () => {
      // First check localStorage directly
      const savedToken = localStorage.getItem('maitriToken')
      const savedUser = localStorage.getItem('maitriUser')
      
      if (!savedToken || !savedUser) {
        // No saved auth data, redirect to login
        navigate('/login')
        return
      }
      
      // We have saved data, so we can show the profile
      // Wait a moment for context to sync if needed
      setTimeout(() => {
        setIsCheckingAuth(false)
        setTimeout(() => setShowContent(true), 50) // Slight delay for smooth transition
      }, 300)
    }
    
    checkAuthentication()
  }, [navigate])

  // Separate effect to handle context updates
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      setIsCheckingAuth(false)
      setTimeout(() => setShowContent(true), 50)
      // Fetch bookings when user is authenticated
      fetchBookings('upcoming')
      // Fetch diet plan when user is authenticated
      fetchDietPlan()
    }
  }, [isAuthenticated, currentUser])

  // Fetch user bookings
  const fetchBookings = async (type = 'upcoming') => {
    setLoadingBookings(true)
    try {
      const endpoint = type === 'upcoming' ? '/api/bookings/upcoming' : '/api/bookings/history'
      // Add user ID as query parameter for debugging
      const url = `http://localhost:8080${endpoint}?userId=${currentUser?.id || 1}`
      
      console.log('Fetching bookings from:', url)
      console.log('Current user:', currentUser)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token && { 'Authorization': `Bearer ${currentUser.token}` })
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Booking response:', result)
        
        if (result.success) {
          setBookings(result.bookings || [])
        } else {
          console.error('Failed to fetch bookings:', result.message)
          setBookings([])
        }
      } else {
        console.error('Failed to fetch bookings:', response.status)
        setBookings([])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoadingBookings(false)
    }
  }

  // Fetch user's diet plan
  const fetchDietPlan = async () => {
    if (!currentUser?.id) return
    
    setLoadingDietPlan(true)
    try {
      console.log('Fetching diet plan for user:', currentUser.id)
      const response = await fetch(`http://localhost:8080/api/diet/user/${currentUser.id}`)
      const result = await response.json()
      
      if (result.success && result.hasPlan) {
        setDietPlan(result.dietPlan)
        setHasDietPlan(true)
        console.log('Diet plan loaded:', result.dietPlan)
      } else {
        setDietPlan(null)
        setHasDietPlan(false)
        console.log('No diet plan found for user')
      }
    } catch (error) {
      console.error('Error fetching diet plan:', error)
      setDietPlan(null)
      setHasDietPlan(false)
    } finally {
      setLoadingDietPlan(false)
    }
  }

  // Delete user's diet plan
  const deleteDietPlan = async () => {
    if (!currentUser?.id) return
    
    if (!confirm('Are you sure you want to delete your diet plan?')) {
      return
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/diet/user/${currentUser.id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        setDietPlan(null)
        setHasDietPlan(false)
        alert('Diet plan deleted successfully!')
      } else {
        alert('Failed to delete diet plan: ' + result.message)
      }
    } catch (error) {
      console.error('Error deleting diet plan:', error)
      alert('Error deleting diet plan')
    }
  }

  // Download diet plan as PDF
  const downloadDietPlanPDF = () => {
    if (!dietPlan) return
    
    import('jspdf').then(({ jsPDF }) => {
      // Parse the plan content if it's a JSON string
      let planData = dietPlan.planContent
      if (typeof planData === 'string') {
        try {
          planData = JSON.parse(planData)
        } catch (e) {
          console.error('Error parsing plan content:', e)
          planData = {}
        }
      }
      
      // Debug: Log the parsed plan data
      console.log('📄 PDF Generation - Diet Plan Data:', dietPlan)
      console.log('📄 PDF Generation - Plan Content:', planData)
      
      // Create a new PDF document
      const doc = new jsPDF()
      
      // Set up fonts and colors (same as DietPlanner)
      const primaryColor = [233, 30, 99] // Pink color for headings
      const textColor = [44, 62, 80] // Dark text color
      
      let yPosition = 20
      const lineHeight = 6
      const pageWidth = doc.internal.pageSize.width
      const leftMargin = 20
      const rightMargin = 20
      const contentWidth = pageWidth - leftMargin - rightMargin

      // Helper function to add text with word wrapping
      const addWrappedText = (text, x, y, maxWidth, fontSize = 10, color = textColor) => {
        doc.setFontSize(fontSize)
        doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, maxWidth)
        lines.forEach((line, index) => {
          if (y + (index * lineHeight) > 280) { // Check if we need a new page
            doc.addPage()
            y = 20
          }
          doc.text(line, x, y + (index * lineHeight))
        })
        return y + (lines.length * lineHeight)
      }

      // Helper function to add section header
      const addSectionHeader = (title, y) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.setFontSize(14)
        doc.setTextColor(...primaryColor)
        doc.setFont(undefined, 'bold')
        doc.text(title, leftMargin, y)
        doc.setFont(undefined, 'normal')
        return y + 10
      }

      // Title
      doc.setFontSize(20)
      doc.setTextColor(...primaryColor)
      doc.setFont(undefined, 'bold')
      doc.text('MAITRI PERSONALIZED DIET PLAN', leftMargin, yPosition)
      yPosition += 15

      // Subtitle
      doc.setFontSize(12)
      doc.setTextColor(...textColor)
      doc.setFont(undefined, 'normal')
      yPosition = addWrappedText(`Generated on ${new Date(dietPlan.createdAt).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, leftMargin, yPosition, contentWidth, 12)
      yPosition += 10

      // Daily Calorie Target
      yPosition = addSectionHeader('DAILY CALORIE TARGET', yPosition)
      yPosition = addWrappedText(`${dietPlan.caloriesPerDay} calories per day`, leftMargin, yPosition, contentWidth, 12, primaryColor)
      yPosition += 10

      // Personal Information
      yPosition = addSectionHeader('PERSONAL INFORMATION', yPosition)
      const personalInfo = [
        `Age: ${dietPlan.age} years`,
        `Weight: ${dietPlan.weight} kg`,
        `Height: ${dietPlan.height} cm`,
        `Activity Level: ${dietPlan.activityLevel.charAt(0).toUpperCase() + dietPlan.activityLevel.slice(1)}`
      ]
      personalInfo.forEach(info => {
        yPosition = addWrappedText(`• ${info}`, leftMargin, yPosition, contentWidth)
        yPosition += 2
      })
      yPosition += 5

      // Selected Symptoms
      yPosition = addSectionHeader('SELECTED SYMPTOMS', yPosition)
      if (dietPlan.symptoms && dietPlan.symptoms.length > 0) {
        dietPlan.symptoms.forEach(symptom => {
          yPosition = addWrappedText(`• ${symptom.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`, leftMargin, yPosition, contentWidth)
          yPosition += 2
        })
      } else {
        yPosition = addWrappedText('• None selected', leftMargin, yPosition, contentWidth)
      }
      yPosition += 5

      // Health Goals
      yPosition = addSectionHeader('HEALTH GOALS', yPosition)
      if (dietPlan.healthGoals && dietPlan.healthGoals.length > 0) {
        dietPlan.healthGoals.forEach(goal => {
          yPosition = addWrappedText(`• ${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`, leftMargin, yPosition, contentWidth)
          yPosition += 2
        })
      } else {
        yPosition = addWrappedText('• None selected', leftMargin, yPosition, contentWidth)
      }
      yPosition += 5

      // Dietary Preferences
      yPosition = addSectionHeader('DIETARY PREFERENCES', yPosition)
      yPosition = addWrappedText(`Diet Type: ${dietPlan.dietaryPreferences ? dietPlan.dietaryPreferences.charAt(0).toUpperCase() + dietPlan.dietaryPreferences.slice(1) : 'Not specified'}`, leftMargin, yPosition, contentWidth)
      yPosition += 2
      yPosition = addWrappedText(`Allergies/Intolerances: ${dietPlan.allergies || 'None specified'}`, leftMargin, yPosition, contentWidth)
      yPosition += 10

      // Recommendations
      if (planData.recommendations && planData.recommendations.length > 0) {
        yPosition = addSectionHeader('PERSONALIZED RECOMMENDATIONS', yPosition)
        planData.recommendations.forEach((rec, index) => {
          if (typeof rec === 'object' && rec.title) {
            yPosition = addWrappedText(`${index + 1}. ${rec.title}`, leftMargin, yPosition, contentWidth, 11, primaryColor)
            yPosition += 2
            yPosition = addWrappedText(`   ${rec.description}`, leftMargin, yPosition, contentWidth)
            yPosition += 5
          } else if (typeof rec === 'string') {
            yPosition = addWrappedText(`${index + 1}. ${rec}`, leftMargin, yPosition, contentWidth)
            yPosition += 5
          }
        })
      }

      // Sample Meal Plan
      if (planData && planData.mealPlan) {
        yPosition = addSectionHeader('SAMPLE MEAL PLAN', yPosition)
        
        const mealTypes = [
          { key: 'breakfast', label: 'BREAKFAST' },
          { key: 'lunch', label: 'LUNCH' },
          { key: 'dinner', label: 'DINNER' },
          { key: 'snacks', label: 'SNACKS' }
        ]

        mealTypes.forEach(mealType => {
          console.log(`📄 Checking meal section: ${mealType.label}`, planData.mealPlan[mealType.key])
          if (planData.mealPlan[mealType.key] && planData.mealPlan[mealType.key].length > 0) {
            yPosition = addWrappedText(mealType.label + ':', leftMargin, yPosition, contentWidth, 11, primaryColor)
            yPosition += 2
            planData.mealPlan[mealType.key].forEach(meal => {
              yPosition = addWrappedText(`• ${meal}`, leftMargin, yPosition, contentWidth)
              yPosition += 2
            })
            yPosition += 3
          }
        })
      } else if (planData) {
        // Fallback: check for meals directly in planData (older format)
        yPosition = addSectionHeader('SAMPLE MEAL PLAN', yPosition)
        
        const mealTypes = [
          { key: 'breakfast', label: 'BREAKFAST' },
          { key: 'lunch', label: 'LUNCH' },
          { key: 'dinner', label: 'DINNER' },
          { key: 'snacks', label: 'SNACKS' }
        ]

        mealTypes.forEach(mealType => {
          console.log(`📄 Checking direct meal section: ${mealType.label}`, planData[mealType.key])
          if (planData[mealType.key] && planData[mealType.key].length > 0) {
            yPosition = addWrappedText(mealType.label + ':', leftMargin, yPosition, contentWidth, 11, primaryColor)
            yPosition += 2
            planData[mealType.key].forEach(meal => {
              yPosition = addWrappedText(`• ${meal}`, leftMargin, yPosition, contentWidth)
              yPosition += 2
            })
            yPosition += 3
          }
        })
      }

      // Recommended Supplements
      if (planData.supplements && planData.supplements.length > 0) {
        yPosition = addSectionHeader('RECOMMENDED SUPPLEMENTS', yPosition)
        planData.supplements.forEach((supplement, index) => {
          if (typeof supplement === 'object' && supplement.name) {
            yPosition = addWrappedText(`${index + 1}. ${supplement.name}`, leftMargin, yPosition, contentWidth, 11, primaryColor)
            yPosition += 2
            if (supplement.dosage) {
              yPosition = addWrappedText(`   Dosage: ${supplement.dosage}`, leftMargin, yPosition, contentWidth)
              yPosition += 2
            }
            if (supplement.reason) {
              yPosition = addWrappedText(`   Reason: ${supplement.reason}`, leftMargin, yPosition, contentWidth)
              yPosition += 5
            }
          } else if (typeof supplement === 'string') {
            yPosition = addWrappedText(`${index + 1}. ${supplement}`, leftMargin, yPosition, contentWidth)
            yPosition += 5
          }
        })
      }

      // Important Notes
      yPosition = addSectionHeader('IMPORTANT NOTES', yPosition)
      const notes = [
        'This diet plan is generated based on the information you provided',
        'Please consult with a healthcare professional before making significant dietary changes',
        'Individual nutritional needs may vary',
        'Monitor your body\'s response and adjust as needed'
      ]
      notes.forEach(note => {
        yPosition = addWrappedText(`• ${note}`, leftMargin, yPosition, contentWidth)
        yPosition += 3
      })

      // Footer
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      yPosition += 10
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('Generated by Maitri Health Platform', leftMargin, yPosition)
      doc.text(`${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - rightMargin - 30, yPosition)

      // Save the PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')
      const dateStr = timestamp[0] // YYYY-MM-DD
      const timeStr = timestamp[1].split('.')[0] // HH-MM-SS
      const fileName = `MAITRI_Diet_Plan_${dietPlan.userName.replace(/\s+/g, '_')}_${dateStr}_${timeStr}.pdf`
      
      doc.save(fileName)
      alert('Diet plan downloaded successfully!')
    })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    fetchBookings(tab)
  }

  // Debug function to check all bookings
  const debugAllBookings = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bookings/debug/all')
      const result = await response.json()
      console.log('All bookings in database:', result)
      alert(`Found ${result.totalBookings} bookings in database. Check console for details.`)
    } catch (error) {
      console.error('Debug error:', error)
      alert('Debug failed. Check console.')
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time for display  
  const formatTime = (timeString) => {
    return timeString
  }

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-success'
      case 'pending':
        return 'bg-warning'
      case 'cancelled':
        return 'bg-danger'
      case 'completed':
        return 'bg-info'
      default:
        return 'bg-secondary'
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const handleEditProfile = () => {
    setEditFormData({
      name: currentUser?.name || currentUser?.fullName || '',
      email: currentUser?.email || '',
      age: currentUser?.age || ''
    })
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    // Restore body scroll
    document.body.style.overflow = 'unset'
    setShowEditModal(false)
  }

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true)
    
    try {
      // Client-side validation
      const name = editFormData.name.trim()
      const age = editFormData.age ? parseInt(editFormData.age) : null
      
      // Validate name
      if (!name) {
        alert('Name is required and cannot be empty.')
        setIsUpdatingProfile(false)
        return
      }
      
      if (name.length < 2) {
        alert('Name must be at least 2 characters long.')
        setIsUpdatingProfile(false)
        return
      }
      
      if (name.length > 100) {
        alert('Name must be less than 100 characters long.')
        setIsUpdatingProfile(false)
        return
      }
      
      // Validate age
      if (age !== null) {
        if (age < 13) {
          alert('Age must be at least 13 years old.')
          setIsUpdatingProfile(false)
          return
        }
        
        if (age > 120) {
          alert('Age must be less than 120 years old.')
          setIsUpdatingProfile(false)
          return
        }
      }
      
      // Get the auth token from localStorage (for future use)
      const token = localStorage.getItem('maitriToken')
      
      if (!token) {
        alert('Authentication token not found. Please login again.')
        navigate('/login')
        return
      }
      
      // Prepare the data to send to backend (include email for identification)
      const updateData = {
        fullName: name,
        email: currentUser.email, // Use current email for identification
        age: age
      }
      
      // Make API call to update profile
      const updatedUser = await apiService.updateProfile(token, updateData)
      
      // Update the user context with the response from backend
      const userToUpdate = {
        id: updatedUser.id,
        name: updatedUser.fullName, // Backend sends fullName, frontend uses name
        fullName: updatedUser.fullName, // Keep both for compatibility
        email: updatedUser.email,
        age: updatedUser.age
      }
      
      // Use context method to update user data
      updateUser(userToUpdate)
      
      console.log('Profile updated successfully:', updatedUser)
      closeEditModal()
      
      // Show success message
      alert('Profile updated successfully!')
      
      // No need to reload the page anymore - the context update will re-render the component
      
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Handle different types of errors with user-friendly messages
      let errorMessage = 'Failed to update profile. Please try again.'
      
      if (error.message.includes('Age must be at least')) {
        errorMessage = 'Age must be at least 13 years old.'
      } else if (error.message.includes('Age must be less than')) {
        errorMessage = 'Age must be less than 120 years old.'
      } else if (error.message.includes('Full name must be between')) {
        errorMessage = 'Name must be between 2 and 100 characters long.'
      } else if (error.message.includes('Full name is required')) {
        errorMessage = 'Name is required and cannot be empty.'
      } else if (error.message.includes('Please provide a valid email')) {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.message.includes('User not found')) {
        errorMessage = 'User account not found. Please login again.'
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid input data. Please check your entries.'
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.'
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      alert(errorMessage)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }  // Show loading if still checking auth or no user data available
  if (isCheckingAuth) {
    return (
      <div style={{ paddingTop: '120px' }}>
        <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
          <div className="row">
            <div className="col-12">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8 col-md-10">
                    <div className="card shadow-sm mb-4">
                      <div className="card-body text-center py-5">
                        <div className="spinner-border text-pink mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading your profile...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div style={{ paddingTop: '120px' }}>
        <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
          <div className="row">
            <div className="col-12">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8 col-md-10">
                    <div className="card shadow-sm mb-4">
                      <div className="card-body text-center py-5">
                        <div className="alert alert-danger">
                          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                          <h4>Profile Not Found</h4>
                          <p>Unable to load profile data. Please try logging in again.</p>
                          <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            <i className="fas fa-sign-in-alt me-2"></i>
                            Go to Login
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '120px' }}>
      <div 
        className="container-fluid" 
        style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f8f9fa',
          opacity: showContent ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          transform: showContent ? 'translateY(0)' : 'translateY(10px)'
        }}
      >
        <div className="container">
          <div className="row">
            
            {/* Main Profile Section - Full Width */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    
                    {/* Profile Picture and Name - Left Side */}
                    <div className="col-md-3 text-center text-md-start mb-3 mb-md-0">
                      <div className="position-relative d-inline-block">
                        <div 
                          className="user-avatar-large mb-3"
                          style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundColor: '#ffc0cb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '48px',
                            boxShadow: '0 4px 8px rgba(255, 192, 203, 0.3)',
                            margin: '0 auto'
                          }}
                        >
                          {(currentUser.name || currentUser.fullName)?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      
                      <h2 className="text-dark mb-1">{currentUser.name || currentUser.fullName || 'User'}</h2>
                    </div>
                    
                    {/* Profile Information - Right Side */}
                    <div className="col-md-9">
                      <div className="row">
                        <div className="col-md-6">
                          <h5 className="text-pink mb-3">Contact Information</h5>
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-envelope text-pink me-3" style={{ width: '20px' }}></i>
                              <div>
                                <small className="text-muted d-block">Email Address</small>
                                <span>{currentUser.email}</span>
                              </div>
                            </div>
                          </div>
                          
                          {currentUser.age && (
                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-birthday-cake text-pink me-3" style={{ width: '20px' }}></i>
                                <div>
                                  <small className="text-muted d-block">Age</small>
                                  <span>{currentUser.age} years old</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6">
                          <h5 className="text-pink mb-3">Account Status</h5>
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-user-check text-pink me-3" style={{ width: '20px' }}></i>
                              <div>
                                <small className="text-muted d-block">Membership</small>
                                <span className="badge" style={{ backgroundColor: '#e91e63', color: 'white' }}>Active Member</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-calendar-check text-pink me-3" style={{ width: '20px' }}></i>
                              <div>
                                <small className="text-muted d-block">Joined</small>
                                <span>
                                  {currentUser?.createdAt 
                                    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })
                                    : 'Join date not available'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Edit Profile Button */}
                      <div className="mt-3">
                        <button 
                          onClick={handleEditProfile}
                          className="btn me-3"
                          style={{ backgroundColor: '#e91e63', color: 'white', border: '1px solid #e91e63' }}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Edit Profile
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="btn btn-outline-danger"
                        >
                          <i className="fas fa-sign-out-alt me-2"></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diet Plan Section */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="fas fa-utensils text-success me-2"></i>
                      My Diet Plan
                    </h5>
                    {hasDietPlan && (
                      <div className="btn-group btn-group-sm">
                        <button 
                          type="button" 
                          className="btn btn-outline-success btn-sm"
                          onClick={downloadDietPlanPDF}
                          title="Download Diet Plan as PDF"
                        >
                          <i className="fas fa-download me-1"></i>
                          Download PDF
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={deleteDietPlan}
                          title="Delete Diet Plan"
                        >
                          <i className="fas fa-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {loadingDietPlan ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading diet plan...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading your diet plan...</p>
                    </div>
                  ) : hasDietPlan && dietPlan ? (
                    <div>
                      <div className="row mb-3">
                        <div className="col-md-3">
                          <div className="text-center p-3 bg-light rounded">
                            <i className="fas fa-fire text-warning fa-2x mb-2"></i>
                            <h5 className="mb-0">{dietPlan.caloriesPerDay}</h5>
                            <small className="text-muted">Daily Calories</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="text-center p-3 bg-light rounded">
                            <i className="fas fa-weight text-primary fa-2x mb-2"></i>
                            <h5 className="mb-0">{dietPlan.weight}kg</h5>
                            <small className="text-muted">Weight</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="text-center p-3 bg-light rounded">
                            <i className="fas fa-ruler-vertical text-info fa-2x mb-2"></i>
                            <h5 className="mb-0">{dietPlan.height}cm</h5>
                            <small className="text-muted">Height</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="text-center p-3 bg-light rounded">
                            <i className="fas fa-running text-success fa-2x mb-2"></i>
                            <h5 className="mb-0 text-capitalize">{dietPlan.activityLevel}</h5>
                            <small className="text-muted">Activity Level</small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="fw-bold mb-2">
                            <i className="fas fa-bullseye text-success me-2"></i>
                            Health Goals
                          </h6>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {dietPlan.healthGoals && dietPlan.healthGoals.map((goal, index) => (
                              <span key={index} className="badge bg-success rounded-pill">
                                {goal.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <h6 className="fw-bold mb-2">
                            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                            Symptoms
                          </h6>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {dietPlan.symptoms && dietPlan.symptoms.length > 0 ? (
                              dietPlan.symptoms.map((symptom, index) => (
                                <span key={index} className="badge bg-warning rounded-pill text-dark">
                                  {symptom.replace('-', ' ')}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted">No symptoms reported</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-12">
                          <small className="text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            Plan generated on: {new Date(dietPlan.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-utensils fa-4x text-muted mb-3"></i>
                      <h5 className="text-muted">No Diet Plan Found</h5>
                      <p className="text-muted mb-3">
                        You haven't generated a diet plan yet. Create one to get personalized nutrition recommendations!
                      </p>
                      <a href="/diet-planner" className="btn btn-success">
                        <i className="fas fa-plus me-2"></i>
                        Generate Diet Plan
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="fas fa-calendar-alt text-pink me-2"></i>
                      My Appointments
                    </h5>
                    <div className="btn-group btn-group-sm" role="group">
                      <button 
                        type="button" 
                        className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleTabChange('upcoming')}
                      >
                        <i className="fas fa-clock me-1"></i>
                        Upcoming
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleTabChange('history')}
                      >
                        <i className="fas fa-history me-1"></i>
                        History
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm ms-2"
                        onClick={debugAllBookings}
                        title="Debug: Show all bookings"
                      >
                        <i className="fas fa-bug"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loadingBookings ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-pink mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading appointments...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-5">
                      <i className={`fas ${activeTab === 'upcoming' ? 'fa-calendar-plus' : 'fa-history'} fa-3x text-muted mb-3`}></i>
                      <h6 className="text-muted">
                        {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No appointment history'}
                      </h6>
                      <p className="text-muted small mb-3">
                        {activeTab === 'upcoming' 
                          ? 'Book an appointment with our verified doctors to get started'
                          : 'Your past appointments will appear here'
                        }
                      </p>
                      {activeTab === 'upcoming' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate('/doctors')}
                        >
                          <i className="fas fa-user-md me-2"></i>
                          Find Doctors
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="row">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="col-md-6 col-lg-4 mb-3">
                          <div className="card h-100 border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="card-title mb-0 text-truncate">
                                  {booking.doctorName}
                                </h6>
                                <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                  {booking.status || 'Pending'}
                                </span>
                              </div>
                              
                              <div className="mb-2">
                                <small className="text-muted d-block">
                                  <i className="fas fa-calendar-day me-2"></i>
                                  {formatDate(booking.date)}
                                </small>
                                <small className="text-muted d-block">
                                  <i className="fas fa-clock me-2"></i>
                                  {formatTime(booking.time)}
                                </small>
                              </div>
                              
                              <div className="mb-2">
                                <small className="text-muted d-block">
                                  <i className={`fas ${booking.consultationType === 'video' ? 'fa-video' : 'fa-hospital'} me-2`}></i>
                                  {booking.consultationType === 'video' ? 'Video Call' : 'In-Person'}
                                </small>
                              </div>
                              
                              {booking.symptoms && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">Reason:</small>
                                  <small className="text-truncate d-block" title={booking.symptoms}>
                                    {booking.symptoms.length > 50 
                                      ? `${booking.symptoms.substring(0, 50)}...` 
                                      : booking.symptoms}
                                  </small>
                                </div>
                              )}
                              
                              {booking.price && (
                                <div className="mt-auto pt-2 border-top">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">Fee:</small>
                                    <small className="fw-bold text-success">{booking.price}</small>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <>
            {/* Full Screen Backdrop (excluding navbar) */}
            <div 
              className="modal-backdrop"
              style={{ 
                position: 'fixed',
                top: '-45px', // Start below navbar (assuming navbar height is ~70px)
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: 'calc(140vh - 70px)', // Full height minus navbar
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 9999, // Lower than navbar but high enough for content
                display: 'block'
              }}
              onClick={closeEditModal}
            />
            
            {/* Modal Dialog */}
            <div 
              className="modal fade show" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 100000, // Even higher than backdrop
                backgroundColor: 'transparent',
                pointerEvents: 'none'
              }}
            >
              <div 
                className="modal-dialog"
                style={{ 
                  pointerEvents: 'all',
                  margin: '0', // Remove default margin
                  maxWidth: '500px', // Control modal width
                  width: '90%' // Responsive width
                }}
              >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-edit text-pink me-2"></i>
                    Edit Profile
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeEditModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editName" className="form-label">
                      <i className="fas fa-user text-pink me-2"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editName"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      placeholder="Enter your full name"
                      minLength={2}
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editEmail" className="form-label">
                      <i className="fas fa-envelope text-pink me-2"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="editEmail"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      placeholder="Enter your email address"
                      disabled={true}
                      title="Email cannot be changed for security reasons"
                    />
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Email cannot be changed for security reasons
                    </small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editAge" className="form-label">
                      <i className="fas fa-birthday-cake text-pink me-2"></i>
                      Age
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="editAge"
                      name="age"
                      value={editFormData.age}
                      onChange={handleEditFormChange}
                      placeholder="Enter your age"
                      min="13"
                      max="120"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                    style={{ backgroundColor: '#e91e63', color: 'white' }}
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Profile