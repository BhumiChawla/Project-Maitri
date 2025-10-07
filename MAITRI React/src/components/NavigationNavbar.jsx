import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const NavigationNavbar = () => {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useUser()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <nav className="navbar navbar-expand-lg fixed-top transparent-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-heart text-pink"></i> Maitri
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' || location.pathname === '/home' ? 'active' : ''}`} 
                to="/home"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/chatbot' ? 'active' : ''}`} 
                to="/chatbot"
              >
                AI Assistant
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/diet-planner' ? 'active' : ''}`} 
                to="/diet-planner"
              >
                Diet Planner
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/doctors' ? 'active' : ''}`} 
                to="/doctors"
              >
                Find Doctors
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`} 
                to="/community"
              >
                Community
              </Link>
            </li>
          </ul>
          <div className="navbar-nav">
            {isAuthenticated ? (
              <div className="nav-item dropdown">
                <Link 
                  to="/profile"
                  className="nav-link d-flex align-items-center" 
                  style={{ textDecoration: 'none' }}
                  title={`${user?.name || 'User'} - Click to view profile`}
                >
                  <div 
                    className="user-avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ffc0cb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)'
                      e.target.style.backgroundColor = '#ff69b4'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.backgroundColor = '#ffc0cb'
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </Link>
              </div>
            ) : (
              <Link className="nav-link profile-icon" to="/login">
                <i className="fas fa-user-circle fa-2x text-pink"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavigationNavbar
