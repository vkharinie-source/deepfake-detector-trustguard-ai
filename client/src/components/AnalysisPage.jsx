import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from '../components/Icons';
import ReportActions from '../components/ReportActions';
import { generatePDFReport } from '../utils/pdfReport';

/**
 * Reusable analysis page shell.
 * Props:
 *  - icon: React node for the header icon
 *  - title: page header title
 *  - subtitle: page header subtitle
 *  - reportTitle: h3 title inside the report card
 *  - moduleType: string for voice/pdf module name
 *  - fields: array of { key, label, placeholder, multiline? }
 *  - onSubmit: async (values) => apiResult
 *  - buildPDFData: (result, values) => { inputInfo, findings, details, recommendations, technicalInfo }
 *  - renderChecks: optional (result) => JSX for indicator checks
 */
export default function AnalysisPage({
  icon,
  title,
  subtitle,
  reportTitle,
  moduleType,
  fields,
  onSubmit,
  buildPDFData,
  renderChecks,
}) {
  const [values, setValues] = useState(() => {
    const init = {};
    fields.forEach((f) => { init[f.key] = ''; });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleAnalyze = async () => {
    const empty = fields.filter((f) => f.required !== false && !values[f.key]?.trim());
    if (empty.length > 0) {
      setError(`Please fill in: ${empty.map((f) => f.label).join(', ')}`);
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      setLoadingMsg('Processing input...');
      await new Promise((r) => setTimeout(r, 300));
      setLoadingMsg('Running analysis...');
      const data = await onSubmit(values);
      setLoadingMsg('Generating report...');
      await new Promise((r) => setTimeout(r, 250));
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleReset = () => {
    const init = {};
    fields.forEach((f) => { init[f.key] = ''; });
    setValues(init);
    setResult(null);
    setError('');
  };

  const handlePDF = () => {
    if (!result || !buildPDFData) return;
    const pdfData = buildPDFData(result, values);
    generatePDFReport({
      title: reportTitle,
      moduleType,
      result,
      ...pdfData,
      details: resultDetails.length ? resultDetails : pdfData.details,
      recommendations: resultRecommendations.length ? resultRecommendations : pdfData.recommendations,
    });
  };

  const pred = result ? String(result.prediction || result.result || '').toUpperCase() : '';
  const resultDetails = Array.isArray(result?.details)
    ? result.details
    : Array.isArray(result?.findings) ? result.findings : [];
  const resultRecommendations = Array.isArray(result?.recommendations) ? result.recommendations : [];
  const isSafe = ['REAL', 'SAFE'].includes(pred);
  const isSuspicious = pred === 'SUSPICIOUS';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Input Card */}
      <div className="cyber-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>{title}</h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>{subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                {f.label}
              </label>
              {f.multiline ? (
                <textarea
                  value={values[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="cyber-input"
                  rows={f.rows || 4}
                  style={{ resize: 'vertical' }}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={values[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="cyber-input"
                />
              )}
            </div>
          ))}
          <button className="cyber-button-primary" onClick={handleAnalyze} disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.65rem 1.5rem' }}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Analyzing...</> : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="cyber-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <RefreshCw size={32} color="#6366F1" className="animate-spin" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.95rem', color: '#E5E7EB', fontWeight: '600' }}>{loadingMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Report */}
      {result && !loading && (
        <div className="cyber-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818CF8', marginBottom: '1.25rem' }}>
            {reportTitle}
          </h3>

          {/* Result Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem',
            backgroundColor: isSafe ? 'rgba(16,185,129,0.08)' : isSuspicious ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isSafe ? 'rgba(16,185,129,0.25)' : isSuspicious ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {isSafe ? <CheckCircle size={28} color="#34D399" /> : isSuspicious ? <AlertTriangle size={28} color="#FBBF24" /> : <XCircle size={28} color="#F87171" />}
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: '800', color: isSafe ? '#34D399' : isSuspicious ? '#FBBF24' : '#F87171', margin: 0 }}>{pred}</p>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>Detection Result</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              {result.confidence !== undefined && <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#E5E7EB', margin: 0 }}>{Number(result.confidence).toFixed(2)}%</p>}
              <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Confidence</p>
              {result.risk_score !== undefined && <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#FBBF24', margin: '0.25rem 0 0 0' }}>Risk: {result.risk_score}</p>}
            </div>
          </div>

          {/* Custom checks */}
          {renderChecks && renderChecks(result)}

          {/* Key Findings */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Key Findings</h4>
            <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {resultDetails.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#D1D5DB', fontSize: '0.85rem', lineHeight: '1.7' }}>
                  {resultDetails.map((detail, index) => <li key={index}>{typeof detail === 'string' ? detail : JSON.stringify(detail)}</li>)}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.65', margin: 0 }}>
                  The analysis service returned {pred || 'a result'} but did not provide additional finding details.
                </p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Recommendations</h4>
            <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {resultRecommendations.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#D1D5DB', fontSize: '0.85rem', lineHeight: '1.7' }}>
                  {resultRecommendations.map((recommendation, index) => <li key={index}>{recommendation}</li>)}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.65', margin: 0 }}>
                  Treat this as a screening result. Verify high-impact or sensitive requests through an official channel.
                </p>
              )}
            </div>
          </div>

          <ReportActions result={result} moduleType={moduleType} onDownloadPDF={handlePDF} onAnalyzeAnother={handleReset} />
        </div>
      )}
    </div>
  );
}
