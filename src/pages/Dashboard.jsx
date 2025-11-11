import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [prices, setPrices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get('/prices/range?min=1000&max=2000')
            .then(res => setPrices(res.data || []))
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.removeItem('jwt');
                    navigate('/login');
                }
            });
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Price Records</h2>
            {prices.length === 0 ? (
                <p>No records found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ marginTop: '10px', width: '80%' }}>
                    <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Price (cents)</th>
                        <th>Currency</th>
                        <th>Start</th>
                        <th>End</th>
                    </tr>
                    </thead>
                    <tbody>
                    {prices.map((p, i) => (
                        <tr key={i}>
                            <td>{p.skuId}</td>
                            <td>{p.effectivePriceCent}</td>
                            <td>{p.currency}</td>
                            <td>{p.startAtUtc}</td>
                            <td>{p.endAtUtc}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}