import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 *
 * This component checks if a valid JWT token exists in localStorage.
 * If no token is found, it redirects the user to the login page.
 * Otherwise, it allows access to the protected page.
 */
export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('jwt');

    // If no JWT, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, allow access
    return children;
}
