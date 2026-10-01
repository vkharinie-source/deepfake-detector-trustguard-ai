import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Shield, Cpu } from './Icons';

export default function ResultCard({ result, moduleType = 'general' }) {
  if (!result) return null;

  // Normalize result properties
  const prediction = String(result.prediction || result.result || '').toUpperCase();
  const rawScore = result.raw_score !== undefined ? result.raw_score : result.score;
  const threshold = result.threshold !== undefined ? result.threshold : 0.50;
  const confidence = result.confidence !== undefined ? result.confidence : 0;
  const modelName = moduleType === 'deepfake' ? 'MobileNetV2 V3' : (result.model || 'TrustGuard Engine V2');

  const isSafe = prediction === 'REAL' || prediction === 'SAFE';
  const isSuspicious = prediction === 'SUSPICIOUS' || prediction === 'WARNING';
  const isDanger = prediction === 'FAKE' || prediction === 'SCAM' || prediction === 'PHISHING' || prediction === 'HIGH RISK';

  let statusConfig = {
    label: prediction || 'ANALYZED',
    badgeClass: 'badge-safe',
    icon: CheckCircle,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
  };

  if (isDanger) {
    statusConfig = {
      label: prediction || 'THREAT DETECTED',
      badgeClass: 'badge-danger',
      icon: XCircle,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
    };
  } else if (isSuspicious) {
    statusConfig = {
      label: prediction || 'SUSPICIOUS',
      badgeClass: 'badge-warning',
      icon: AlertTriangle,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
    };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div
      style={{
        backgroundColor: '#131B2E',
        border: `1px solid ${statusConfig.border}`,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.5)',
        marginTop: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StatusIcon size={22} color={statusConfig.color} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              DETECTION RESULT
            </p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F9FAFB', margin: '0.1rem 0 0 0' }}>
              {statusConfig.label}
            </h3>
          </div>
        </div>

        {/* Model Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <Cpu size={14} color="#818CF8" />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#A5B4FC' }}>
            {modelName}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Confidence */}
        <div
          style={{
            backgroundColor: '#0D1424',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', margin: 0 }}>
            Confidence Level
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: statusConfig.color, margin: '0.2rem 0 0 0' }}>
            {typeof confidence === 'number' ? `${confidence.toFixed(2)}%` : confidence}
          </p>
        </div>

        {/* Model Score */}
        {rawScore !== undefined && (
          <div
            style={{
              backgroundColor: '#0D1424',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', margin: 0 }}>
              Model Score
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F9FAFB', margin: '0.2rem 0 0 0' }}>
              {typeof rawScore === 'number' ? rawScore.toFixed(4) : rawScore}
            </p>
          </div>
        )}

        {/* Decision Threshold */}
        <div
          style={{
            backgroundColor: '#0D1424',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <p style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', margin: 0 }}>
            Decision Threshold
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#9CA3AF', margin: '0.2rem 0 0 0' }}>
            {typeof threshold === 'number' ? threshold.toFixed(2) : threshold}
          </p>
        </div>
      </div>

      {/* Details List */}
      {Array.isArray(result.details) && result.details.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#E5E7EB', marginBottom: '0.5rem' }}>
            Analysis Findings
          </h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', margin: 0 }}>
            {result.details.map((detail, idx) => (
              <li key={idx} style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#E5E7EB', marginBottom: '0.5rem' }}>
            Security Recommendations
          </h4>
          <ul style={{ listStyleType: 'circle', paddingLeft: '1.25rem', margin: 0 }}>
            {result.recommendations.map((rec, idx) => (
              <li key={idx} style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
