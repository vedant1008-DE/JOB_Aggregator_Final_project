import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import JobCard from '../components/JobCard';
import { SkeletonGrid } from '../components/Loader';
import { fetchSavedJobs, unsaveJob } from '../services/api';
import './SavedJobsPage.css';
import './DashboardPage.css';

function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function loadSavedJobs() {
    setLoading(true);
    try {
      const data = await fetchSavedJobs();
      setSavedJobs(data || []);
    } catch (err) {
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(jobId) {
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job_id !== jobId));
      toast.success('Job removed from saved list');
    } catch (err) {
      toast.error(err.message || 'Failed to remove job');
    }
  }

  return (
    <div className="saved-jobs-page container">
      <h1 className="saved-jobs-title">Saved Jobs</h1>
      {loading ? (
        <SkeletonGrid count={3} />
      ) : savedJobs.length > 0 ? (
        <div className="jobs-grid">
          {savedJobs.map((item) => (
            <JobCard
              key={item.job_id}
              job={item.jobs}
              isSaved={true}
              onSaveToggle={() => handleRemove(item.job_id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state glass fade-in">
          <h2 className="empty-state-title">No Saved Jobs</h2>
          <p className="empty-state-desc">Jobs you bookmark will show up here. Start exploring the job board to save jobs you like.</p>
        </div>
      )}
    </div>
  );
}

export default SavedJobsPage;
