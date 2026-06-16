import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  MdCloudUpload, 
  MdContactPage, 
  MdCheckCircle, 
  MdCancel, 
  MdInfo,
  MdAutorenew
} from 'react-icons/md';
import { IoIosPaperPlane } from 'react-icons/io';
import './ResumePage.css';


function ResumePage() {
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI Job Assistant. Upload your resume on the right, and I will recommend matching jobs and help you optimize your profile.'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Can you recommend some web developer jobs?'
    },
    {
      id: 3,
      sender: 'ai',
      text: 'I found a few matches based on web development:\n\n1. Full Stack Developer (React/Node) at TechCorp (Match: 87%)\n2. Frontend Engineer at WebFlow (Match: 79%)\n\nUpload your resume on the right to see direct matching scores and get personalized suggestions!'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  // Upload/Analysis state
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dashOffset, setDashOffset] = useState(251.2); // Full circle offset for score circle animation

  // Animate circular progress when analysis is shown
  useEffect(() => {
    if (showAnalysis) {
      const timer = setTimeout(() => {
        setDashOffset(251.2 * (1 - 0.87));
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDashOffset(251.2);
    }
  }, [showAnalysis]);

  function handleSendMessage(e) {
    e.preventDefault();
    if (!inputVal.trim() || isLaunching) return;

    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
    }, 850); // Flight & return duration

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputVal
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    // Simulated AI response
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: showAnalysis 
          ? "Based on your uploaded resume, you have strong matches in Javascript and Python. I suggest tailoring your resume's experience section to highlight your API integration work to boost scores further."
          : "Once you upload your resume on the right, I can scan your exact skills and compare them with our active database of jobs to give you targeted recommendations."
      };
      setMessages(prev => [...prev, aiReply]);
    }, 1000);
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAnalyzing(true);
      setShowAnalysis(false);

      // Simulate parsing & scoring
      setTimeout(() => {
        setAnalyzing(false);
        setShowAnalysis(true);
        toast.success('Resume analyzed successfully!');
      }, 2000);
    }
  }

  return (
    <div className="resume-page-layout fade-in">

        {/* Left Column (63%): Resume Upload & Analysis */}
        <div className="resume-upload-section">
          <h2 className="section-title">Resume Analyzer & Matcher</h2>

          {/* Upload Dropzone */}
          <label className="upload-dropzone">
            <MdCloudUpload className="upload-icon" />
            <span className="upload-text-main">
              {file ? file.name : 'Upload your resume'}
            </span>
            <span className="upload-text-sub">
              Supports PDF, DOCX up to 10MB
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={analyzing}
            />
          </label>

          {/* Analyzing / Loader state */}
          {analyzing && (
            <div className="resume-loader-container">
              <MdAutorenew className="resume-loader-icon" />
              <span className="resume-loader-text">Parsing skills & calculating match score...</span>
            </div>
          )}

          {/* Analysis Results */}
          {showAnalysis && !analyzing && (
            <div className="analysis-results-card">
              <div className="analysis-header">
                <div className="analysis-header-info">
                  <h3>Analysis Complete</h3>
                  <p>Matches evaluated against 125 active job listings</p>
                </div>
                
                {/* Score Circle */}
                <div className="score-circle-container">
                  <svg className="score-circle-svg">
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-blue)" />
                        <stop offset="100%" stopColor="var(--accent-purple)" />
                      </linearGradient>
                    </defs>
                    <circle className="score-circle-bg" cx="45" cy="45" r="40" />
                    <circle 
                      className="score-circle-fill" 
                      cx="45" 
                      cy="45" 
                      r="40" 
                      style={{ strokeDashoffset: dashOffset }}
                    />
                  </svg>
                  <span className="score-text">87%</span>
                </div>
              </div>

              {/* Skills Matches */}
              <div className="analysis-skills-section">
                <span className="skills-title">Matched Skills</span>
                <div className="skills-grid">
                  <span className="skills-badge match"><MdCheckCircle /> Python</span>
                  <span className="skills-badge match"><MdCheckCircle /> React.js</span>
                  <span className="skills-badge match"><MdCheckCircle /> FastAPI</span>
                  <span className="skills-badge match"><MdCheckCircle /> SQL</span>
                  <span className="skills-badge match"><MdCheckCircle /> Git</span>
                </div>
              </div>

              {/* Missing Skills */}
              <div className="analysis-skills-section">
                <span className="skills-title">Missing / Demanded Skills</span>
                <div className="skills-grid">
                  <span className="skills-badge missing"><MdCancel /> Docker</span>
                  <span className="skills-badge missing"><MdCancel /> AWS (EC2/S3)</span>
                  <span className="skills-badge missing"><MdCancel /> CI/CD</span>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="analysis-skills-section">
                <span className="skills-title">AI Optimization Recommendation</span>
                <div className="analysis-feedback-section">
                  <p className="analysis-feedback-text">
                    Your profile has a solid foundation in web frameworks. To qualify for senior developer roles in the current market, consider adding containerization (Docker) and cloud deployments (AWS) to your resume.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Animated Dividing Line */}
        <div className="animated-divider"></div>

        {/* Right Column (37%): AI Chat */}
        <div className="resume-chat-section">
          <div className="chat-header">
            <span className="chat-header-title">HirePulse Pivot AI</span>
          </div>

          <div className="chat-history">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                {msg.text.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>

          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask AI for job recommendations..."
            />
            <button type="submit" className={`chat-send-btn ${isLaunching ? 'launching' : ''}`} disabled={isLaunching}>
              <IoIosPaperPlane className="plane-icon" />
            </button>
          </form>
        </div>

      </div>
  );
}

export default ResumePage;
