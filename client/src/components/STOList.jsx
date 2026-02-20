import React from 'react';
import { Eye, Trash2, Calendar, MapPin, Hash, Search } from 'lucide-react';

function STOList({ stos, isLoading, onViewDetail, onDelete }) {
    const [fromFilter, setFromFilter] = React.useState('');
    const [toFilter, setToFilter] = React.useState('');

    const LOCATION_OPTIONS = ['', 'U3', 'Khatpukur', 'Mackeil', 'Mangalpur'];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="loader">Loading STOs...</div>
            </div>
        );
    }

    if (!Array.isArray(stos) || stos.length === 0) {
        return (
            <div className="glass card" style={{ textAlign: 'center', padding: '4rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                    {!Array.isArray(stos) ? 'Invalid data received from server.' : 'No STOs found. Create one to get started.'}
                </p>
            </div>
        );
    }

    const filteredStos = stos.filter(sto => {
        const fromMatch = (sto.from_location || '').toLowerCase().includes(fromFilter.toLowerCase());
        const toMatch = (sto.to_location || '').toLowerCase().includes(toFilter.toLowerCase());
        return fromMatch && toMatch;
    });

    return (
        <div className="fade-in">
            <div className="glass card" style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <Search size={20} className="text-muted" />
                <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <select
                            value={fromFilter}
                            onChange={e => setFromFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                        >
                            <option value="">All From Locations</option>
                            {LOCATION_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <select
                            value={toFilter}
                            onChange={e => setToFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                        >
                            <option value="">All To Locations</option>
                            {LOCATION_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>
                    {filteredStos.length} of {stos.length}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredStos.map((sto) => (
                    <div key={sto.id} className="glass card sto-card" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                                <Hash size={16} /> PO: {sto.sto_number}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Calendar size={14} /> {new Date(sto.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>From</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MapPin size={14} /> {sto.from_location}
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-muted)' }}>→</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>To</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <MapPin size={14} /> {sto.to_location}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                            <button
                                onClick={() => onViewDetail(sto.id)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}
                            >
                                <Eye size={16} /> Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default STOList;
