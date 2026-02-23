import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { FiMessageSquare, FiUsers, FiStar, FiLogOut, FiCommand } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

import '../pages/Dashboard.css'; // Reuse Dashboard CSS for layout styles

const Layout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', margin: 0 }}>PrepMateAI</h2>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/" className="nav-item active">
                        <FiMessageSquare size={20} />
                        <span>Overview</span>
                    </Link>
                    <a href="#" className="nav-item">
                        <FiUsers size={20} />
                        <span>Agents</span>
                    </a>
                    <a href="#" className="nav-item upgrade">
                        <FiStar size={20} />
                        <span>Upgrade</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn" title="Logout">
                            <FiLogOut />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="dashboard-header">
                    <div className="command-palette">
                        <FiCommand className="cmd-icon" />
                        <input type="text" placeholder="Search for a command to run..." />
                        <span className="cmd-shortcut">Ctrl+K</span>
                    </div>

                    <div style={{ marginLeft: 'auto', marginRight: '1rem' }}>
                        {/* Theme Toggle Removed */}
                    </div>
                </header>

                <div className="content-body">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
