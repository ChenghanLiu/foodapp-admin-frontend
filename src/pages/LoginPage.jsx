import { useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Send login request
            const res = await api.post('/auth/login', { username, password });

            // ✅ Backend returns a raw JWT string (not JSON)
            const token = res.data;

            if (token && token.startsWith('ey')) {
                localStorage.setItem('jwt', token);
                navigate('/console');
            } else {
                setError('Login failed: invalid token returned');
            }
        } catch (err) {
            console.error(err);
            setError('Invalid username or password');
        }
    };

    return (
        <div style={{ marginTop: '100px', textAlign: 'center' }}>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '8px', margin: '5px', width: '200px' }}
                /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '8px', margin: '5px', width: '200px' }}
                /><br />
                <button type="submit" style={{ padding: '8px 20px', marginTop: '10px' }}>
                    Login
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
