import axios from 'axios';

// create an axios instance
const api = axios.create({
    baseURL: '/api',
});

// Request interceptor: automatically attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;