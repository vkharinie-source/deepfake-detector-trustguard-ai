import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import QuickCard from '../components/QuickCard';
import {
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ImageIcon,
  Globe,
  PhoneCall,
  Mail,
  MessageSquare,
  Newspaper,
  Briefcase,
  GraduationCap,
  FileCheck,
  RefreshCw
} from '../components/Icons';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    threats_detected: 0,
    suspicious: 0,
    fake: 0,
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      if (data && data.stats) {
        setStats(data.stats);
      }
      if (data && data.recent) {
        setRecentScans(data.recent);
      } else {
        const historyData = await api.getHistory();
        setRecentScans(historyData.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const quickModules = [
    {
      title: 'DeepFake Image',
      description: 'Analyze face uploads using MobileNetV2 neural vision to detect AI manipulation.',
      icon: ImageIcon,
      path: '/deepfake',
      badge: 'Vision AI',
    },
    {
      title: 'Website Scanner',
      description: 'Audit URLs for phishing indicators, deceptive domains, and SSL risk factors.',
      icon: Globe,
      path: '/website',
      badge: 'URL Audit',
    },
    {
      title: 'Phone Calls',
      description: 'Inspect voice transcripts and caller ID profiles for voice cloning scams.',
      icon: PhoneCall,
      path: '/call',
      badge: 'Voice AI',
    },
    {
      title: 'Email Security',
      description: 'Scan email headers, senders, and message bodies for phishing attacks.',
      icon: Mail,
      path: '/email',
      badge: 'Phishing',
    },
    {
      title: 'SMS & Messages',
      description: 'Analyze text messages and chat content for financial scam urgency tactics.',
      icon: MessageSquare,
      path: '/message',
      badge: 'Text Scam',
    },
    {
      title: 'News Verification',
      description: 'Verify news articles and viral headlines for misinformation and clickbait.',
      icon: Newspaper,
      path: '/news',
      badge: 'Fact Check',
    },
    {
      title: 'Job Offers',
      description: 'Verify corporate recruitment letters and employment contract legitimacy.',
      icon: Briefcase,
      path: '/job',
      badge: 'Career',
    },
    {
      title: 'Internships',
      description: 'Inspect internship listings to prevent upfront fee payment fraud.',
      icon: GraduationCap,
      path: '/internship',
      badge: 'Student',
    },
    {
      title: 'Applications',
      description: 'Audit mobile application permissions and package metadata for malware.',
      icon: FileCheck,
      path: '/application',
      badge: 'App Audit',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overview Stats Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>
              SECURITY METRICS OVERVIEW
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>
              Real-time telemetry aggregated across your detection modules.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="cyber-button-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Telemetry
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <StatCard
            title="Total Scans"
            value={stats.total}
            subtitle="Inspections completed"
            icon={Activity}
            color="indigo"
          />
          <StatCard
            title="Safe Content"
            value={stats.safe}
            subtitle="Verified authentic items"
            icon={CheckCircle}
            color="emerald"
          />
          <StatCard
            title="Threats Detected"
            value={stats.threats_detected || (stats.fake + stats.suspicious)}
            subtitle="Malicious or scam items"
            icon={XCircle}
            color="rose"
          />
          <StatCard
            title="Suspicious / Warnings"
            value={stats.suspicious || 0}
            subtitle="Flagged for manual review"
            icon={AlertTriangle}
            color="amber"
          />
        </div>
      </div>

      {/* Quick Detection Modules */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F9FAFB', marginBottom: '1rem' }}>
          AI DETECTION MODULES
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {quickModules.map((mod) => (
            <QuickCard
              key={mod.path}
              title={mod.title}
              description={mod.description}
              icon={mod.icon}
              path={mod.path}
              badge={mod.badge}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div
        style={{
          backgroundColor: '#131B2E',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>
              RECENT SCAN HISTORY
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>
              Latest threat inspection logs from your system.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
            Loading telemetry...
          </div>
        ) : recentScans.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
            No recent scan history available. Select a module above to perform your first inspection.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                    Module / Target
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                    Result
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                    Confidence
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((item, idx) => {
                  const pred = String(item.prediction || item.result || '').toUpperCase();
                  const isSafe = pred === 'REAL' || pred === 'SAFE';
                  const isDanger = pred === 'FAKE' || pred === 'SCAM' || pred === 'PHISHING';
                  const badgeStyle = isSafe
                    ? { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: 'rgba(16, 185, 129, 0.3)' }
                    : isDanger
                    ? { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' }
                    : { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' };

                  return (
                    <tr
                      key={item.id || idx}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background-color 0.15s ease' }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '600', color: '#F3F4F6', fontSize: '0.85rem' }}>
                          {item.category || item.analysis_type || 'Scan'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.filename || item.input_value || 'Direct Input'}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                          }}
                        >
                          {pred}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#E5E7EB', fontWeight: '600' }}>
                        {typeof item.confidence === 'number' ? `${item.confidence.toFixed(2)}%` : item.confidence || 'N/A'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#6B7280' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just now'}
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
