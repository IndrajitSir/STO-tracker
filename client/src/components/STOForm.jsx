import React, { useState } from 'react';
import { stoApi } from '../api/stoApi';
import { Plus, Trash2, Save, X } from 'lucide-react';

function STOForm({ onCreated, onCancel }) {
    const [header, setHeader] = useState({
        sto_number: '',
        from_location: 'U3',
        to_location: 'U3',
        remarks: '',
        created_by: localStorage.getItem('sto_user_name') || ''
    });

    const [userName, setUserName] = useState(localStorage.getItem('sto_user_name') || '');

    const handleUserChange = (name) => {
        setUserName(name);
        localStorage.setItem('sto_user_name', name);
    };

    const [items, setItems] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const defaultBatch = `${year}${month}`;
        return [{ diameter: 600, material_class: 'K9', length: 100, batch: defaultBatch, quantity_mtr: 0 }];
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const lengthOptions = [
        ...Array.from({ length: 9 }, (_, i) => 100 + i * 50), // 100, 150... 500
        ...Array.from({ length: 7 }, (_, i) => 600 + i * 100)  // 600, 700... 1200
    ];

    const addItem = () => {
        const lastBatch = items[items.length - 1]?.batch || '';
        setItems([...items, { diameter: 600, material_class: 'K9', length: 100, batch: lastBatch, quantity_mtr: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userName) {
            alert('Please enter your name first');
            return;
        }
        setIsSubmitting(true);
        try {
            const submissionData = {
                header: {
                    ...header,
                    created_by: userName,
                    po_number: '' // Removed from UI
                },
                items
            };
            await stoApi.create(submissionData);
            onCreated();
        } catch (err) {
            alert('Failed to create STO: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Create New STO</h2>
            <form onSubmit={handleSubmit}>
                <div className="glass card">
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Header Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>User Name (Your Name)</label>
                            <input
                                required
                                value={userName}
                                onChange={e => handleUserChange(e.target.value)}
                                placeholder="Enter your name"
                                style={{ width: '100%', borderColor: !userName ? 'var(--danger)' : 'var(--border-glass)' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>STO Number</label>
                            <input
                                value={header.sto_number}
                                onChange={e => setHeader({ ...header, sto_number: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>From Location</label>
                            <select
                                required
                                value={header.from_location}
                                onChange={e => setHeader({ ...header, from_location: e.target.value })}
                                style={{ width: '100%', background: 'gray', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.4rem' }}
                            >
                                <option value="U3">U3</option>
                                <option value="KHATPUKUR">KHATPUKUR</option>
                                <option value="MACKEIL">MACKEIL</option>
                                <option value="MANGALPUR">MANGALPUR</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>To Location</label>
                            <select
                                required
                                value={header.to_location}
                                onChange={e => setHeader({ ...header, to_location: e.target.value })}
                                style={{ width: '100%', background: 'gray', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.4rem' }}
                            >
                                <option value="U3">U3</option>
                                <option value="KHATPUKUR">KHATPUKUR</option>
                                <option value="MACKEIL">MACKEIL</option>
                                <option value="MANGALPUR">MANGALPUR</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Remarks</label>
                        <textarea
                            value={header.remarks}
                            onChange={e => setHeader({ ...header, remarks: e.target.value })}
                            style={{ width: '100%', height: '80px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', padding: '0.5rem' }}
                        />
                    </div>
                </div>

                <div className="glass card" style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', flex: 1 }}>Items</h3>
                        <button type="button" onClick={addItem} className="btn-primary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)' }}>
                                    <th style={{ padding: '0.75rem' }}>Diameter</th>
                                    <th style={{ padding: '0.75rem' }}>Class</th>
                                    <th style={{ padding: '0.75rem' }}>Length</th>
                                    <th style={{ padding: '0.75rem' }}>Batch</th>
                                    <th style={{ padding: '0.75rem' }}>Qty (Mtr)</th>
                                    <th style={{ padding: '0.75rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={item.diameter}
                                                onChange={e => updateItem(index, 'diameter', e.target.value)}
                                                style={{ width: '80px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                                                <select
                                                    value={['K9', 'K7'].includes(item.material_class.toUpperCase()) ? item.material_class.toUpperCase() : ''}
                                                    onChange={e => updateItem(index, 'material_class', e.target.value)}
                                                    style={{ width: '80px', background: 'gray', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
                                                >
                                                    <option value="">Custom</option>
                                                    <option value="K9">K9</option>
                                                    <option value="K7">K7</option>
                                                </select>
                                                {(!['K9', 'K7'].includes(item.material_class.toUpperCase())) && (
                                                    <input
                                                        value={item.material_class}
                                                        onChange={e => updateItem(index, 'material_class', e.target.value)}
                                                        placeholder="Class"
                                                        style={{ width: '80px' }}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <select
                                                value={item.length}
                                                onChange={e => updateItem(index, 'length', parseFloat(e.target.value))}
                                                style={{ width: '80px', background: 'gray', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
                                            >
                                                {lengthOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                value={item.batch}
                                                onChange={e => updateItem(index, 'batch', e.target.value)}
                                                style={{ width: '120px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number"
                                                value={item.quantity_mtr}
                                                onChange={e => updateItem(index, 'quantity_mtr', e.target.value)}
                                                style={{ width: '90px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onCancel} className="glass" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '8px' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save STO'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default STOForm;
