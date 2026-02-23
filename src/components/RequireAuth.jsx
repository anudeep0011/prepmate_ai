import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RequireAuth = () => {
    const userInfo = localStorage.getItem('userInfo');
    const location = useLocation();

    return userInfo ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default RequireAuth;
