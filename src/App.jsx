import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminConsole from './pages/AdminConsole';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App.jsx
 *
 * This file defines the main routing structure of the frontend.
 * - Uses React Router to handle navigation between pages.
 * - Protects sensitive routes with a "ProtectedRoute" wrapper.
 * - Redirects any unknown path to the login page.
 */

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public route: Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected route: Dashboard (requires JWT token) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Protected route: Admin Console (requires JWT token) */}
                <Route
                    path="/console"
                    element={
                        <ProtectedRoute>
                            <AdminConsole />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all: redirect unknown routes to login */}
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}
