import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdOutlineMail, MdOutlineLock, MdOutlineShield, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.access_token);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-glow-bg"></div>
      <div className="auth-layout-wrapper fade-in">
        {/* Left Side: Floating Content */}
        <div className="auth-floating-info">
          <span className="auth-info-tag">AGGREGATED JOB INSIGHTS</span>
          <h2 className="auth-info-title">Your Next Career Move Starts Here</h2>
          <p className="auth-info-subtitle">
            We track thousands of job listings across major platforms so you can find the perfect opportunity in real-time.
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
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to search and track jobs</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-footer">
            Don't have an account?
            <Link to="/register" className="auth-link">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
