import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { MdDashboard, MdBookmark, MdNotifications, MdPerson, MdLightMode, MdDarkMode, MdContactPage } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';


function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-container navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="HirePulse" className="navbar-logo-img" />
        </Link>

        {isAuthenticated && (
          <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        )}

        {isAuthenticated ? (
          <>
            <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
              <NavLink to="/dashboard" title="Dashboard" onClick={() => setMobileOpen(false)}>
                <MdDashboard /> <span className="nav-text">Dashboard</span>
              </NavLink>
              <NavLink to="/saved" title="Saved" onClick={() => setMobileOpen(false)}>
                <MdBookmark /> <span className="nav-text">Saved</span>
              </NavLink>
              <NavLink to="/alerts" title="Alerts" onClick={() => setMobileOpen(false)}>
                <MdNotifications /> <span className="nav-text">Alerts</span>
              </NavLink>
              <NavLink to="/resume" title="Resume" onClick={() => setMobileOpen(false)}>
                <MdContactPage /> <span className="nav-text">Resume</span>
              </NavLink>
            </div>

            <div className="navbar-actions" ref={dropdownRef}>
              <div className="navbar-user-wrapper">
                <div 
                  className="navbar-user" 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className="navbar-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="navbar-username">{user?.username || 'User'}</span>
                </div>

                {profileOpen && (
                  <div className="navbar-profile-dropdown glass">
                    <div className="dropdown-user-info">
                      <div className="dropdown-username">{user?.username || 'User'}</div>
                      <div className="dropdown-email">{user?.email || ''}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to="/profile" 
                      className="dropdown-item" 
                      onClick={() => setProfileOpen(false)}
                    >
                      <MdPerson /> Profile
                    </Link>
                  </div>
                )}
              </div>
              <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
                {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
              </button>
            </div>
          </>
        ) : (
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
