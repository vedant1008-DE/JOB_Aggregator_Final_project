import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdOutlineMail, MdOutlineLock, MdOutlinePersonOutline, MdOutlineShield, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { registerUser } from '../services/api';
import './RegisterPage.css';
import './LoginPage.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await registerUser(username, email, password);
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page auth-page">
      <div className="auth-card-glow-bg"></div>
      <div className="auth-layout-wrapper fade-in">
        {/* Left Side: Floating Content */}
        <div className="auth-floating-info">
          <span className="auth-info-tag">START YOUR JOURNEY</span>
          <h2 className="auth-info-title">Discover Opportunities Suited For You</h2>
          <p className="auth-info-subtitle">
            Join HirePulse to track listings, manage application statuses, and automate alerts across the web.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="feature-dot"></span>
              <span>Filter by tags, companies, and roles</span>
            </div>
            <div className="auth-feature-item">
              <span className="feature-dot"></span>
              <span>Receive notifications for matching alerts</span>
            </div>
            <div className="auth-feature-item">
              <span className="feature-dot"></span>
              <span>Secure job application tracking dashboard</span>
            </div>
          </div>
        </div>

        <div className="auth-card glass">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Get started with your job search</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <MdOutlinePersonOutline className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <MdOutlineMail className="input-icon" />
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <MdOutlineLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {password && (
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
                  </button>
                )}
              </div>
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account?
            <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
