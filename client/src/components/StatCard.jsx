import React from 'react';

export default function StatCard({ title, value, subtitle, icon: IconComponent, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.25)',
      text: '#818CF8',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#34D399',
    },
    rose: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.25)',
      text: '#F87171',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
      text: '#FBBF24',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      style={{
        backgroundColor: '#131B2E',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        transition: 'all 0.2s ease',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#F9FAFB',
            margin: '0.35rem 0 0.15rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          {value !== undefined && value !== null ? value : 0}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {IconComponent && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: scheme.bg,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconComponent size={24} color={scheme.text} />
        </div>
      )}
    </div>
  );
}
