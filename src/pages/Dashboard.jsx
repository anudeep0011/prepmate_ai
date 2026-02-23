import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMessageSquare, FiUsers, FiStar, FiPlus, FiCommand, FiLogOut, FiArrowRight } from 'react-icons/fi';
import api from '../api/axios';
import './Dashboard.css';


// import { extractTextFromPDF } from '../utils/pdfParser'; // Deprecated in favor of backend parsing

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [interviews, setInterviews] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Interview Configuration State
    const [interviewData, setInterviewData] = useState({
        jobRole: '',
        jobDescription: '',
        experience: '',
        difficulty: 'Medium',
    });
    const [selectionMode, setSelectionMode] = useState('ai'); // 'ai' or 'custom'
    const [selectedRounds, setSelectedRounds] = useState([]);

    // Available Round Types
    const ROUND_TYPES = ['HR', 'Technical', 'Behavioral', 'Managerial', 'Coding'];

    const [resumeText, setResumeText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Auto-select rounds based on role when in AI mode
    useEffect(() => {
        if (selectionMode === 'ai' && interviewData.jobRole) {
            const role = interviewData.jobRole.toLowerCase();
            let recommended = ['HR', 'Behavioral']; // Base rounds

            if (role.includes('developer') || role.includes('engineer') || role.includes('coder')) {
                recommended.push('Technical', 'Coding');
            } else if (role.includes('manager') || role.includes('lead') || role.includes('head')) {
                recommended.push('Managerial', 'Technical');
            } else if (role.includes('analyst') || role.includes('scientist')) {
                recommended.push('Technical');
            }

            // Remove duplicates and ensure unique
            setSelectedRounds([...new Set(recommended)]);
        }
    }, [selectionMode, interviewData.jobRole]);

    // Fetch User & Interviews on Mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                setUser(userInfo);
                try {
                    const { data } = await api.get(`/interview/history/${userInfo._id}`);
                    setInterviews(data);
                } catch (error) {
                    console.error("Failed to fetch interviews", error);
                }
            } else {
                navigate('/login');
            }
        };

        fetchDashboardData();
    }, []);

    const handleRoundToggle = (round) => {
        if (selectionMode !== 'custom') return;
        if (selectedRounds.includes(round)) {
            setSelectedRounds(selectedRounds.filter(r => r !== round));
        } else {
            setSelectedRounds([...selectedRounds, round]);
        }
    };

    const handleInputChange = (e) => {
        setInterviewData({ ...interviewData, [e.target.name]: e.target.value });
    };

    const handleStartInterview = async (e) => {
        e.preventDefault();

        if (selectedRounds.length === 0) {
            alert("Please select at least one interview round.");
            return;
        }

        // Direct navigation with pasted text
        navigate('/interview', {
            state: {
                ...interviewData,
                resumeText, // Use the pasted text directly
                rounds: selectedRounds
            }
        });
    };

    return (
        <>

            {/* 1. New Interview Start Section (Hero) */}
            {/* 1. New Interview Start Section (Hero) */}
            <div className="hero-section">
                <div>
                    <h1 className="hero-title">Ready to Practice?</h1>
                    <p className="hero-subtitle">Start a new AI-driven mock interview tailored to your role.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiPlus /> Start New Interview
                </button>
            </div>

            {/* 2. Recent Interviews List */}
            <div className="section-header">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155' }}>Recent Interviews</h2>
            </div>

            <div className="filters-bar">
                <div className="search-filter">
                    <FiSearch />
                    <input type="text" placeholder="Filter by role..." />
                </div>
                <select className="status-filter">
                    <option>Status: All</option>
                    <option>Completed</option>
                    <option>Pending</option>
                </select>
            </div>

            <div className="meetings-list">
                {interviews.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                        <p>No interview history found. Start your first session above!</p>
                    </div>
                ) : (
                    interviews.map((interview) => (
                        <div key={interview._id} className="meeting-card" onClick={() => navigate(`/interview/${interview._id}`)} style={{ cursor: 'pointer' }}>
                            <div className="meeting-icon">
                                <FiUsers />
                            </div>
                            <div className="meeting-details">
                                <h3>{interview.jobRole}</h3>
                                <p>{interview.interviewType} • {new Date(interview.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="meeting-status">
                                <span className={`status-badge ${interview.score > 0 ? 'completed' : 'pending'}`} style={{
                                    background: interview.score > 0 ? '#dcfce7' : '#f1f5f9',
                                    color: interview.score > 0 ? '#166534' : '#64748b'
                                }}>
                                    {interview.score > 0 ? `Score: ${interview.score}/10` : 'Incomplete'}
                                </span>
                            </div>
                            <div className="meeting-meta">
                                <FiArrowRight style={{ color: '#94a3b8' }} />
                            </div>
                        </div>
                    ))
                )}
            </div>


            {/* New Interview Modal */}
            {
                showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Start New Interview</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleStartInterview}>
                                <div className="form-group">
                                    <label>Job Role</label>
                                    <input type="text" name="jobRole" required placeholder="e.g. Senior Frontend Engineer" onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Job Description</label>
                                    <textarea name="jobDescription" rows="3" placeholder="Paste the job description here..." onChange={handleInputChange}></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Years of Experience</label>
                                        <input type="number" name="experience" min="0" placeholder="e.g. 5" onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Difficulty</label>
                                        <select name="difficulty" value={interviewData.difficulty} onChange={handleInputChange}>
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Round Selection Strategy */}
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label>Interview Structure</label>
                                    <div className="radio-group" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="mode"
                                                checked={selectionMode === 'ai'}
                                                onChange={() => setSelectionMode('ai')}
                                            /> AI Recommended
                                        </label>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="mode"
                                                checked={selectionMode === 'custom'}
                                                onChange={() => setSelectionMode('custom')}
                                            /> Custom
                                        </label>
                                    </div>

                                    <div className="round-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {ROUND_TYPES.map(round => (
                                            <div
                                                key={round}
                                                onClick={() => handleRoundToggle(round)}
                                                className={`round-pill ${selectedRounds.includes(round) ? 'selected' : ''} ${selectionMode === 'ai' && !selectedRounds.includes(round) ? 'disabled' : ''}`}
                                            >
                                                {round}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Paste Resume Content</label>
                                    <textarea
                                        rows="6"
                                        placeholder="Paste your full resume text here..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        style={{ fontSize: '0.9rem' }}
                                    ></textarea>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                        {isUploading ? 'Uploading...' : 'Start Interview'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }



        </>
    );
};

export default Dashboard;
