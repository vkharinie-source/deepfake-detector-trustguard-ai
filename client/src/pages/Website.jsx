import React, { useState } from 'react';
import { Globe, AlertTriangle, CheckCircle, XCircle, RefreshCw } from '../components/Icons';
import ReportActions from '../components/ReportActions';
import { api } from '../services/api';
import { generatePDFReport } from '../utils/pdfReport';

const WEBSITE_SIGNALS = [
  'HTTPS scheme',
  'Raw IP address',
  'Suspicious top-level domain',
  'Known URL shortener',
  'Security-related URL terms',
  'Subdomain depth',
  'Unusually long URL',
  'At-sign and encoded characters',
  'Brand/domain patterns',
  'Sensitive query parameters',
];

export default function Website() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) { setError('Please enter a URL.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      setLoadingMsg('Resolving domain...');
      await new Promise(r => setTimeout(r, 300));
      setLoadingMsg('Analyzing URL structure...');
      await new Promise(r => setTimeout(r, 300));
      setLoadingMsg('Running security checks...');
      const data = await api.analyzeWebsite(url);
      setLoadingMsg('Generating report...');
      await new Promise(r => setTimeout(r, 200));
      setResult(data);
    } catch (err) { setError(err.message || 'Website analysis failed.'); }
    finally { setLoading(false); setLoadingMsg(''); }
  };

  const handleReset = () => { setUrl(''); setResult(null); setError(''); };

  const handlePDF = () => {
    if (!result) return;
    const pred = String(result.prediction || result.result || '').toUpperCase();
    const checks = result.checks || result.analysis || {};
    const details = Array.isArray(result.details)
      ? result.details
      : Object.entries(checks).map(([k, v]) => ({
        label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        flagged: v === true || v === 'flagged' || v === 'suspicious',
      }));
    generatePDFReport({
      title: 'Website Security Report',
      moduleType: 'Website Threat Scanner',
      result: { ...result, prediction: pred },
      inputInfo: { 'URL': url, 'Domain': new URL(url.startsWith('http') ? url : `https://${url}`).hostname || url, 'Protocol': url.startsWith('https') ? 'HTTPS' : 'HTTP' },
      findings: [
        `Overall verdict: ${pred}`,
        result.confidence !== undefined ? `Confidence: ${Number(result.confidence).toFixed(2)}%` : null,
        result.risk_score !== undefined ? `Risk score: ${result.risk_score}` : null,
      ].filter(Boolean),
      details,
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      technicalInfo: { 'URL': url, 'Domain': result.domain, 'Protocol': result.protocol, 'Analysis Engine': 'Website URL Heuristics' },
    });
  };

  const pred = result ? String(result.prediction || result.result || '').toUpperCase() : '';
  const isSafe = pred === 'SAFE' || pred === 'REAL';
  const isSuspicious = pred === 'SUSPICIOUS';
  const checks = result ? (result.checks || result.analysis || {}) : {};
  const details = result && Array.isArray(result.details) ? result.details : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Input */}
      <div className="cyber-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={22} color="#818CF8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>Enter Website URL</h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>Paste a URL to scan for threats</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="cyber-input" style={{ flex: 1, minWidth: '250px' }} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
          <button className="cyber-button-primary" onClick={handleAnalyze} disabled={loading} style={{ padding: '0.65rem 1.5rem' }}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Scanning...</> : 'Analyze URL'}
          </button>
        </div>
      </div>

      {!result && !loading && (
        <section className="analysis-context" aria-label="Website security checks">
          <div className="analysis-context-heading">
            <span className="analysis-context-icon"><Globe size={17} /></span>
            <div><span className="analysis-context-kicker">URL CHECK COVERAGE</span><h3>Signals assessed</h3></div>
          </div>
          <div className="website-signal-grid">
            {WEBSITE_SIGNALS.map((signal, index) => (
              <div className="website-signal" key={signal}><span>{String(index + 1).padStart(2, '0')}</span>{signal}</div>
            ))}
          </div>
          <p className="analysis-context-note">These are URL-pattern heuristics. A SAFE result is not a guarantee that a website is trustworthy.</p>
        </section>
      )}

      {loading && (
        <div className="cyber-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <RefreshCw size={32} color="#6366F1" className="animate-spin" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.95rem', color: '#E5E7EB', fontWeight: '600' }}>{loadingMsg}</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {result && !loading && (
        <div className="cyber-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818CF8', marginBottom: '1.25rem' }}>Website Security Report</h3>

          {/* Result Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem',
            backgroundColor: isSafe ? 'rgba(16,185,129,0.08)' : isSuspicious ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isSafe ? 'rgba(16,185,129,0.25)' : isSuspicious ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {isSafe ? <CheckCircle size={28} color="#34D399" /> : isSuspicious ? <AlertTriangle size={28} color="#FBBF24" /> : <XCircle size={28} color="#F87171" />}
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: '800', color: isSafe ? '#34D399' : isSuspicious ? '#FBBF24' : '#F87171', margin: 0 }}>{pred}</p>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>Website Security Result</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              {result.confidence !== undefined && <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#E5E7EB', margin: 0 }}>{Number(result.confidence).toFixed(2)}%</p>}
              <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Confidence</p>
            </div>
          </div>

          {/* Security Checks */}
          {(details.length > 0 || Object.keys(checks).length > 0) && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Security Checks</h4>
              {details.length > 0 ? (
                <ul style={{ display: 'grid', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
                  {details.map((detail, index) => (
                    <li key={index} className="website-finding"><AlertTriangle size={15} />{typeof detail === 'string' ? detail : JSON.stringify(detail)}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {Object.entries(checks).map(([key, val]) => {
                    const flagged = val === true || val === 'flagged' || val === 'suspicious';
                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#0D1424', padding: '0.55rem 0.75rem', borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        {flagged ? <AlertTriangle size={14} color="#FBBF24" /> : <CheckCircle size={14} color="#34D399" />}
                        <span style={{ fontSize: '0.78rem', color: '#D1D5DB', flex: 1 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: flagged ? '#FBBF24' : '#34D399' }}>{flagged ? 'Flagged' : 'Clear'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Key Findings */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Key Findings</h4>
            <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.65', margin: 0 }}>
                The website detector classified this URL as {pred}. It returned {details.length} finding{details.length === 1 ? '' : 's'} and a risk score of {result.risk_score !== undefined ? `${result.risk_score}/100` : 'not provided'}.
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Recommendations</h4>
            <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {Array.isArray(result.recommendations) && result.recommendations.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#D1D5DB', fontSize: '0.85rem', lineHeight: '1.7' }}>
                  {result.recommendations.map((recommendation, index) => <li key={index}>{recommendation}</li>)}
                </ul>
              ) : <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.65', margin: 0 }}>The analysis service did not return recommendations.</p>}
            </div>
          </div>

          {/* Technical */}
          <div style={{ marginBottom: '0.5rem', marginTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Technical Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {[
                { label: 'URL', value: url },
                { label: 'Domain', value: result.domain || new URL(url.startsWith('http') ? url : `https://${url}`).hostname },
                { label: 'Protocol', value: result.protocol || (url.startsWith('https') ? 'HTTPS' : 'HTTP') },
                { label: 'Risk Score', value: result.risk_score !== undefined ? String(result.risk_score) : 'N/A' },
              ].map((t, i) => (
                <div key={i} style={{ backgroundColor: '#0D1424', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>{t.label}</p>
                  <p style={{ fontSize: '0.825rem', fontWeight: '600', color: '#E5E7EB', margin: '0.2rem 0 0 0', wordBreak: 'break-all' }}>{t.value}</p>
                </div>
              ))}
            </div>
          </div>

          <ReportActions result={result} moduleType="website" onDownloadPDF={handlePDF} onAnalyzeAnother={handleReset} />
        </div>
      )}
    </div>
  );
}
