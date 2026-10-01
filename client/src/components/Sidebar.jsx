import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  ImageIcon,
  Globe,
  PhoneCall,
  Mail,
  MessageSquare,
  Briefcase,
  GraduationCap,
  FileCheck,
  Newspaper,
  Video,
  History,
  Settings,
  LogOut,
  User,
  X
} from './Icons';

export default function Sidebar({ mobileOpen, setMobileOpen, currentUser, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  const aiSecurityNav = [
    { name: 'DeepFake Image', path: '/deepfake', icon: ImageIcon },
    { name: 'Video Analysis', path: '/video', icon: Video },
    { name: 'Website', path: '/website', icon: Globe },
    { name: 'Phone Calls', path: '/call', icon: PhoneCall },
    { name: 'Emails', path: '/email', icon: Mail },
    { name: 'Messages', path: '/message', icon: MessageSquare },
    { name: 'Applications', path: '/application', icon: FileCheck },
    { name: 'Internships', path: '/internship', icon: GraduationCap },
    { name: 'Job Offers', path: '/job', icon: Briefcase },
    { name: 'News Verification', path: '/news', icon: Newspaper },
  ];

  const managementNav = [
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
    const IconComponent = item.icon;

    return (
      <button
        key={item.path}
        onClick={() => handleNavClick(item.path)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: isActive ? '600' : '400',
          color: isActive ? '#FFFFFF' : '#9CA3AF',
          backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
          borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          textAlign: 'left',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = '#E5E7EB';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#9CA3AF';
          }
        }}
      >
        <IconComponent
          size={18}
          color={isActive ? '#818CF8' : '#6B7280'}
          style={{ flexShrink: 0 }}
        />
        <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </span>
      </button>
    );
  };

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0D1322',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        width: '260px',
        padding: '1.25rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          paddingLeft: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Shield size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#F9FAFB',
                letterSpacing: '0.03em',
                lineHeight: '1.2',
              }}
            >
              TRUSTGUARD <span style={{ color: '#818CF8' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Digital Security
            </p>
          </div>
        </div>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              display: 'none', // Shown only on mobile via media query/container
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          paddingRight: '0.25rem',
        }}
      >
        {/* Main */}
        <div>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              color: '#4B5563',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
            }}
          >
            MAIN
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {mainNav.map(renderNavItem)}
          </div>
        </div>

        {/* AI Security */}
        <div>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              color: '#4B5563',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
            }}
          >
            AI SECURITY
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {aiSecurityNav.map(renderNavItem)}
          </div>
        </div>

        {/* Management */}
        <div>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              color: '#4B5563',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
            }}
          >
            MANAGEMENT
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {managementNav.map(renderNavItem)}
          </div>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.5rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} color="#818CF8" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#F3F4F6',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUser?.full_name || 'Authenticated User'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                  }}
                />
                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '500' }}>
                  Authenticated
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#F87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          zIndex: 40,
        }}
        className="hidden-mobile"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
          }}
        />
      )}

      {/* Mobile Slide-Out Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          zIndex: 51,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
