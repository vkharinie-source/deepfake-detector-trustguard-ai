import React, { useState, useRef } from 'react';
import { ImageIcon, AlertTriangle, CheckCircle, XCircle, RefreshCw } from '../components/Icons';
import ReportActions from '../components/ReportActions';
import { api } from '../services/api';
import { generatePDFReport } from '../utils/pdfReport';

export default function DeepFake() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileSelect = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(f.type)) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setLoadingMsg('Uploading image...');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingMsg('Processing with MobileNetV2 V3...');
      const data = await api.predictImage(file);
      setLoadingMsg('Generating report...');
      await new Promise((r) => setTimeout(r, 300));
      setResult(data);
    } catch (err) {
      setError(err.message || 'Image analysis failed.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const pred = String(result.prediction || '').toUpperCase();
    const findings = [];
    findings.push(`MobileNetV2 V3 classified the image as ${pred}.`);
    if (result.confidence !== undefined) findings.push(`Model confidence: ${Number(result.confidence).toFixed(2)}%`);
    if (result.faces_detected !== undefined) findings.push(`Faces detected in image: ${result.faces_detected}`);

    generatePDFReport({
      title: 'DeepFake Analysis Report',
      moduleType: 'DeepFake Image Detection',
      result,
      inputInfo: {
        'Filename': file?.name || 'Uploaded Image',
        'File Size': file ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A',
        'File Type': file?.type || 'N/A',
      },
      findings,
      details: [
        `Detection Model: MobileNetV2 V3`,
        `Model Score: ${result.raw_score !== undefined ? result.raw_score : 'N/A'}`,
        `Decision Threshold: ${result.threshold !== undefined ? result.threshold : 'N/A'}`,
        result.original_image_size ? `Original Image Size: ${result.original_image_size.width} x ${result.original_image_size.height}` : null,
      ],
      recommendations: pred === 'REAL'
        ? ['The image appears genuine. No further action required.', 'Continue to verify source integrity for sensitive use cases.']
        : ['Do not use this image as evidence or for official purposes.', 'Verify the source of the image independently.', 'Consider reporting the manipulated content.'],
      technicalInfo: {
        'Model': 'MobileNetV2 V3',
        'Input Size': result.model_input_size ? `${result.model_input_size.width} x ${result.model_input_size.height}` : 'N/A',
        'Prediction': pred,
        'Confidence': result.confidence !== undefined ? `${Number(result.confidence).toFixed(2)}%` : 'N/A',
      },
    });
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const pred = result ? String(result.prediction || '').toUpperCase() : '';
  const isSafe = pred === 'REAL';
  const originalImageSize = result?.original_image_size
    ? `${result.original_image_size.width} x ${result.original_image_size.height}`
    : 'N/A';
  const modelInputSize = result?.model_input_size
    ? `${result.model_input_size.width} x ${result.model_input_size.height}`
    : 'N/A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Upload Area */}
      <div className="cyber-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ImageIcon size={22} color="#818CF8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>Upload Image</h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>Supports JPG, PNG, WEBP</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '12px',
            padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer',
            backgroundColor: 'rgba(99,102,241,0.04)',
            transition: 'border-color 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.04)'; }}
        >
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files?.[0])} style={{ display: 'none' }} />
          {preview ? (
            <img src={preview} alt="Preview" style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
          ) : (
            <>
              <ImageIcon size={40} color="#4B5563" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.9rem', color: '#9CA3AF', margin: 0 }}>Drag and drop an image here, or click to browse</p>
              <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '0.35rem' }}>Maximum recommended size: 10 MB</p>
            </>
          )}
        </div>

        {file && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            <button className="cyber-button-primary" onClick={handleAnalyze} disabled={loading} style={{ padding: '0.6rem 1.5rem' }}>
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Analyzing...</>
              ) : 'Analyze Image'}
            </button>
          </div>
        )}
      </div>

      {!result && !loading && (
        <section className="analysis-context" aria-label="Image analysis details">
          <div className="analysis-context-heading">
            <span className="analysis-context-icon"><ImageIcon size={17} /></span>
            <div><span className="analysis-context-kicker">MODEL PROFILE</span><h3>MobileNetV2 V3</h3></div>
          </div>
          <div className="analysis-context-facts">
            <div><span>Supported files</span><strong>JPG, PNG, WEBP</strong></div>
            <div><span>Model input</span><strong>224 x 224 pixels</strong></div>
            <div><span>Report includes</span><strong>Decision, score, threshold, faces</strong></div>
          </div>
          <p className="analysis-context-note">The result is a model assessment, not proof of an image's origin. Use the original source for high-stakes verification.</p>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="cyber-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <RefreshCw size={32} color="#6366F1" className="animate-spin" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.95rem', color: '#E5E7EB', fontWeight: '600' }}>{loadingMsg || 'Analyzing...'}</p>
          <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.25rem' }}>MobileNetV2 V3 deep learning model is processing the image</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#F87171', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Complete Report */}
      {result && !loading && (
        <div className="cyber-card" style={{ padding: '2rem' }}>
          <h3 style={{
            fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em',
            color: '#818CF8', marginBottom: '1.25rem',
          }}>
            DeepFake Analysis Report
          </h3>

          {/* Result Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
            borderRadius: '10px', marginBottom: '1.25rem',
            backgroundColor: isSafe ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isSafe ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            {isSafe ? <CheckCircle size={28} color="#34D399" /> : <XCircle size={28} color="#F87171" />}
            <div>
              <p style={{ fontSize: '1.4rem', fontWeight: '800', color: isSafe ? '#34D399' : '#F87171', margin: 0 }}>{pred}</p>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>Detection Result</p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Model', value: 'MobileNetV2 V3' },
              { label: 'Confidence', value: result.confidence !== undefined ? `${Number(result.confidence).toFixed(2)}%` : 'N/A' },
              { label: 'Model Score', value: result.raw_score !== undefined ? String(result.raw_score) : 'N/A' },
              { label: 'Decision Threshold', value: result.threshold !== undefined ? String(result.threshold) : 'N/A' },
              { label: 'Faces Detected', value: result.faces_detected !== undefined ? String(result.faces_detected) : 'N/A' },
              { label: 'Original Image Size', value: originalImageSize },
              { label: 'Model Input Size', value: modelInputSize },
            ].map((m, i) => (
              <div key={i} style={{
                backgroundColor: '#0D1424', padding: '0.85rem', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <p style={{ fontSize: '0.68rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>{m.label}</p>
                <p style={{ fontSize: '0.95rem', fontWeight: '700', color: '#E5E7EB', margin: '0.25rem 0 0 0' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Key Findings */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Key Findings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isSafe ? (
                <>
                  <FindingRow icon={<CheckCircle size={14} color="#34D399" />} text="The model classified this image as REAL." />
                </>
              ) : (
                <>
                  <FindingRow icon={<XCircle size={14} color="#F87171" />} text="The model classified this image as FAKE." />
                </>
              )}
              <FindingRow icon={<CheckCircle size={14} color="#818CF8" />} text={`Model confidence: ${result.confidence !== undefined ? Number(result.confidence).toFixed(2) + '%' : 'N/A'}`} />
            </div>
          </div>

          {/* Assessment */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Assessment</h4>
            <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.65', backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              MobileNetV2 V3 classified this image as {pred} with {result.confidence !== undefined ? `${Number(result.confidence).toFixed(2)}% confidence` : 'no confidence value returned'}. This is a model assessment and does not independently establish the image's source or history.
            </p>
          </div>

          {/* Recommendation */}
          <div style={{ marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Recommendation</h4>
            <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.65', backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {isSafe
                ? 'No immediate action is required. The image appears genuine. For sensitive use cases, consider verifying the original source.'
                : 'Do not use this image as evidence or share it as authentic content. Verify the source independently and consider reporting the manipulated media.'
              }
            </p>
          </div>

          {/* Actions */}
          <ReportActions
            result={result}
            moduleType="deepfake"
            onDownloadPDF={handleDownloadPDF}
            onAnalyzeAnother={handleReset}
          />
        </div>
      )}
    </div>
  );
}

function FindingRow({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      backgroundColor: '#0D1424', padding: '0.6rem 0.85rem', borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      {icon}
      <span style={{ fontSize: '0.825rem', color: '#D1D5DB' }}>{text}</span>
    </div>
  );
}
