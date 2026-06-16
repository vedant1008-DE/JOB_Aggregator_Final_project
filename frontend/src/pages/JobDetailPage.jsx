import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdArrowBack, MdLocationOn, MdAttachMoney, MdBookmark, MdBookmarkBorder, MdLaunch } from 'react-icons/md';
import Loader from '../components/Loader';
import { fetchJob, fetchSavedJobs, saveJob, unsaveJob } from '../services/api';
import './JobDetailPage.css';

function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  async function loadJobDetails() {
    setLoading(true);
    try {
      const data = await fetchJob(id);
      setJob(data);
      const saved = await fetchSavedJobs();
      setIsSaved(saved.some((item) => item.job_id === parseInt(id, 10)));
    } catch (err) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToggle() {
    try {
      if (isSaved) {
        await unsaveJob(id);
        setIsSaved(false);
        toast.success('Job removed from saved list');
      } else {
        await saveJob(id);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  }

  if (loading) return <Loader />;
  if (!job) return <div className="job-detail-page container">Job not found</div>;

  return (
    <div className="job-detail-page container">
      <Link to="/dashboard" className="back-link">
        <MdArrowBack /> Back to Dashboard
      </Link>
      <div className="job-detail-card glass fade-in">
        <div className="job-detail-header">
          <div>
            <h1 className="job-detail-title">{job.title}</h1>
            <p className="job-detail-company">{job.company}</p>
            <div className="job-detail-meta">
              <div className="job-card-meta-item">
                <MdLocationOn />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="job-card-meta-item">
                  <MdAttachMoney />
                  <span>₹{job.salary.toLocaleString()}</span>
                </div>
              )}
              <span className="badge badge-blue">{job.job_type}</span>
            </div>
          </div>
          <div className="job-detail-actions">
            <button className="btn-ghost" onClick={handleSaveToggle}>
              {isSaved ? <MdBookmark /> : <MdBookmarkBorder />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
            {job.job_url && (
              <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Apply Now <MdLaunch />
              </a>
            )}
          </div>
        </div>
        <div className="job-detail-body">
          <h2 className="job-detail-section-title">Job Description</h2>
          <div className="job-detail-description">
            {job.description || 'No description provided.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;
