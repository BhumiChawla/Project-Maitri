// Import React Router and styling libraries
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './App.css'

// Import all page components
import HomeNavbar from './components/HomeNavbar'
import NavigationNavbar from './components/NavigationNavbar'
import Home from './components/Home'
import Chatbot from './components/Chatbot'
import DietPlanner from './components/DietPlanner'
import Doctors from './components/Doctors'
import Community from './components/Community'
import Login from './components/Login'
import Profile from './components/Profile'
import NotFound from './components/NotFound'
import Footer from './components/Footer'

// Import user context to track logged in user
import { UserProvider } from './context/UserContext'

function AppContent() {
  const location = useLocation()
  const hiddenFooterRoutes = ['/chatbot']
  
  // Check if current path matches any defined routes
  const definedRoutes = ['/', '/home', '/chatbot', '/diet-planner', '/doctors', '/community', '/login', '/profile']
  const is404Page = !definedRoutes.includes(location.pathname)
  
  const shouldHideFooter = hiddenFooterRoutes.includes(location.pathname) || is404Page
  
  // Show different navbars based on current page
  const isHomePage = location.pathname === '/' || location.pathname === '/home'

  return (
    <div className="App">
      {!is404Page && (isHomePage ? <HomeNavbar /> : <NavigationNavbar />)}
      <Routes>
        {/* Define all application routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/diet-planner" element={<DietPlanner />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        {/* Catch all undefined routes and show 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!shouldHideFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  )
}

export default App
