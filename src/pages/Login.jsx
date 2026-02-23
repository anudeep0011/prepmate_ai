import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Login Failed');
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
                navigate('/');
            } catch (error) {
                console.error(error);
                setError('Google Login Failed');
            }
        },
        onError: () => setError('Google Login Failed'),
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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Welcome</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Login to your account</p>
                    </div>



                    {error && <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                placeholder="m@example.com"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider">Or continue with</div>

                    <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }} onClick={handleGoogleClick}>
                        <FcGoogle size={24} />
                        Login with Google
                    </button>

                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                        <Link to="/signup" style={{ fontWeight: '600' }}>Sign up</Link>
                    </div>
                </div>

                {/* Image Side */}
                <div className="auth-image-side">
                    <div className="auth-overlay">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '1rem' }}>PrepMateAI</h2>
                        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Your AI companion for preparation.</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                By clicking continue, you agree to our Terms of Service and Privacy Policy
            </div>
        </div>
    );
};

export default Login;
