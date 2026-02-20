import React, { useState, useEffect } from 'react';
import { stoApi } from './api/stoApi';
import STOForm from './components/STOForm';
import STOList from './components/STOList';
import STOSearch from './components/STOSearch';
import STODetail from './components/STODetail';
import SAPSyncModal from './components/SAPSyncModal';
import { Layout, Plus, Search, List as ListIcon, Warehouse } from 'lucide-react';

function App() {
    const [view, setView] = useState('list'); // list, create, search
    const [selectedStoId, setSelectedStoId] = useState(null);
    const [stos, setStos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // SAP Sync State
    const [sapSyncData, setSapSyncData] = useState({ isOpen: false, stoNumber: '' });

    useEffect(() => {
        if (view === 'list') {
            loadStos();
        }
    }, [view]);

    const loadStos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await stoApi.getAll();
            setStos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load STOs', err);
            setError(err.message);
            setStos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStoCreated = () => {
        setView('list');
    };

    const handleViewDetail = (id) => {
        setSelectedStoId(id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this STO?')) {
            await stoApi.delete(id);
            loadStos();
        }
    };

    const openSapSync = (stoNumber) => {
        setSapSyncData({ isOpen: true, stoNumber });
    };

    const handleSyncComplete = (summary) => {
        alert(`SAP Sync Complete:\n${summary.updated} updated\n${summary.inserted} inserted\n${summary.zeroed} set to zero`);
        loadStos();
        // If we are on detail view, it will need a way to refresh too.
        // We'll handle that via a key change or state update if needed.
    };

    return (
        <>
            <div className="container fade-in">
                <header className="glass card flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Warehouse size={32} className="text-primary" style={{ color: 'var(--primary)' }} />
                        <h1>STO Tracker</h1>
                    </div>
                    <nav style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setView('list')}
                            className={`btn-nav ${view === 'list' ? 'active' : ''}`}
                            style={navBtnStyle(view === 'list')}
                        >
                            <ListIcon size={18} /> List
                        </button>
                        <button
                            onClick={() => setView('create')}
                            className={`btn-nav ${view === 'create' ? 'active' : ''}`}
                            style={navBtnStyle(view === 'create')}
                        >
                            <Plus size={18} /> Create
                        </button>
                        <button
                            onClick={() => setView('search')}
                            className={`btn-nav ${view === 'search' ? 'active' : ''}`}
                            style={navBtnStyle(view === 'search')}
                        >
                            <Search size={18} /> Search
                        </button>
                    </nav>
                </header>
                {error && (
                    <div className="glass card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', marginBottom: '1.5rem', borderRadius: '12px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <main>
                    {view === 'list' && (
                        <STOList
                            stos={stos}
                            isLoading={isLoading}
                            onViewDetail={handleViewDetail}
                            onDelete={handleDelete}
                            onSyncRequest={openSapSync}
                        />
                    )}
                    {view === 'create' && (
                        <STOForm onCreated={handleStoCreated} onCancel={() => setView('list')} />
                    )}
                    {view === 'search' && (
                        <STOSearch onViewDetail={handleViewDetail} />
                    )}
                </main>
            </div>

            {selectedStoId && (
                <STODetail
                    id={selectedStoId}
                    onClose={() => setSelectedStoId(null)}
                    onDelete={() => {
                        handleDelete(selectedStoId);
                        setSelectedStoId(null);
                    }}
                    onSyncRequest={openSapSync}
                />
            )}

            <SAPSyncModal
                isOpen={sapSyncData.isOpen}
                stoNumber={sapSyncData.stoNumber}
                onClose={() => setSapSyncData({ ...sapSyncData, isOpen: false })}
                onSyncComplete={handleSyncComplete}
            />
        </>
    );
}

const navBtnStyle = (isActive) => ({
    background: isActive ? 'var(--primary)' : 'transparent',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    opacity: isActive ? 1 : 0.7,
});

export default App;
