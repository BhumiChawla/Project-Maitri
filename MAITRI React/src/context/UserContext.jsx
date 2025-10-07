import { createContext, useContext, useState, useEffect } from 'react'
import ApiService from '../services/api'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load user data and token from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('maitriUser')
    const savedToken = localStorage.getItem('maitriToken')
    
    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await ApiService.login(email, password)
      
      const userData = {
        id: response.user.id,
        name: response.user.fullName,  // Map fullName from backend to name for frontend
        fullName: response.user.fullName, // Keep original field name too
        email: response.user.email,
        age: response.user.age,
        role: response.user.role,
        isActive: response.user.isActive,
        createdAt: response.user.createdAt  // Include creation date
      }
      
      setUser(userData)
      setToken(response.token)
      setIsAuthenticated(true)
      
      localStorage.setItem('maitriUser', JSON.stringify(userData))
      localStorage.setItem('maitriToken', response.token)
      
      return { success: true, data: response }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    setLoading(true)
    try {
      const response = await ApiService.register(userData)
      
      const userInfo = {
        id: response.user.id,
        name: response.user.fullName,  // Map fullName from backend to name for frontend
        fullName: response.user.fullName, // Keep original field name too
        email: response.user.email,
        age: response.user.age,
        role: response.user.role,
        isActive: response.user.isActive,
        createdAt: response.user.createdAt  // Include creation date
      }
      
      setUser(userInfo)
      setToken(response.token)
      setIsAuthenticated(true)
      
      localStorage.setItem('maitriUser', JSON.stringify(userInfo))
      localStorage.setItem('maitriToken', response.token)
      
      return { success: true, data: response }
    } catch (error) {
      console.error('Signup failed:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('maitriUser')
    localStorage.removeItem('maitriToken')
  }

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData }
    setUser(newUserData)
    localStorage.setItem('maitriUser', JSON.stringify(newUserData))
  }

  const checkEmailExists = async (email) => {
    try {
      const response = await ApiService.checkEmail(email)
      // Backend returns { success: true, available: boolean, message: string }
      return { exists: !response.available }
    } catch (error) {
      console.log('Email check error:', error.message)
      // For any errors, we'll assume email doesn't exist and let registration proceed
      console.warn('Email check failed, proceeding with registration:', error.message)
      return { exists: false }
    }
  }

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated,
      token,
      loading,
      login,
      signup,
      logout,
      updateUser,
      checkEmailExists
    }}>
      {children}
    </UserContext.Provider>
  )
}
