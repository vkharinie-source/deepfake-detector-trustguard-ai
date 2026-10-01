import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, RefreshCw, Trash2, AlertTriangle, CheckCircle, XCircle, Search } from '../components/Icons';
import { api } from '../services/api';

const RESULT_FILTERS = ['ALL', 'REAL', 'FAKE', 'SAFE', 'SUSPICIOUS'];

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHistory();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load history. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all scan history? This action cannot be undone.')) return;
    try {
      await api.clearHistory();
      setItems([]);
    } catch (err) {
      setError('Failed to clear history.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const pred = String(item.prediction || item.result || '').toLowerCase();
    const filename = String(item.filename || item.input_value || '').toLowerCase();
    const cat = String(item.category || item.analysis_type || '').toLowerCase();
    const matchesSearch = !q || pred.includes(q) || filename.includes(q) || cat.includes(q);
    return matchesSearch && (filter === 'ALL' || pred === filter);
  });

  const getBadgeStyle = (item) => {
    const pred = String(item.prediction || item.result || '').toUpperCase();
    if (pred === 'REAL' || pred === 'SAFE') {
      return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (pred === 'SUSPICIOUS') {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HistoryIcon size={22} color="#818CF8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>
              Scan History
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>
              {items.length} total inspection records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchHistory}
            className="cyber-button-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                fontSize: '0.825rem',
                fontWeight: '600',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 size={15} />
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Search and result filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={18}
            color="#6B7280"
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by module, result, or content..."
            className="cyber-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div role="group" aria-label="Filter history by result" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {RESULT_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              style={{
                padding: '0.45rem 0.7rem',
                borderRadius: '7px',
                border: `1px solid ${filter === value ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.1)'}`,
                backgroundColor: filter === value ? 'rgba(99,102,241,0.16)' : 'transparent',
                color: filter === value ? '#C7D2FE' : '#9CA3AF',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
            <RefreshCw size={28} color="#6366F1" style={{ marginBottom: '0.75rem' }} />
            <p style={{ margin: 0 }}>Loading inspection records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <HistoryIcon size={40} color="#374151" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ color: '#9CA3AF', margin: 0, fontSize: '0.95rem' }}>
              {search || filter !== 'ALL' ? 'No records match these filters.' : 'No inspection history found.'}
            </h4>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              {search || filter !== 'ALL' ? 'Adjust the search or choose another result filter.' : 'Use any detection module to begin scanning threats.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                  {['ID', 'Module', 'Target / Content', 'Result', 'Confidence', 'Risk Score', 'Timestamp'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const pred = String(item.prediction || item.result || '').toUpperCase();
                  const badge = getBadgeStyle(item);
                  return (
                    <tr
                      key={item.id || idx}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>
                        #{item.id || idx + 1}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            color: '#A5B4FC',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                          }}
                        >
                          {item.category || item.analysis_type || 'Not recorded'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                        <div
                          style={{
                            fontSize: '0.825rem',
                            color: '#E5E7EB',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={item.filename || item.input_value}
                        >
                          {item.filename || item.input_value || 'Not recorded'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {pred}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#E5E7EB', fontWeight: '600' }}>
                        {typeof item.confidence === 'number' ? `${item.confidence.toFixed(2)}%` : (item.confidence || 'N/A')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#9CA3AF' }}>
                        {item.risk_score !== undefined ? `${item.risk_score}` : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
