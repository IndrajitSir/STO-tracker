import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Loader2, X } from 'lucide-react';

function SAPSyncModal({ stoNumber, isOpen, onClose, onSyncComplete }) {
    const [sapUser, setSapUser] = useState('');
    const [sapPassword, setSapPassword] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSync = async (e) => {
        e.preventDefault();
        setError('');
        setIsSyncing(true);

        try {
            const { stoApi } = await import('../api/stoApi');
            const result = await stoApi.updateFromSap(stoNumber, sapUser, sapPassword);

            // Success
            setSapPassword(''); // Discard immediately
            onSyncComplete(result.summary);
            onClose();
        } catch (err) {
            setError(err.message || 'Synchronization failed.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass card" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck className="text-primary" /> SAP Authentication
                </h2>

                <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                    Updating quantities for STO: <strong>{stoNumber}</strong>
                </div>

                <form onSubmit={handleSync}>
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} /> SAP User ID
                        </label>
                        <input
                            required
                            autoFocus
                            autoComplete="off"
                            value={sapUser}
                            onChange={e => setSapUser(e.target.value)}
                            placeholder="Enter SAP Username"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={14} /> SAP Password
                        </label>
                        <input
                            required
                            type="password"
                            autoComplete="off"
                            value={sapPassword}
                            onChange={e => setSapPassword(e.target.value)}
                            placeholder="Enter SAP Password"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSyncing}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {isSyncing ? (
                            <><Loader2 className="animate-spin" size={18} /> Syncing with SAP...</>
                        ) : (
                            'Update From SAP STO'
                        )}
                    </button>

                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                        Credentials are used only for this session and are NEVER stored.
                    </p>
                </form>
            </div>
        </div>
    );
}

export default SAPSyncModal;
