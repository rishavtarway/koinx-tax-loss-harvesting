import React from 'react';

/**
 * Premium Navigation Header Component
 * Renders the brand logo and user action profiles.
 */
export default function Header() {
  return (
    <header className="nav-header">
      <a href="/" className="nav-brand" onClick={(e) => e.preventDefault()}>
        <div className="brand-icon">
          {/* Custom vector arrow glow logo representation */}
          <svg viewBox="0 0 24 24">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <div className="brand-logo">
          Koin<span className="logo-accent">X</span>
        </div>
      </a>

      <div className="header-actions">
        <button className="btn-profile">
          <span className="avatar-dot"></span>
          <span>Rishav Tarway</span>
        </button>
      </div>
    </header>
  );
}
