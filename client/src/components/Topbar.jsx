import React from 'react';
import { Menu, Shield, Activity } from './Icons';

export default function Topbar({ title, description, setMobileOpen, systemStatus = 'healthy' }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        backgroundColor: 'rgba(9, 13, 22, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          style={{
            background: '#131B2E',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#F9FAFB',
            padding: '0.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="mobile-menu-trigger"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#F9FAFB',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {title || 'SECURITY DASHBOARD'}
          </h2>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#9CA3AF',
              margin: '0.15rem 0 0 0',
            }}
          >
            {description || 'Monitor and analyze suspicious digital content across your TrustGuard AI security modules.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* System Online Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            backgroundColor: systemStatus === 'healthy' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: systemStatus === 'healthy' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: systemStatus === 'healthy' ? '#10B981' : '#EF4444',
              boxShadow: systemStatus === 'healthy' ? '0 0 8px #10B981' : '0 0 8px #EF4444',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: systemStatus === 'healthy' ? '#34D399' : '#F87171',
              letterSpacing: '0.02em',
            }}
          >
            {systemStatus === 'healthy' ? 'System Online' : 'Service Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
