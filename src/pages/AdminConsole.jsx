import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { v4 as uuidv4 } from 'uuid';

export default function AdminConsole() {
    const [prices, setPrices] = useState([]);
    const [skuId, setSkuId] = useState('');
    const [endAtUtc, setEndAtUtc] = useState('');
    const [error, setError] = useState('');
    const [deleteSku, setDeleteSku] = useState('');
    const [editingItem, setEditingItem] = useState(null); // current edit line
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [createData, setCreateData] = useState({
        tenantId: '',
        storeId: '',
        skuId: '',
        effectivePriceCent: '',
        currency: 'CAD',
        startAtUtc: '',
        endAtUtc: '',
    });





    const handleFind = async () => {
        if (!skuId) {
            setError('Please enter a SKU ID');
            return;
        }

        try {
            const url = endAtUtc
                ? `/prices/lookup?skuId=${skuId}&at=${encodeURIComponent(endAtUtc)}`
                : `/prices/lookup?skuId=${skuId}`;

            const res = await api.get(url);

            if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
                setPrices([]);
                setError('No records found');
                return;
            }

            const data = Array.isArray(res.data) ? res.data : [res.data];
            setPrices(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('❌ Failed to fetch data');
        }
    };

    // helper function: decode JWT payload


    const handleDelete = async (e) => {
        e.preventDefault();
        if (!deleteSku) {
            setError('Please enter a SKU ID to delete');
            return;
        }

        try {
            await api.delete(`/prices/delete?skuId=${encodeURIComponent(deleteSku)}`);
            alert(`✅ Deleted all records for SKU: ${deleteSku}`);
            setDeleteSku('');
            handleFind(); // refresh table
        } catch (err) {
            console.error(err);
            setError('❌ Delete failed');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditForm({
            tenantId: item.key?.tenantId || '',
            storeId: item.key?.storeId || '',
            skuId: item.key?.skuId || '',
            userSegId: item.key?.userSegId || '',
            channelId: item.key?.channelId || '',
            effectivePriceCent: item.effectivePriceCent,
            currency: item.currency,
            endAtUtc: item.endAtUtc || '',
            priceComponent: JSON.stringify(item.priceComponent, null, 2),
            provenance: JSON.stringify(item.provenance, null, 2),
        });
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // ✅ define payload
            const payload = {
                intervalId: editingItem.intervalId,
                key: {
                    tenantId: editForm.tenantId,
                    storeId: editForm.storeId,
                    skuId: editForm.skuId,
                    userSegId: editForm.userSegId || null,
                    channelId: editForm.channelId || null,
                },
                effectivePriceCent: parseInt(editForm.effectivePriceCent),
                currency: editForm.currency,
                endAtUtc: editForm.endAtUtc || null,
                priceComponent: JSON.parse(editForm.priceComponent || '{}'),
                provenance: JSON.parse(editForm.provenance || '{}'),
            };

            // ✅ send update request
            await api.put(`/prices/${editingItem.intervalId}`, payload);

            alert('✅ Updated successfully');
            setShowModal(false);
            handleFind(); // refresh table
        } catch (err) {
            console.error(err);
            alert('❌ Update failed');
        }
    };

    // 🔹 Decode JWT payload helper
    function decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.warn('Failed to decode token:', e);
            return {};
        }
    }

// ✅ Automatically try to decode tenant/store from JWT
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            const payload = decodeJwt(token);
            if (payload.tenantId || payload.storeId) {
                setCreateData((prev) => ({
                    ...prev,
                    tenantId: payload.tenantId || '',
                    storeId: payload.storeId || '',
                }));
            }
        }
    }, []);

// ✅ CREATE new price record
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createData.tenantId || !createData.storeId || !createData.skuId) {
            alert('❗ Tenant ID, Store ID, and SKU ID are required.');
            return;
        }

        try {
            const body = [{
                intervalId: uuidv4(),
                key: {
                    tenantId: createData.tenantId,
                    storeId: createData.storeId,
                    skuId: createData.skuId,
                    userSegId: createData.userSegId || null,
                    channelId: createData.channelId || null,
                },
                startAtUtc: createData.startAtUtc,
                endAtUtc: createData.endAtUtc || null,
                effectivePriceCent: parseInt(createData.effectivePriceCent),
                currency: createData.currency,
                priceComponent: {
                    regularPrice: parseInt(createData.effectivePriceCent),
                    taxRate: 13,
                },
                provenance: {
                    source: 'manual_create',
                    updatedBy: 'admin',
                },
            }];

            await api.post('/prices', body);
            alert('✅ Created successfully');
            setCreateData({
                ...createData,
                skuId: '',
                effectivePriceCent: '',
                startAtUtc: '',
                endAtUtc: '',
            });
            handleFind(); // refresh table
        } catch (err) {
            console.error(err);
            alert('❌ Create failed');
        }
    };






    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
    };

    return (
        <div style={{padding: '20px'}}>
            <h2>Admin Console</h2>
            <button onClick={handleLogout} style={{float: 'right'}}>Logout</button>

            <div style={{marginTop: '50px'}}>
                <input
                    placeholder="SKU ID"
                    value={skuId}
                    onChange={(e) => setSkuId(e.target.value)}
                    style={{width: '200px'}}
                />
                <input
                    placeholder="At (optional)"
                    value={endAtUtc}
                    onChange={(e) => setEndAtUtc(e.target.value)}
                    style={{width: '250px', marginLeft: '10px'}}
                />
                <button onClick={handleFind} style={{marginLeft: '10px'}}>
                    Find
                </button>
            </div>

            <h3 style={{marginTop: '40px'}}>Create New Price Interval</h3>
            <form onSubmit={handleCreate}>
                <input
                    placeholder="Tenant ID"
                    value={createData.tenantId}
                    onChange={(e) => setCreateData({...createData, tenantId: e.target.value})}
                    style={{width: '120px', marginRight: '10px'}}
                />
                <input
                    placeholder="Store ID"
                    value={createData.storeId}
                    onChange={(e) => setCreateData({...createData, storeId: e.target.value})}
                    style={{width: '120px', marginRight: '10px'}}
                />
                <input
                    placeholder="SKU ID"
                    value={createData.skuId}
                    onChange={(e) => setCreateData({...createData, skuId: e.target.value})}
                    style={{width: '150px', marginRight: '10px'}}
                />
                <input
                    placeholder="User Segment ID (optional)"
                    value={createData.userSegId}
                    onChange={(e) => setCreateData({...createData, userSegId: e.target.value})}
                    style={{width: '150px', marginRight: '10px'}}
                />
                <input
                    placeholder="Channel ID (optional)"
                    value={createData.channelId}
                    onChange={(e) => setCreateData({...createData, channelId: e.target.value})}
                    style={{width: '150px', marginRight: '10px'}}
                />
                <input
                    placeholder="Effective Price (¢)"
                    type="number"
                    value={createData.effectivePriceCent}
                    onChange={(e) => setCreateData({...createData, effectivePriceCent: e.target.value})}
                    style={{width: '160px', marginRight: '10px'}}
                />
                <input
                    placeholder="Start UTC (e.g. 2025-01-01T00:00:00Z)"
                    value={createData.startAtUtc}
                    onChange={(e) => setCreateData({...createData, startAtUtc: e.target.value})}
                    style={{width: '250px', marginRight: '10px'}}
                />
                <input
                    placeholder="End UTC (optional)"
                    value={createData.endAtUtc}
                    onChange={(e) => setCreateData({...createData, endAtUtc: e.target.value})}
                    style={{width: '250px', marginRight: '10px'}}
                />
                <button type="submit">Create</button>
            </form>


            <h3 style={{marginTop: '40px'}}>Delete Price Records</h3>
            <form onSubmit={handleDelete}>
                <input
                    placeholder="SKU ID to delete"
                    value={deleteSku}
                    onChange={(e) => setDeleteSku(e.target.value)}
                    style={{width: '200px', marginRight: '10px'}}
                />
                <button type="submit" style={{backgroundColor: '#c0392b', color: 'white'}}>
                    Delete
                </button>
            </form>


            <table border="1" cellPadding="8" style={{marginTop: '20px', width: '100%'}}>
                <thead>
                <tr>
                    <th>Interval ID</th>
                    <th>Tenant</th>
                    <th>Store</th>
                    <th>SKU</th>
                    <th>Effective Price (¢)</th>
                    <th>Currency</th>
                    <th>Start UTC</th>
                    <th>End UTC</th>
                    <th>Actions</th>

                </tr>
                </thead>
                <tbody>
                {prices.length > 0 ? (
                    prices.map((p) => (
                        <tr key={p.intervalId}>
                            <td>{p.intervalId}</td>
                            <td>{p.key?.tenantId}</td>
                            <td>{p.key?.storeId}</td>
                            <td>{p.key?.skuId}</td>
                            <td>{p.effectivePriceCent}</td>
                            <td>{p.currency}</td>
                            <td>{p.startAtUtc}</td>
                            <td>{p.endAtUtc}</td>
                            <td>
                                <button onClick={() => handleEdit(p)}>Edit</button>
                            </td>

                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" style={{textAlign: 'center'}}>No records found</td>
                    </tr>
                )}
                </tbody>
            </table>

            {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '400px'
                    }}>
                        <h3>Edit Interval: {editingItem?.intervalId}</h3>
                        <label>Tenant ID:</label>
                        <input
                            value={editForm.tenantId}
                            onChange={(e) => setEditForm({...editForm, tenantId: e.target.value})}
                        /><br/>

                        <label>Store ID:</label>
                        <input
                            value={editForm.storeId}
                            onChange={(e) => setEditForm({...editForm, storeId: e.target.value})}
                        /><br/>

                        <label>SKU ID:</label>
                        <input
                            value={editForm.skuId}
                            onChange={(e) => setEditForm({...editForm, skuId: e.target.value})}
                        /><br/>

                        <label>User Segment ID:</label>
                        <input
                            value={editForm.userSegId}
                            onChange={(e) => setEditForm({...editForm, userSegId: e.target.value})}
                        /><br/>

                        <label>Channel ID:</label>
                        <input
                            value={editForm.channelId}
                            onChange={(e) => setEditForm({...editForm, channelId: e.target.value})}
                        /><br/>


                        <label>Effective Price (¢):</label><br/>
                        <input
                            type="number"
                            value={editForm.effectivePriceCent}
                            onChange={(e) => setEditForm({...editForm, effectivePriceCent: e.target.value})}
                        /><br/>

                        <label>End UTC:</label><br/>
                        <input
                            value={editForm.endAtUtc}
                            onChange={(e) => setEditForm({...editForm, endAtUtc: e.target.value})}
                        /><br/>

                        <label>Currency:</label><br/>
                        <input
                            value={editForm.currency}
                            onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                        /><br/>

                        <label>Provenance (JSON):</label><br/>
                        <textarea
                            rows="3"
                            value={editForm.provenance}
                            onChange={(e) => setEditForm({...editForm, provenance: e.target.value})}
                        ></textarea>

                        <div style={{marginTop: '10px'}}>
                            <button onClick={handleUpdate}>Save</button>
                            <button onClick={() => setShowModal(false)} style={{marginLeft: '10px'}}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
