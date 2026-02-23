import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiVideo, FiVideoOff, FiPhoneOff, FiMic, FiMicOff } from 'react-icons/fi';
import useNativeSpeech from '../hooks/useNativeSpeech';
import useAudioVisualizer from '../hooks/useAudioVisualizer';
import api from '../api/axios';
import './Interview.css';
import CodingLayout from '../components/CodingLayout';

const Interview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const interviewData = location.state || {}; // { jobRole, rounds, ... }

    // Core States
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [aiState, setAiState] = useState('idle'); // idle, listening, processing, speaking
    const [history, setHistory] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Dynamic Round State
    const rounds = interviewData.rounds || ['General'];
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [currentPhase, setCurrentPhase] = useState('Intro'); // Intro, Questioning, Feedback
    const [questionCount, setQuestionCount] = useState(0);
    const QUESTIONS_PER_ROUND = 3;

    // Coding Round Specific State
    const [codingStep, setCodingStep] = useState(1); // 1-5
    const [codingProblem, setCodingProblem] = useState('');
    const [userCode, setUserCode] = useState('');
    const [codingTimeLeft, setCodingTimeLeft] = useState(1200); // 20 mins

    // Custom Hooks
    // Strict Turn-Taking: Only listen when AI is NOT speaking
    const { transcript, isListening, resetTranscript } = useNativeSpeech(isMicOn && aiState === 'listening');
    const audioVolume = useAudioVisualizer(isMicOn && aiState === 'listening'); // Visuals also mute

    // Refs
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const proactiveTimerRef = useRef(null);
    const transcriptEndRef = useRef(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        if (!location.state) {
            navigate('/');
            return;
        }

        // Start Camera
        startCamera();

        // Initial Start
        if (isMicOn) setAiState('listening');

        // Initial Greeting
        const roundName = rounds[0];
        let greeting = `Hello! I am your AI interviewer for the ${interviewData.jobRole} role. We will start with the ${roundName} round.`;

        if (roundName === 'Coding') {
            greeting += " I will give you a problem to solve. We'll go through approach, pseudo-code using 5 steps. Ready?";
        } else {
            greeting += " I'll begin by asking a few questions. Ready?";
        }

        // Small delay
        setTimeout(() => {
            speak(greeting);
            addToHistory('AI', greeting);
        }, 1000);

        return () => {
            stopCamera();
            synth.cancel();
            clearTimeout(silenceTimerRef.current);
            clearTimeout(proactiveTimerRef.current);
        };
    }, []);

    // --- Interaction Logic (Silence Detection) ---
    useEffect(() => {
        if (!isMicOn || aiState !== 'listening') return;

        if (transcript) {
            // User is speaking
            clearTimeout(silenceTimerRef.current);
            clearTimeout(proactiveTimerRef.current);

            // Silence Timer: 1.5s silence -> End of turn
            silenceTimerRef.current = setTimeout(() => {
                if (transcript.trim().length > 1) {
                    handleUserResponse(transcript);
                }
            }, 1500);
        }
    }, [transcript, aiState, isMicOn]);

    // Timer for Coding
    useEffect(() => {
        if (rounds[currentRoundIndex] === 'Coding' && codingTimeLeft > 0) {
            const timer = setInterval(() => setCodingTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [currentRoundIndex, codingTimeLeft]);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleUserResponse = async (userText) => {
        setAiState('processing');
        addToHistory('User', userText);
        resetTranscript();

        // Determine Next Phase logic
        let nextPhase = currentPhase;
        let nextRoundIdx = currentRoundIndex;
        const currentRoundType = rounds[currentRoundIndex];

        // Normal Round Transition Logic
        if (currentRoundType !== 'Coding') {
            if (currentPhase === 'Intro') {
                nextPhase = 'Questioning';
                setCurrentPhase('Questioning');
            } else if (currentPhase === 'Questioning') {
                setQuestionCount(prev => prev + 1);
                if (questionCount >= QUESTIONS_PER_ROUND) {
                    if (currentRoundIndex < rounds.length - 1) {
                        nextRoundIdx++;
                        setCurrentRoundIndex(nextRoundIdx);
                        nextPhase = 'Intro';
                        setCurrentPhase('Intro');
                        setQuestionCount(0);
                    } else {
                        handleEndInterview();
                        return;
                    }
                }
            }
        }

        // --- CODING ROUND LOGIC HERE ---
        // We handle transitions manually via 'Next Step' button usually, 
        // but conversational transitions also happen.

        try {
            // Streaming Fetch with Extra Context for Coding
            const response = await fetch('/api/interview/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}`
                },
                body: JSON.stringify({
                    history: [...history, { sender: 'User', text: userText }],
                    context: interviewData,
                    roundType: rounds[nextRoundIdx],
                    roundPhase: nextPhase,
                    // Coding Step
                    codingStep: currentRoundType === 'Coding' ? codingStep : null,
                    userCode: currentRoundType === 'Coding' ? userCode : null
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let aiFullText = '';
            setAiState('speaking');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                aiFullText += chunk;

                // If this is the FIRST chunk and we are in Coding Step 1 (Problem), 
                // we might want to capture the text into 'codingProblem' state 
                // separate from speech.
                // For now, let's just speak everything, but if it starts with "Problem:", extract it?
                // Simpler: Just rely on voice for now, prompt upgrade later.

                const sentences = buffer.split(/([.?!]+[\s\n]+)/);
                if (sentences.length > 2) {
                    while (sentences.length > 2) {
                        const sPart = sentences.shift();
                        const sDelim = sentences.shift();
                        speak(sPart + sDelim, false);
                    }
                    buffer = sentences.join('');
                }
            }

            if (buffer.trim()) speak(buffer, true);
            else speak("", true);

            addToHistory('AI', aiFullText);

            // Special Handler: If AI generates the problem text, set it.
            // (Naive check: if step is 1 and text is long, assume it's problem)
            if (currentRoundType === 'Coding' && codingStep === 1) {
                setCodingProblem(aiFullText);
            }

        } catch (error) {
            console.error(error);
            setAiState('listening');
        }
    };

    const handleNextCodingStep = () => {
        if (codingStep < 5) {
            setCodingStep(prev => prev + 1);
            // Trigger AI to introduce next step
            // We could just speak a prompt here or let user trigger it.
        } else {
            // Coding Round Done
            if (currentRoundIndex < rounds.length - 1) {
                setCurrentRoundIndex(prev => prev + 1);
                setCurrentPhase('Intro');
                setCodingStep(1); // Reset for next time if any
            } else {
                handleEndInterview();
            }
        }
    };

    const speak = (text, isFinal = false) => {
        if (!text) {
            if (isFinal) {
                setAiState('listening');
                resetTranscript();
            }
            return;
        }

        setAiState('speaking');
        clearTimeout(proactiveTimerRef.current);

        const utterance = new SpeechSynthesisUtterance(text);
        let voices = synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft Zira'));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.1;

        if (isFinal) {
            utterance.onend = () => {
                setAiState('listening');
                resetTranscript();

                proactiveTimerRef.current = setTimeout(() => {
                    if (aiState === 'listening' && isMicOn) {
                        const nudge = "Are you still there?";
                        speak(nudge, true);
                    }
                }, 10000);
            };
        } else {
            utterance.onend = null;
        }

        synth.speak(utterance);
    };

    // ... Camera logic ...
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) { console.error(err); }
    };
    const stopCamera = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
    const toggleVideo = () => {
        if (streamRef.current) {
            const track = streamRef.current.getVideoTracks()[0];
            track.enabled = !track.enabled;
            setIsVideoOn(track.enabled);
        }
    };
    const toggleMic = () => setIsMicOn(p => !p);
    const addToHistory = (s, t) => setHistory(p => [...p, { sender: s, text: t }]);

    const handleEndInterview = async () => {
        setIsAnalyzing(true);
        synth.cancel();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await api.post('/interview/feedback', {
                history, context: interviewData, userId: userInfo._id
            });
            setResultData(data);
            setShowResult(true);
        } catch (error) { alert("Failed to generate report"); } finally { setIsAnalyzing(false); }
    };

    const isCodingRound = rounds[currentRoundIndex] === 'Coding';

    return (
        <div className="interview-container">
            {/* Sidebar Logic: Keep Sidebar even in coding or hide? Keep for consistency */}
            <aside className="interview-sidebar">
                <div className="interview-header">
                    <h2>Interview Session</h2>
                    <p style={{ marginBottom: '0.5rem' }}>{interviewData.jobRole}</p>
                    <div style={{ background: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                        Current Round: {rounds[currentRoundIndex]}
                    </div>
                </div>
                {/* Transcript */}
                <div className="interview-details" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0' }}>Transcript</h3>
                    <div className="transcript-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {history.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'User' ? '#2563eb' : '#334155',
                                padding: '0.5rem 0.8rem', borderRadius: '8px', maxWidth: '90%', fontSize: '0.85rem', lineHeight: '1.4'
                            }}>
                                <strong style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginBottom: '2px' }}>{msg.sender === 'User' ? 'You' : 'AI'}</strong>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>

                {/* Simplified Sidebar Footer */}
                <div style={{ marginTop: 'auto' }}>
                    <button className="end-interview-btn" onClick={handleEndInterview} disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : 'End Interview'}
                    </button>
                </div>
            </aside>

            {/* MAIN AREA SWITCHER */}
            {isCodingRound ? (
                <main style={{ flex: 1, position: 'relative' }}>
                    <CodingLayout
                        problem={codingProblem}
                        step={codingStep}
                        onNextStep={handleNextCodingStep}
                        userCode={userCode}
                        setUserCode={setUserCode}
                        aiState={aiState}
                        isMicOn={isMicOn}
                        timeLeft={codingTimeLeft}
                    />
                    {/* Floating Video for Coding Mode */}
                    <div className="user-video-container" style={{ width: '150px', height: '100px', bottom: '1rem', right: '1rem' }}>
                        <video ref={videoRef} autoPlay muted playsInline className="user-video" />
                    </div>
                </main>
            ) : (
                <main className="ai-area">
                    <div className="ai-avatar-container">
                        <div className={`ai-orb ${aiState}`}></div>
                        {aiState === 'listening' && <div className="listening-indicator">Listening...</div>}
                    </div>
                    <div className="user-video-container">
                        <video ref={videoRef} autoPlay muted playsInline className="user-video" />
                        {isMicOn && audioVolume > 5 && (
                            <div className="mic-indicator-overlay">
                                <div className="mic-bars">
                                    <span style={{ height: `${Math.min(audioVolume * 1.5, 30)}px` }}></span>
                                    <span style={{ height: `${Math.min(audioVolume * 2, 40)}px` }}></span>
                                    <span style={{ height: `${Math.min(audioVolume * 1.5, 30)}px` }}></span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="controls-bar">
                        <button className={`control-btn ${!isVideoOn ? 'active' : ''}`} onClick={toggleVideo}>{isVideoOn ? <FiVideo /> : <FiVideoOff />}</button>
                        <button className={`control-btn ${isMicOn ? 'mic-active' : ''}`} onClick={toggleMic}>{isMicOn ? <FiMic /> : <FiMicOff />}</button>
                        <button className="control-btn active" onClick={handleEndInterview} style={{ background: '#ef4444' }}><FiPhoneOff /></button>
                    </div>
                </main>
            )}

            {/* Result Modal */}
            {showResult && resultData && (
                <div className="result-modal">
                    {/* ... Same Result Modal ... */}
                    <div className="score-circle" style={{ '--score': resultData.score }}>
                        <span className="score-text">{resultData.score}</span>
                    </div>
                    <div className="report-actions">
                        <button className="btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
