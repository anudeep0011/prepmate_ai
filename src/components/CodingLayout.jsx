import React, { useState } from 'react';
import { FiClock, FiCheckCircle, FiHelpCircle, FiPlay, FiCpu } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import api from '../api/axios';

const CodingLayout = ({
    problem,
    step, // 1: Problem, 2: Approach, 3: Pseudo, 4: Code, 5: Complexity
    onNextStep,
    userCode,
    setUserCode,
    aiState,
    isMicOn,
    timeLeft
}) => {

    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('javascript');

    // Steps Configuration
    const steps = [
        { id: 1, label: 'Problem' },
        { id: 2, label: 'Approach' },
        { id: 3, label: 'Pseudo-Code' },
        { id: 4, label: 'Code' },
        { id: 5, label: 'Complexity' },
    ];

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Running...');
        try {
            const { data } = await api.post('/code/run', {
                language,
                code: userCode
            });

            if (data.run) {
                setOutput(data.run.output);
            } else {
                setOutput('Execution failed: ' + data.message);
            }

        } catch (error) {
            console.error(error);
            setOutput('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', background: '#0f172a', color: 'white' }}>

            {/* LEFT PANEL: Problem & Output */}
            <div style={{ width: '40%', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', background: '#1e293b' }}>
                    <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                        <FiCpu /> Coding Challenge
                    </h2>
                </div>

                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, lineHeight: '1.6' }}>
                    {problem ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{problem}</div>
                    ) : (
                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                            Waiting for AI to generate problem...
                        </div>
                    )}
                </div>

                {/* Output Panel (Visible during Coding step) */}
                {(step === 3 || step === 4) && (
                    <div style={{ height: '200px', borderTop: '1px solid #334155', background: '#020617', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '0.5rem 1rem', background: '#1e293b', fontSize: '0.8rem', fontWeight: 'bold', color: '#94a3b8' }}>OUTPUT</div>
                        <pre style={{ flex: 1, padding: '1rem', overflow: 'auto', margin: 0, fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0' }}>
                            {output || '// Output will appear here'}
                        </pre>
                    </div>
                )}


                {/* AI State Indicator (Mini) */}
                <div style={{ padding: '1rem', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={`ai-orb ${aiState}`} style={{ width: '40px', height: '40px' }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        {aiState === 'speaking' ? 'AI is speaking...' : (isMicOn ? 'Listening...' : 'Mic Off')}
                    </span>
                </div>
            </div>

            {/* RIGHT PANEL: Workspace */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Stepper Header */}
                <div style={{ display: 'flex', background: '#1e293b', borderBottom: '1px solid #334155' }}>
                    {steps.map((s, idx) => (
                        <div key={s.id} style={{
                            flex: 1,
                            padding: '1rem',
                            textAlign: 'center',
                            color: step >= s.id ? '#60a5fa' : '#64748b',
                            borderBottom: step === s.id ? '2px solid #60a5fa' : 'none',
                            fontWeight: step === s.id ? 'bold' : 'normal',
                            background: step === s.id ? '#1e293b' : 'transparent'
                        }}>
                            <span style={{ marginRight: '0.5rem', opacity: 0.6 }}>{idx + 1}.</span>
                            {s.label}
                        </div>
                    ))}
                </div>

                {/* Workspace Content */}
                <div style={{ flex: 1, padding: '0', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                    {/* Step 2: Approach (Text Area usually, but here relies on VOICE mostly, so optional text) */}
                    {step === 2 && (
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>🎙️</div>
                            <h3>Explain your approach</h3>
                            <p>Speak naturally. The AI is listening.</p>
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#334155', borderRadius: '8px' }}>
                                Tip: Start with brute force, then optimize.
                            </div>
                        </div>
                    )}

                    {/* Step 3/4: Monaco Editor */}
                    {(step === 3 || step === 4) && (
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language={language}
                            theme="vs-dark"
                            value={userCode}
                            onChange={(value) => setUserCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 20 },
                            }}
                        />
                    )}

                    {/* Step 5: Complexity */}
                    {step === 5 && (
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <h3>Complexity Analysis</h3>
                            <p>Discuss Time and Space complexity.</p>
                        </div>
                    )}

                </div>

                {/* Bottom Action Bar */}
                <div style={{ padding: '1rem', borderTop: '1px solid #334155', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiClock /> <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {(step === 3 || step === 4) && (
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{
                                    background: '#334155', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px'
                                }}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                        )}

                        {(step === 3 || step === 4) && (
                            <button
                                className="btn btn-outline"
                                onClick={handleRunCode}
                                disabled={isRunning}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', borderColor: '#475569' }}
                            >
                                {isRunning ? 'Running...' : <><FiPlay /> Run Code</>}
                            </button>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={onNextStep}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}
                        >
                            Next Step <FiCheckCircle />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CodingLayout;
