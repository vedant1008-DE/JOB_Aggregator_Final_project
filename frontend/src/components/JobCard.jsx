import { Link } from 'react-router-dom';
import { MdBookmark, MdBookmarkBorder, MdLocationOn, MdAttachMoney } from 'react-icons/md';
import './JobCard.css';

function JobCard({ job, isSaved, onSaveToggle }) {
  const { id, title, company, location, salary, job_type } = job;

  return (
    <div className="job-card glass fade-in">
      <div>
        <div className="job-card-header">
          <h3 className="job-card-title">
            <Link to={`/jobs/${id}`}>{title}</Link>
          </h3>
          <button
            className={`job-card-save-btn ${isSaved ? 'saved' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onSaveToggle(id);
            }}
          >
            {isSaved ? <MdBookmark /> : <MdBookmarkBorder />}
          </button>
        </div>
        <p className="job-card-company">{company}</p>
        <div className="job-card-meta">
          <div className="job-card-meta-item">
            <MdLocationOn />
            <span>{location || 'India'}</span>
          </div>
          {salary && (
            <div className="job-card-meta-item">
              <MdAttachMoney />
              <span>₹{salary.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
      <div className="job-card-tags">
        <span className="badge badge-blue">{job_type}</span>
      </div>
    </div>
  );
}

export default JobCard;
