import React, { useState } from 'react';
import { stoApi } from '../api/stoApi';
import { Plus, Trash2, Save, X } from 'lucide-react';

function STOForm({ onCreated, onCancel }) {
    const [header, setHeader] = useState({
        po_number: '',
        sto_number: '',
        from_location: '',
        to_location: '',
        remarks: '',
        created_by: 'Admin'
    });

    const [items, setItems] = useState([
        { diameter: 600, material_class: 'K9', length: 6.0, batch: '', quantity_mtr: 0 }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { diameter: 600, material_class: 'K9', length: 6.0, batch: '', quantity_mtr: 0 }]);
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
        setIsSubmitting(true);
        try {
            await stoApi.create({ header, items });
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
                            <label>PO Number</label>
                            <input
                                required
                                value={header.po_number}
                                onChange={e => setHeader({ ...header, po_number: e.target.value })}
                                style={{ width: '100%' }}
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
                            <input
                                required
                                value={header.from_location}
                                onChange={e => setHeader({ ...header, from_location: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>To Location</label>
                            <input
                                required
                                value={header.to_location}
                                onChange={e => setHeader({ ...header, to_location: e.target.value })}
                                style={{ width: '100%' }}
                            />
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
                                            <input
                                                value={item.material_class}
                                                onChange={e => updateItem(index, 'material_class', e.target.value)}
                                                style={{ width: '80px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <input
                                                type="number" step="0.1"
                                                value={item.length}
                                                onChange={e => updateItem(index, 'length', e.target.value)}
                                                style={{ width: '80px' }}
                                            />
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
