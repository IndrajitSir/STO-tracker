import React, { useState, useEffect } from 'react';
import { stoApi } from '../api/stoApi';
import { X, Hash, MapPin, Warehouse, Trash2, Tag, Layers, Ruler } from 'lucide-react';

function STODetail({ id, onClose, onDelete }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                const result = await stoApi.getById(id);
                setData(result);
            } catch (err) {
                console.error('Failed to fetch detail', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (isLoading) return null;
    if (!data || !data.header) return null;

    const { header, items } = data;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="glass card fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white' }}>
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        STO Details: PO {header.po_number}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Created on {new Date(header.created_at).toLocaleString()}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shipping Route</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <MapPin size={20} style={{ color: 'var(--accent)' }} />
                                <div style={{ fontWeight: 600 }}>{header.from_location}</div>
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>→</div>
                            <div style={{ textAlign: 'center' }}>
                                <MapPin size={20} style={{ color: 'var(--accent)' }} />
                                <div style={{ fontWeight: 600 }}>{header.to_location}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>STO Reference</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <Hash size={18} /> {header.sto_number || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Created By</div>
                        <div style={{ fontWeight: 600 }}>{header.created_by}</div>
                    </div>
                </div>

                {header.remarks && (
                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Remarks</div>
                        <div>{header.remarks}</div>
                    </div>
                )}

                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Items List ({items.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '0.75rem' }}>Material Specification</th>
                                <th style={{ padding: '0.75rem' }}>Batch</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Layers size={14} className="text-muted" /> {item.diameter}mm C-{item.material_class}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Ruler size={14} className="text-muted" /> {item.length}m
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Tag size={14} className="text-muted" /> {item.batch || '—'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                                        {item.quantity_mtr} Mtr
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        onClick={() => onDelete(id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                    >
                        <Trash2 size={18} /> Delete STO
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-primary"
                        style={{ padding: '0.6rem 2rem' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default STODetail;
