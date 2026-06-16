import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import './ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        navigate(-1); // Navigate back to the previous page (e.g., dashboard, resume)
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  if (!user) return null;

  const joinedDate = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="profile-page container">
      <div className="profile-card glass fade-in" ref={cardRef}>
        <div className="profile-avatar-large">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="profile-username">{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-detail-label">User ID</span>
            <span className="profile-detail-val">#{user.id}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Member Since</span>
            <span className="profile-detail-val">{joinedDate}</span>
          </div>
        </div>
        <button className="btn-ghost" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', width: '100%' }} onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
