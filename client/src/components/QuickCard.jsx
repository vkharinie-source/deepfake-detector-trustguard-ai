import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from './Icons';

export default function QuickCard({ title, description, icon: IconComponent, path, badge }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      style={{
        backgroundColor: '#131B2E',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="cyber-card-hover"
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {IconComponent && <IconComponent size={22} color="#818CF8" />}
          </div>

          {badge && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: '600',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#A5B4FC',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <h4
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#F9FAFB',
            margin: '0 0 0.4rem 0',
          }}
        >
          {title}
        </h4>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#9CA3AF',
            margin: 0,
            lineHeight: '1.4',
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginTop: '1.25rem',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#818CF8',
        }}
      >
        <span>Analyze Threat</span>
        <ArrowRight size={16} />
      </div>
    </div>
  );
}
