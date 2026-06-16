import { Link } from 'react-router-dom';
import { MdOutlineSecurity, MdOutlineDns, MdOutlineHub } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-grid-section container">
        <div className="hero-left">
          <h1 className="hero-main-title">
            The Smart Way <br />
            To Hunt <span>Careers</span>
          </h1>
          <p className="hero-description">
            HirePulse continuously aggregates, deduplicates, and filters active roles from multiple primary job platforms. Stop browsing ten tabs. Find your next role in one.
          </p>

          <div className="hero-cta-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary-glow">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary-glow">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-primary-glow">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      {/* 2. DYNAMIC PROCESS TIMELINE */}
      <section className="workflow-section container">
        <div className="section-header-left">
          <span className="subtitle-tag">HOW HIREPULSE WORKS</span>
          <h2 className="section-main-title">Continuous Aggregation Pipeline</h2>
          <p className="section-desc-para">We automate the repetitive, tedious parts of job hunting, giving you clean data without duplicates.</p>
        </div>

        <div className="workflow-steps-layout">
          <div className="workflow-step-card glass">
            <div className="step-icon-box">
              <MdOutlineDns />
            </div>
            <h3 className="step-title">Automated Scrapes</h3>
            <p className="step-text">Our backend executes cron-job scrapers targeting Internshala, TimesJobs, Himalayas, and Remotive every few hours.</p>
          </div>

          <div className="workflow-step-card glass">
            <div className="step-icon-box">
              <MdOutlineHub />
            </div>
            <h3 className="step-title">Deduplication</h3>
            <p className="step-text">Smart hash algorithms analyze titles, descriptions, and locations to filter duplicate entries across platforms.</p>
          </div>

          <div className="workflow-step-card glass">
            <div className="step-icon-box">
              <MdOutlineSecurity />
            </div>
            <h3 className="step-title">Match Alerts</h3>
            <p className="step-text">Specify keywords or filters; our notification engine monitors feeds and notifies you when a perfect match lands.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
