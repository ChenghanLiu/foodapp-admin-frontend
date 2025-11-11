import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');


    if (token && !config.url.includes('/auth/login')) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
