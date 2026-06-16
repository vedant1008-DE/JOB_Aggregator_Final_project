import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdDelete, MdNotificationsActive, MdCheck, MdLocationOn } from 'react-icons/md';
import Loader from '../components/Loader';
import { fetchAlerts, createAlert, deleteAlert } from '../services/api';
import './AlertsPage.css';
import './LoginPage.css';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data || []);
    } catch (err) {
      toast.error('Failed to load alert preferences');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!keyword) {
      toast.error('Keyword is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        keyword,
        location: location || null,
        min_salary: minSalary ? parseInt(minSalary, 10) : null,
        email_enabled: emailEnabled,
      };
      await createAlert(payload);
      toast.success('Alert preference saved');
      setKeyword('');
      setLocation('');
      setMinSalary('');
      setEmailEnabled(true);
      loadAlerts();
    } catch (err) {
      toast.error(err.message || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(alertId) {
    try {
      await deleteAlert(alertId);
      setAlerts((prev) => prev.filter((item) => item.id !== alertId));
      toast.success('Alert preference deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete alert');
    }
  }

  return (
    <div className="alerts-page container">
      <h1 className="alerts-title">Job Alerts</h1>
      <div className="alerts-layout">
        <div className="alert-form-card glass fade-in">
          <h2 className="alert-form-title">Create Alert</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Keyword *</label>
              <div className="input-wrapper">
                <MdNotificationsActive className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder=" "
                  required
                />
                <span className="input-accent-line"></span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="input-wrapper">
                <MdLocationOn className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder=" "
                />
                <span className="input-accent-line"></span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Min Salary (INR)</label>
              <div className="input-wrapper">
                <span className="input-icon-text">₹</span>
                <input
                  type="number"
                  className="input-field"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder=" "
                />
                <span className="input-accent-line"></span>
              </div>
            </div>
            <div className="alert-toggle-group">
              <div className="toggle-switch-container">
                <input
                  type="checkbox"
                  id="email-enabled"
                  className="toggle-switch-input"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
                <label htmlFor="email-enabled" className="toggle-switch-label">
                  <span className="toggle-switch-switch"></span>
                </label>
              </div>
              <span className="toggle-label-text">Enable Email Notifications</span>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Alert'}
            </button>
          </form>
        </div>

        <div className="alerts-content">
          {loading ? (
            <Loader />
          ) : alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div key={alert.id} className="alert-item-card glass fade-in">
                  <div className="alert-info">
                    <span className="alert-keyword">{alert.keyword}</span>
                    <div className="alert-meta-tags">
                      {alert.location && (
                        <span className="badge alert-badge-custom">
                          <MdCheck className="animated-tick" />
                          {alert.location}
                        </span>
                      )}
                      {alert.min_salary && (
                        <span className="badge alert-badge-custom">
                          <MdCheck className="animated-tick" />
                          ₹{alert.min_salary.toLocaleString()}
                        </span>
                      )}
                      <span className="badge alert-badge-custom">
                        <MdCheck className="animated-tick" />
                        {alert.email_enabled ? 'Email On' : 'Email Off'}
                      </span>
                    </div>
                  </div>
                  <button className="alert-delete-btn" onClick={() => handleDelete(alert.id)}>
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass fade-in">
              <MdNotificationsActive style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h2 className="empty-state-title">No Alerts</h2>
              <p className="empty-state-desc">Create search alert parameters on the left to get notified whenever new job listings fit your preferences.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;
