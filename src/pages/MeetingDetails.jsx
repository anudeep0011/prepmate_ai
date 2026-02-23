import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiFileText, FiMessageCircle, FiCpu, FiUser, FiClock, FiBook, FiExternalLink, FiYoutube } from 'react-icons/fi';
import api from '../api/axios';
import './MeetingDetails.css';

const MeetingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary');
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ask AI State
    const [chatQuery, setChatQuery] = useState('');
    const [aiChatHistory, setAiChatHistory] = useState([]);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            // We reuse the history endpoint or fetch single if needed. 
            // Assuming we can filter or have a get-by-id endpoint. 
            // For now, let's assume we fetch all and find (prototype shortcut).
            // BETTER: Add a proper GET /interview/:id endpoint.
            // But since I didn't add it yet, I will use history endpoint and find.
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await api.get(`/interview/history/${userInfo._id}`);
            const found = data.find(i => i._id === id);
            setInterview(found);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load details", error);
        }
    };

    const handleAskAI = async (e) => {
        e.preventDefault();
        if (!chatQuery.trim()) return;

        const newMsg = { sender: 'User', text: chatQuery };
        setAiChatHistory([...aiChatHistory, newMsg]);
        setChatQuery('');

        // Mock AI response for now (or hook up to Gemini 'chat' endpoint with context)
        setTimeout(() => {
            setAiChatHistory(prev => [...prev, {
                sender: 'AI',
                text: `I'm analyzing the context of your interview about ${interview.jobRole}. Based on the transcript, you discussed... (Simulated Response)`
            }]);
        }, 1000);
    };

    if (loading) return <div className="loading-screen">Loading Report...</div>;
    if (!interview) return <div className="error-screen">Interview not found</div>;


    return (
        <div className="meeting-details-container" style={{ width: '100%' }}>
            <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/')} className="back-btn">
                    <FiArrowLeft /> Back
                </button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{interview.summary?.title || interview.jobRole}</h1>
                <span className="date-badge">
                    {new Date(interview.createdAt).toLocaleDateString()}
                </span>
            </div>

            <div className="report-content" style={{ padding: 0 }}>
                {/* Tabs */}
                <div className="tabs-nav">
                    <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                        Summary
                    </button>
                    <button className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`} onClick={() => setActiveTab('transcript')}>
                        Transcript
                    </button>
                    <button className={`tab-btn ${activeTab === 'recording' ? 'active' : ''}`} onClick={() => setActiveTab('recording')}>
                        Recording
                    </button>
                    <button className={`tab-btn ${activeTab === 'ask-ai' ? 'active' : ''}`} onClick={() => setActiveTab('ask-ai')}>
                        Ask AI
                    </button>
                    <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                        Resources
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-panel">
                    {/* RESOURCES TAB */}
                    {activeTab === 'resources' && (
                        <div className="resources-view">
                            <h3>Recommended Learning Resources</h3>
                            <p className="section-desc">Based on your weak areas in this interview, here are curated resources to help you improve.</p>

                            <div className="resources-grid">
                                {interview.summary?.resources?.length > 0 ? (
                                    interview.summary.resources.map((res, idx) => (
                                        <div key={idx} className="resource-card">
                                            <h4>{res.topic}</h4>

                                            <div className="resource-section">
                                                <h5><FiYoutube className="icon-red" /> Video Tutorials</h5>
                                                <ul>
                                                    {res.youtube_queries?.map((query, i) => (
                                                        <li key={i}>
                                                            <a
                                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="resource-link"
                                                            >
                                                                {query} <FiExternalLink />
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="resource-section">
                                                <h5><FiBook className="icon-blue" /> Articles & Docs</h5>
                                                <ul>
                                                    {res.article_queries?.map((query, i) => (
                                                        <li key={i}>
                                                            <a
                                                                href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="resource-link"
                                                            >
                                                                {query} <FiExternalLink />
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-resources">
                                        <p>No specific resources generated for this session.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* SUMMARY TAB */}
                    {activeTab === 'summary' && (
                        <div className="summary-view">
                            <div className="score-card">
                                <div className="mini-score-circle" style={{ '--score': interview.score }}>
                                    {interview.score}
                                </div>
                                <div>
                                    <h3>Performance Score</h3>
                                    <p>Based on clarity, relevancy, and depth.</p>
                                </div>
                            </div>

                            <section className="summary-section">
                                <h3>Overview</h3>
                                <p>{interview.summary?.overview || "No overview available."}</p>
                            </section>

                            <section className="summary-section">
                                <h3>Notes & Highlights</h3>
                                {interview.summary?.notes?.map((note, idx) => (
                                    <div key={idx} className="note-block">
                                        <h4>{note.topic}</h4>
                                        <ul>
                                            {note.details.map((point, i) => <li key={i}>{point}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </section>
                        </div>
                    )}

                    {/* TRANSCRIPT TAB */}
                    {activeTab === 'transcript' && (
                        <div className="transcript-view">
                            <div className="transcript-search">
                                <input type="text" placeholder="Search Transcript..." />
                            </div>
                            <div className="chat-log">
                                {interview.transcript?.map((msg, idx) => (
                                    <div key={idx} className={`chat-row ${msg.sender === 'User' ? 'user-row' : 'ai-row'}`}>
                                        <div className="avatar">
                                            {msg.sender === 'User' ? <FiUser /> : <FiCpu />}
                                        </div>
                                        <div className="message-content">
                                            <div className="sender-name">
                                                {msg.sender === 'User' ? 'You' : 'AI Interviewer'}
                                                <span className="timestamp">00:{String(idx * 5).padStart(2, '0')}</span> {/* Mock Time if not saved */}
                                            </div>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RECORDING TAB */}
                    {activeTab === 'recording' && (
                        <div className="recording-view">
                            <div className="video-placeholder">
                                <div className="play-icon-wrapper">
                                    <FiPlay />
                                </div>
                                <p>Recording Playback</p>
                                <span className="subtext">Audio & Video Replay</span>
                            </div>
                            <div className="recording-info">
                                <p>Full session recording is currently mock-simulated for history. (Implementation requires cloud storage).</p>
                            </div>
                        </div>
                    )}

                    {/* ASK AI TAB */}
                    {activeTab === 'ask-ai' && (
                        <div className="ask-ai-view">
                            <div className="ai-chat-window">
                                {aiChatHistory.length === 0 && <p className="empty-state">Ask me anything about this interview!</p>}
                                {aiChatHistory.map((msg, i) => (
                                    <div key={i} className={`chat-bubble ${msg.sender}`}>
                                        {msg.text}
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleAskAI} className="ai-input-area">
                                <input
                                    type="text"
                                    value={chatQuery}
                                    onChange={e => setChatQuery(e.target.value)}
                                    placeholder="Ask about your performance or specific topics..."
                                />
                                <button type="submit"><FiArrowLeft /></button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingDetails;
