import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';


const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/signup', { name, email, password });
            setSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (response) => {
            setError('');
            try {
                const { data } = await api.post('/auth/google', { token: response.access_token });
                localStorage.setItem('userInfo', JSON.stringify(data));
                setSuccess('Google Signup Successful! Redirecting...');
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } catch (error) {
                console.error(error);
                setError('Google Signup Failed');
            }
        },
        onError: () => setError('Google Signup Failed'),
    });

    const handleGoogleClick = () => {
        loginWithGoogle();
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Form Side */}
                <div className="auth-form-side">
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem', color: '#334155' }}>Let's get started</h1>
                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Create your account</p>
                    </div>

                    {success && <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                    }}>{success}</div>}

                    {error && <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                    }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem' }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem' }}>Email</label>
                            <input
                                type="email"
                                placeholder="m@example.com"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem' }}>Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem' }}>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                className="input-field"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.6rem', fontSize: '0.9rem' }} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="divider">Or continue with</div>

                    <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }} onClick={handleGoogleClick}>
                        <FcGoogle size={24} />
                        Sign up with Google
                    </button>

                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                        <Link to="/login" style={{ fontWeight: '600' }}>Sign in</Link>
                    </div>
                </div>

                {/* Image Side */}
                <div className="auth-image-side">
                    <div className="auth-overlay">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '1rem' }}>PrepMateAI</h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Join our community today.</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                By clicking continue, you agree to our Terms of Service and Privacy Policy
            </div>
        </div>
    );
};

export default Signup;
