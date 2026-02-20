import React, { useState } from 'react';
import { stoApi } from '../api/stoApi';
import { Search, Hash, MapPin, Eye } from 'lucide-react';

function STOSearch({ onViewDetail }) {
    const [filters, setFilters] = useState({
        diameter: '',
        materialClass: '',
        length: '',
        year: '',
        month: '',
        fromLocation: '',
        toLocation: ''
    });

    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const lengthOptions = ['', '6.0M', '5.5M', '5.0M', '4.5M', '4.0M'];
    const diameterOptions = [
        '', 100, 150, 200, 250, 300, 350, 400, 450, 500,
        600, 700, 800, 900, 1000, 1100, 1200
    ];
    const yearOptions = ['', '2025', '2026'];
    const monthOptions = ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const batch = (filters.year && filters.month) ? `${filters.year}${filters.month}` : '';
            const apiFilters = {
                diameter: filters.diameter,
                materialClass: filters.materialClass,
                length: filters.length,
                batch: batch,
                fromLocation: filters.fromLocation,
                toLocation: filters.toLocation
            };
            const data = await stoApi.search(apiFilters);
            setResults(data);
            setHasSearched(true);
        } catch (err) {
            alert('Search failed: ' + err.message);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="glass card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={24} /> Material Search
                </h2>
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group">
                        <label>Diameter</label>
                        <select
                            value={filters.diameter}
                            onChange={e => setFilters({ ...filters, diameter: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {diameterOptions.map(opt => <option key={opt} value={opt}>{opt || 'All'}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Class</label>
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <select
                                value={['K9', 'K7'].includes(filters.materialClass.toUpperCase()) || filters.materialClass === '' ? filters.materialClass.toUpperCase() : 'CUSTOM'}
                                onChange={e => setFilters({ ...filters, materialClass: e.target.value === 'CUSTOM' ? ' ' : e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="">All</option>
                                <option value="K9">K9</option>
                                <option value="K7">K7</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                            {(!['K9', 'K7', ''].includes(filters.materialClass.toUpperCase())) && (
                                <input
                                    value={filters.materialClass.trim()}
                                    onChange={e => setFilters({ ...filters, materialClass: e.target.value })}
                                    placeholder="Class"
                                    style={{ width: '100px' }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Length</label>
                        <select
                            value={filters.length}
                            onChange={e => setFilters({ ...filters, length: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {lengthOptions.map(opt => <option key={opt} value={opt}>{opt || 'All'}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Year</label>
                        <select
                            value={filters.year}
                            onChange={e => setFilters({ ...filters, year: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {yearOptions.map(opt => <option key={opt} value={opt}>{opt || 'All'}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Month</label>
                        <select
                            value={filters.month}
                            onChange={e => setFilters({ ...filters, month: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {monthOptions.map(opt => <option key={opt} value={opt}>{opt || 'All'}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>From</label>
                        <input
                            value={filters.fromLocation}
                            onChange={e => setFilters({ ...filters, fromLocation: e.target.value })}
                            placeholder="Location"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>To</label>
                        <input
                            value={filters.toLocation}
                            onChange={e => setFilters({ ...filters, toLocation: e.target.value })}
                            placeholder="Location"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Search size={18} /> {isSearching ? '...' : 'Search'}
                    </button>
                </form>
            </div>

            {hasSearched && (
                <div className="glass card fade-in">
                    <h3 style={{ marginBottom: '1rem' }}>Search Results ({results.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)' }}>
                                    <th style={{ padding: '0.75rem' }}>STO #</th>
                                    <th style={{ padding: '0.75rem' }}>Route</th>
                                    <th style={{ padding: '0.75rem' }}>Material</th>
                                    <th style={{ padding: '0.75rem' }}>Batch</th>
                                    <th style={{ padding: '0.75rem' }}>Qty</th>
                                    <th style={{ padding: '0.75rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{row.sto_number}</td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                            {row.from_location} → {row.to_location}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {row.diameter}mm {row.material_class} ({row.length}m)
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{row.batch}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--accent)' }}>{row.quantity_mtr} m</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => onViewDetail(row.sto_id)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                            >
                                                <Eye size={14} /> Full Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No materials match your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default STOSearch;
