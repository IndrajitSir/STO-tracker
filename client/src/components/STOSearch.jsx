import React, { useState } from 'react';
import { stoApi } from '../api/stoApi';
import { Search, Hash, MapPin, Eye } from 'lucide-react';

function STOSearch({ onViewDetail }) {
    const [filters, setFilters] = useState({
        diameter: '',
        materialClass: '',
        length: '',
        batch: ''
    });

    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const data = await stoApi.search(filters);
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
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group">
                        <label>Diameter</label>
                        <input
                            value={filters.diameter}
                            onChange={e => setFilters({ ...filters, diameter: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="e.g. 600, 700"
                        />
                    </div>
                    <div className="form-group">
                        <label>Class</label>
                        <input
                            value={filters.materialClass}
                            onChange={e => setFilters({ ...filters, materialClass: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="e.g. K9, K7"
                        />
                    </div>
                    <div className="form-group">
                        <label>Length</label>
                        <input
                            value={filters.length}
                            onChange={e => setFilters({ ...filters, length: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="e.g. 6.0, 5.5"
                        />
                    </div>
                    <div className="form-group">
                        <label>Batch</label>
                        <input
                            value={filters.batch}
                            onChange={e => setFilters({ ...filters, batch: e.target.value })}
                            style={{ width: '100%' }}
                            placeholder="e.g. 202512, 202511"
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
                                    <th style={{ padding: '0.75rem' }}>PO #</th>
                                    <th style={{ padding: '0.75rem' }}>Route</th>
                                    <th style={{ padding: '0.75rem' }}>Material</th>
                                    <th style={{ padding: '0.75rem' }}>Batch</th>
                                    <th style={{ padding: '0.75rem' }}>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem', color: 'var(--primary)' }}>{row.po_number}</td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                                            {row.from_location} → {row.to_location}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {row.diameter}mm C-{row.material_class} ({row.length}m)
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{row.batch}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{row.quantity_mtr} m</td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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
