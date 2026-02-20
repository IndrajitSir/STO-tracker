import React, { useState } from 'react';
import { stoApi } from '../api/stoApi';
import { Plus, Trash2, Save, X, ClipboardType } from 'lucide-react';

function STOForm({ onCreated, onCancel }) {
    const [header, setHeader] = useState({
        sto_number: '',
        from_location: 'U3',
        to_location: '',
        remarks: '',
        created_by: 'Anonymous'
    });

    const [items, setItems] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const defaultBatch = `${year}${month}`;
        return [{ diameter: 350, material_class: 'K7', length: '6.0M', batch: defaultBatch, quantity_mtr: 0 }];
    });

    const [bulkData, setBulkData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const lengthOptions = ['6.0M', '5.5M', '5.0M', '4.5M', '4.0M'];
    const diameterOptions = [
        100, 150, 200, 250, 300, 350, 400, 450, 500,
        600, 700, 800, 900, 1000, 1100, 1200
    ];

    const handleBulkParse = () => {
        if (!bulkData.trim()) return;

        // Helper to normalize STO numbers to 10 digits starting with 62
        const normalizeSto = (num) => {
            if (!num) return '';
            let s = num.toString().trim();
            if (s.length >= 10) return s;
            const needed = 10 - s.length - 2; // -2 for the '62' prefix
            if (needed < 0) return '62' + s; // Just prefix if already long but < 10
            return '62' + '0'.repeat(needed) + s;
        };

        // Extract STO/PO Number from various formats
        const headerRegex = /(?:STO|PO)\s*(?::|->)?\s*(\d+)/i;
        const stoMatch = bulkData.match(headerRegex);
        if (stoMatch) {
            setHeader(prev => ({ ...prev, sto_number: normalizeSto(stoMatch[1]) }));
        }

        const lines = bulkData.split('\n');
        const newItems = [];

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) return;

            // 1. Extract shared context: Diameter and Class at start of line
            // Example: "250 k7" or "350 K7 L6.0"
            const contextMatch = cleanLine.match(/^(\d+)\s+([A-Z0-9]+)/i);
            if (!contextMatch) return;

            const diameter = parseInt(contextMatch[1]);
            const matClass = contextMatch[2].toUpperCase();

            // 2. Extract Batch from line (usually at end)
            let sharedBatch = '';
            const specialBatchMatch = cleanLine.match(/(\d{1,2})\s*B(?:ATCH)?/i);
            const standardBatchMatch = cleanLine.match(/(\d{6})(?:\D|$)/);

            if (specialBatchMatch) {
                const month = specialBatchMatch[1].padStart(2, '0');
                const year = parseInt(month) <= 5 ? '2026' : '2025';
                sharedBatch = year + month;
            } else if (standardBatchMatch) {
                sharedBatch = standardBatchMatch[1];
            }

            // 3. Find all (Length, Qty) pairs in the line
            // Supports: "5MM(155 MTR)", "5.5MM(93.5 MTR)", "L6.0 → 528 MTR"
            const pairs = [];

            // Pattern A: Comma/AND separated format: "5.5MM(93.5 MTR)"
            const segmentRegex = /([\d.]+)\s*MM?\s*\(?([\d.]+)\s*MTR/gi;
            let segMatch;
            while ((segMatch = segmentRegex.exec(cleanLine)) !== null) {
                pairs.push({ length: segMatch[1], qty: parseFloat(segMatch[2]) });
            }

            // Pattern B: Arrow format: "L6.0 → 528 MTR" (if Pattern A found nothing)
            if (pairs.length === 0) {
                const arrowRegex = /L([\d.]+).*?→\s*(?:\d+\s*pcs\s*)?\(?([\d.]+)\s*MTR/i;
                const arrowMatch = cleanLine.match(arrowRegex);
                if (arrowMatch) {
                    pairs.push({ length: arrowMatch[1], qty: parseFloat(arrowMatch[2]) });
                }
            }

            // 4. Create items from pairs
            pairs.forEach(p => {
                let len = p.length;
                if (!len.includes('.')) len += '.0';
                len += 'M';

                newItems.push({
                    diameter,
                    material_class: matClass,
                    quantity_mtr: p.qty,
                    length: len,
                    batch: sharedBatch
                });
            });
        });

        if (newItems.length > 0) {
            setItems(newItems);
            setBulkData('');
            alert(`Successfully parsed ${newItems.length} items.`);
        } else {
            alert('Could not parse data. Please check the format.');
        }
    };

    const addItem = () => {
        const lastBatch = items[items.length - 1]?.batch || '';
        setItems([...items, { diameter: 350, material_class: 'K7', length: '6.0M', batch: lastBatch, quantity_mtr: 0 }]);
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

        if (!header.sto_number) {
            alert('STO Number is required');
            return;
        }

        if (header.from_location === header.to_location) {
            alert('From Location and To Location cannot be the same.');
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionData = {
                header,
                items: items.map(item => ({
                    ...item,
                    length: typeof item.length === 'string' ? parseFloat(item.length.replace('M', '')) : item.length
                }))
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

            <div className="glass card" style={{ marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardType size={18} /> Bulk Data Add
                </h3>
                <textarea
                    placeholder="Paste example data here...&#10;Example:&#10;STO : 6200000914&#10;350 K7 L6.0 → 1992 MTR- 6.0M202602..."
                    value={bulkData}
                    onChange={e => setBulkData(e.target.value)}
                    style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}
                />
                <button
                    type="button"
                    onClick={handleBulkParse}
                    className="btn-nav"
                    style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                    Parse & Add Items
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="glass card">
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Header Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>STO Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <input
                                required
                                value={header.sto_number}
                                onChange={e => setHeader({ ...header, sto_number: e.target.value })}
                                style={{ width: '100%', borderColor: !header.sto_number ? 'var(--danger)' : 'var(--border-glass)' }}
                                placeholder="Required"
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
                                <option value="">Select Destination</option>
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
                                            <select
                                                value={item.diameter}
                                                onChange={e => updateItem(index, 'diameter', parseInt(e.target.value))}
                                                style={{ width: '90px', background: 'gray', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
                                            >
                                                {diameterOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
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
                                                onChange={e => updateItem(index, 'length', e.target.value)}
                                                style={{ width: '100px', background: 'gray', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
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
                                                step="0.1"
                                                value={item.quantity_mtr}
                                                onChange={e => updateItem(index, 'quantity_mtr', parseFloat(e.target.value))}
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
