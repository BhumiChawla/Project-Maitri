import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const HomeNavbar = () => {
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
        
        <div className="navbar-nav ms-auto">
          {isAuthenticated ? (
            <div className="nav-item">
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
    </nav>
  )
}

export default HomeNavbar
