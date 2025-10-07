import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, signup, loading, checkEmailExists } = useUser()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    age: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Registration-specific validations
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }

      if (!formData.age) {
        newErrors.age = 'Age is required'
      } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
        newErrors.age = 'Please enter a valid age (1-120)'
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        // Login logic
        const result = await login(formData.email, formData.password)

        if (result.success) {
          setSuccessMessage('Welcome back to Maintri!')
          setTimeout(() => navigate('/home'), 1500) // Navigate after 1.5 seconds
        } else {
          setErrors({ general: result.error || 'Login failed. Please check your credentials.' })
        }
      } else {
        // Registration logic
        try {
          // Check if email already exists before signup
          const emailCheck = await checkEmailExists(formData.email)
          if (emailCheck.exists) {
            setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' })
            setIsSubmitting(false)
            return
          }
        } catch (emailCheckError) {
          console.error('Email check failed:', emailCheckError)
          // Continue with registration even if email check fails
        }

        const signupData = {
          fullName: formData.name,  // Changed from 'name' to 'fullName'
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age)
        }

        console.log('Attempting signup with data:', signupData)
        const result = await signup(signupData)
        console.log('Signup result:', result)

        if (result.success) {
          setSuccessMessage(`Welcome to Maitri, ${formData.name}!`)
          setTimeout(() => navigate('/home'), 1500)
        } else {
          setErrors({ general: result.error || 'Registration failed. Please try again.' })
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setErrors({
        general: `Error: ${error.message || 'Something went wrong. Please try again.'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      age: '',
      agreeToTerms: false
    })
    setErrors({}) // Clear errors when switching modes
    setSuccessMessage('')
    setShowPassword(false) // Reset password visibility
    setShowConfirmPassword(false) // Reset confirm password visibility
  }

  return (

    <section className="auth-section">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="auth-card" style={{ marginTop: '100px' }}>
              <div className="auth-header text-center mb-3">
                <i className="fas fa-heart fa-3x text-pink mb-3"></i>
                <h2>Welcome to <span className="text-pink">Maitri</span></h2>
                <p className="text-muted">
                  {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}

                {/* General error message */}
                {errors.general && (
                  <div className="alert alert-danger" role="alert">
                    {errors.general}
                  </div>
                )}

                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <input
                      type="number"
                      className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      min="13"
                      max="100"
                    />
                    {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      className="btn position-absolute"
                      onClick={togglePasswordVisibility}
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        padding: '0',
                        zIndex: 10
                      }}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        required={!isLogin}
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        className="btn position-absolute"
                        onClick={toggleConfirmPasswordVisibility}
                        style={{
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none',
                          padding: '0',
                          zIndex: 10
                        }}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                )}

                {isLogin && (
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-pink text-decoration-none">Forgot password?</a>
                  </div>
                )}

                {!isLogin && (
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${errors.agreeToTerms ? 'is-invalid' : ''}`}
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                      <label className="form-check-label">
                        I agree to the <a href="#" className="text-pink">Terms of Service</a> and{' '}
                        <a href="#" className="text-pink">Privacy Policy</a>
                      </label>
                      {errors.agreeToTerms && <div className="invalid-feedback d-block">{errors.agreeToTerms}</div>}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link text-pink p-0 ms-2"
                    onClick={switchMode}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </form>

              <span className="divider-text">or continue with</span>


              <div className="d-grid gap-2">
                <button className="btn btn-outline-dark">
                  <i className="fab fa-google me-2"></i>
                  Continue with Google
                </button>
                {/* <button className="btn btn-outline-primary">
                  <i className="fab fa-facebook-f me-2"></i>
                  Continue with Facebook
                </button> */}
              </div>

              {!isLogin && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6 className="text-pink">Why join Maitri?</h6>
                  <ul className="list-unstyled small mb-0">
                    <li className="mb-1">
                      <i className="fas fa-check text-success me-2"></i>
                      Personalized health recommendations
                    </li>
                    <li className="mb-1">
                      <i className="fas fa-check text-success me-2"></i>
                      24/7 AI health assistant
                    </li>
                    <li className="mb-1">
                      <i className="fas fa-check text-success me-2"></i>
                      Connect with healthcare professionals
                    </li>
                    <li className="mb-0">
                      <i className="fas fa-check text-success me-2"></i>
                      Safe community of women
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6 d-none d-md-block">
            <div className="auth-image-section text-center" style={{ marginTop: '180px' }}>
              <i className="fas fa-heart-pulse fa-8x text-pink opacity-75 mb-4"></i>
              <h3 className="text-pink mb-3">Your Health, Our Priority</h3>
              <p className="text-muted lead">
                Join thousands of women who trust Maitri for their health and wellness journey.
              </p>
              <div className="row mt-5">
                <div className="col-6 text-center">
                  <i className="fas fa-users fa-2x text-pink mb-2"></i>
                  <div className="fw-bold">10,000+</div>
                  <small className="text-muted">Happy Users</small>
                </div>
                <div className="col-6 text-center">
                  <i className="fas fa-user-md fa-2x text-pink mb-2"></i>
                  <div className="fw-bold">500+</div>
                  <small className="text-muted">Verified Doctors</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
