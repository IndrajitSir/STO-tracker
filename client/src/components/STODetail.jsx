import React, { useState, useEffect } from 'react';
import { stoApi } from '../api/stoApi';
import { X, Hash, MapPin, Warehouse, Trash2, Tag, Layers, Ruler, ShieldCheck, History, Info } from 'lucide-react';

function STODetail({ id, onClose, onDelete, onSyncRequest }) {
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

    if (isLoading) return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass card" style={{ padding: '2rem' }}>
                <h3 className="fade-in">Loading STO Details...</h3>
            </div>
        </div>
    );
    if (!data || !data.header) return null;

    const { header, items } = data;
    const isSynced = items.some(i => i.sync_status && i.sync_status !== 'MANUAL');

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass card fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white' }}>
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            STO Details: PO {header.sto_number}
                            {isSynced && <ShieldCheck size={20} className="text-accent" />}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Created on {new Date(header.created_at).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => onSyncRequest(header.sto_number)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                        <ShieldCheck size={18} /> Update From SAP STO
                    </button>
                </div>

                {isSynced && (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                        <Info size={18} className="text-accent" />
                        <div>
                            This STO is <strong>synchronized with SAP</strong>.
                            Manual quantity updates are disabled.
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <History size={14} /> Last Sync: {new Date(items[0].last_synced_at).toLocaleString()}
                        </div>
                    </div>
                )}

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
                                <th style={{ padding: '0.75rem' }}>Status</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => {
                                const isSyncLocked = item.sync_status && item.sync_status !== 'MANUAL';
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: item.sync_status === 'CREATED_FROM_SAP' ? 'rgba(16,185,129,0.05)' : 'transparent' }}>
                                        <td style={{ padding: '1rem 0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Layers size={14} className="text-muted" /> {item.diameter}mm  {item.material_class}
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
                                        <td style={{ padding: '1rem 0.75rem' }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                background: item.sync_status === 'NOT_IN_SAP' ? 'rgba(239, 68, 68, 0.2)' :
                                                    item.sync_status === 'SYNCED' ? 'rgba(16, 185, 129, 0.2)' :
                                                        item.sync_status === 'CREATED_FROM_SAP' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: item.sync_status === 'NOT_IN_SAP' ? 'var(--danger)' :
                                                    item.sync_status === 'SYNCED' ? 'var(--accent)' :
                                                        item.sync_status === 'CREATED_FROM_SAP' ? 'var(--primary)' : 'var(--text-muted)'
                                            }}>
                                                {item.sync_status || 'MANUAL'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    disabled={isSyncLocked}
                                                    defaultValue={item.quantity_mtr}
                                                    id={`qty-${item.id}`}
                                                    style={{
                                                        width: '80px',
                                                        textAlign: 'right',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        color: isSyncLocked ? 'var(--text-muted)' : 'var(--accent)',
                                                        border: '1px solid var(--border-glass)',
                                                        borderRadius: '4px',
                                                        padding: '0.2rem',
                                                        opacity: isSyncLocked ? 0.6 : 1
                                                    }}
                                                />
                                                {!isSyncLocked && (
                                                    <button
                                                        onClick={async () => {
                                                            const newQty = parseFloat(document.getElementById(`qty-${item.id}`).value);
                                                            if (isNaN(newQty)) return;
                                                            try {
                                                                await stoApi.updateItemQuantity(id, item.id, newQty);
                                                                alert('Quantity updated successfully');
                                                            } catch (err) {
                                                                alert('Failed to update quantity: ' + err.message);
                                                            }
                                                        }}
                                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        Update
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
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
