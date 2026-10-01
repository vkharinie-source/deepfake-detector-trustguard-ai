import React from 'react';
import { Settings as SettingsIcon, Shield, User, Bell, Lock, Activity, Info } from '../components/Icons';

export default function SettingsPage({ currentUser }) {
  const user = currentUser || {};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
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
          <SettingsIcon size={22} color="#818CF8" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>
            Settings
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>
            Platform configuration and account preferences.
          </p>
        </div>
      </div>

      {/* Account Card */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <User size={18} color="#818CF8" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F9FAFB', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Account Profile
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>
              Full Name
            </label>
            <div className="cyber-input" style={{ backgroundColor: '#0D1424', color: '#E5E7EB', opacity: 0.7, cursor: 'not-allowed' }}>
              {user.full_name || 'Authenticated User'}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div className="cyber-input" style={{ backgroundColor: '#0D1424', color: '#E5E7EB', opacity: 0.7, cursor: 'not-allowed' }}>
              {user.email || 'user@trustguard.ai'}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '0.8rem',
            color: '#9CA3AF',
          }}
        >
          <Info size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} color="#818CF8" />
          Profile changes are managed through the TrustGuard AI authentication service.
        </div>
      </div>

      {/* Security Settings */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Lock size={18} color="#818CF8" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F9FAFB', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security
          </h4>
        </div>

        {[
          { label: 'Secure Authentication', value: 'PBKDF2-SHA256 (100,000 rounds)', status: 'Active' },
          { label: 'Session Token', value: 'URL-safe Bearer Token', status: 'Active' },
          { label: 'Data Transmission', value: 'CORS-protected REST API', status: 'Secured' },
          { label: 'Password Storage', value: 'Salted hash, never plaintext', status: 'Secured' },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 0',
              borderBottom: idx < 3 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E5E7EB', margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: '0.775rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>{item.value}</p>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Detection Modules Status */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Activity size={18} color="#818CF8" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F9FAFB', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Detection Modules
          </h4>
        </div>

        {[
          { name: 'DeepFake Image', model: 'MobileNetV2 V3' },
          { name: 'Website Analysis', model: 'Rule-based + ML Classifier' },
          { name: 'Email / Phishing', model: 'Pattern Heuristics Engine' },
          { name: 'Message / SMS', model: 'NLP Scam Classifier' },
          { name: 'Phone Call', model: 'Transcript Scam Analyzer' },
          { name: 'Job / Internship', model: 'Recruitment Fraud Detector' },
          { name: 'News Verification', model: 'Misinformation Classifier' },
          { name: 'App Audit', model: 'Package Metadata Inspector' },
        ].map((mod, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0',
              borderBottom: idx < 7 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E5E7EB', margin: 0 }}>{mod.name}</p>
              <p style={{ fontSize: '0.775rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>{mod.model}</p>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              Online
            </span>
          </div>
        ))}
      </div>

      {/* Platform Info */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Shield size={18} color="#818CF8" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F9FAFB', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Platform Information
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Platform', value: 'TrustGuard AI' },
            { label: 'Version', value: '2.0.0' },
            { label: 'Backend', value: 'FastAPI + Python' },
            { label: 'API Endpoint', value: 'http://127.0.0.1:8000' },
          ].map((info, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#0D1424',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <p style={{ fontSize: '0.72rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>
                {info.label}
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#E5E7EB', margin: '0.25rem 0 0 0' }}>
                {info.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
