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
import { uploadResume, sendChatMessage, getChatHistory, getResumeAnalysis } from '../services/api';
import './ResumePage.css';


function ResumePage() {
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI Job Assistant. Upload your resume, and I will recommend matching jobs and help you optimize your profile.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Upload/Analysis state
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [dashOffset, setDashOffset] = useState(251.2); // Full circle offset for score circle animation

  // Load existing chat and analysis on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load existing resume analysis
        const analysis = await getResumeAnalysis();
        setAnalysisData(analysis);
        setShowAnalysis(true);
        setDashOffset(251.2 * (1 - analysis.score / 100));
      } catch (e) {
        // No resume uploaded yet, that's okay
      }
      
      try {
        // Load chat history
        const history = await getChatHistory();
        if (history.history && history.history.length > 0) {
          const formattedHistory = history.history.map((msg, idx) => ({
            id: idx + 1,
            sender: msg.role,
            text: msg.message
          }));
          setMessages([
            { id: 0, sender: 'ai', text: 'Hello! I am your AI Job Assistant. Upload your resume, and I will recommend matching jobs and help you optimize your profile.' },
            ...formattedHistory
          ]);
        }
      } catch (e) {
        // No chat history yet
      }
    };
    loadInitialData();
  }, []);

  // Animate circular progress when analysis is shown
  useEffect(() => {
    if (showAnalysis && analysisData) {
      const timer = setTimeout(() => {
        setDashOffset(251.2 * (1 - analysisData.score / 100));
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDashOffset(251.2);
    }
  }, [showAnalysis, analysisData]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputVal.trim() || isLaunching || isSending) return;

    const userMessage = inputVal.trim();
    setInputVal('');
    
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMessage
    };
    setMessages(prev => [...prev, newUserMsg]);

    setIsLaunching(true);
    setIsSending(true);
    setTimeout(() => {
      setIsLaunching(false);
    }, 850);

    try {
      const response = await sendChatMessage(userMessage);
      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.response
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAnalyzing(true);
      setShowAnalysis(false);

      try {
        const result = await uploadResume(selectedFile);
        setAnalysisData(result.analysis);
        setAnalyzing(false);
        setShowAnalysis(true);
        toast.success('Resume analyzed successfully!');
      } catch (error) {
        setAnalyzing(false);
        toast.error(error.message || 'Failed to analyze resume');
      }
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
          {showAnalysis && !analyzing && analysisData && (
            <div className="analysis-results-card">
              <div className="analysis-header">
                <div className="analysis-header-info">
                  <h3>Analysis Complete</h3>
                  <p>Matches evaluated against active job listings</p>
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
                  <span className="score-text">{analysisData.score}%</span>
                </div>
              </div>

              {/* Skills Matches */}
              {analysisData.matched_skills && analysisData.matched_skills.length > 0 && (
                <div className="analysis-skills-section">
                  <span className="skills-title">Matched Skills</span>
                  <div className="skills-grid">
                    {analysisData.matched_skills.map((skill, idx) => (
                      <span key={idx} className="skills-badge match"><MdCheckCircle /> {skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {analysisData.missing_skills && analysisData.missing_skills.length > 0 && (
                <div className="analysis-skills-section">
                  <span className="skills-title">Missing / Demanded Skills</span>
                  <div className="skills-grid">
                    {analysisData.missing_skills.map((skill, idx) => (
                      <span key={idx} className="skills-badge missing"><MdCancel /> {skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback */}
              <div className="analysis-skills-section">
                <span className="skills-title">AI Optimization Recommendation</span>
                <div className="analysis-feedback-section">
                  <p className="analysis-feedback-text">
                    {analysisData.feedback}
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
