import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/Loader';
import { fetchJobs, searchJobs, fetchSavedJobs, saveJob, unsaveJob } from '../services/api';
import './DashboardPage.css';

function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    loadJobs();
    loadSavedJobIds();
  }, [filters, page]);

  async function loadJobs() {
    setLoading(true);
    try {
      let data;
      if (filters) {
        data = await searchJobs(filters, page, perPage);
      } else {
        data = await fetchJobs(page, perPage);
      }
      setJobs(data.jobs || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedJobIds() {
    try {
      const saved = await fetchSavedJobs();
      setSavedJobIds(new Set(saved.map((item) => item.job_id)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveToggle(jobId) {
    try {
      if (savedJobIds.has(jobId)) {
        await unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        toast.success('Job removed from saved list');
      } else {
        await saveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        toast.success('Job saved successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  }

  function handleSearch(newFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleClear() {
    setFilters(null);
    setPage(1);
  }

  return (
    <div className="dashboard-page container">
      <h1 className="dashboard-title">Find Your Next Role</h1>
      <SearchBar onSearch={handleSearch} onClear={handleClear} />

      {loading ? (
        <SkeletonGrid count={6} />
      ) : jobs.length > 0 ? (
        <>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.has(job.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            hasNextPage={jobs.length === perPage}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="empty-state glass fade-in">
          <h2 className="empty-state-title">No Jobs Found</h2>
          <p className="empty-state-desc">We couldn't find any jobs matching your search criteria. Try removing some filters or starting a new query.</p>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
