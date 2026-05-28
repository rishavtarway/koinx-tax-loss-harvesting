import React, { useState } from 'react';

const DISCLAIMER_POINTS = [
  "Tax-loss harvesting is currently not allowed under Indian tax regulations. Please consult your tax advisor before making any decisions.",
  "Tax harvesting does not apply to derivatives or futures. These are handled separately as business income under tax rules.",
  "Price and market value data is fetched from Coingecko, not from individual exchanges. As a result, values may slightly differ from the ones on your exchange.",
  "Some countries do not have a short-term / long-term bifurcation. For now, we are calculating everything as long-term.",
  "Only realized losses are considered for harvesting. Unrealized losses in held assets are not counted.",
];

/**
 * Interactive Collapsible Disclaimer Banner
 * Renders bulleted legal/tax constraints with animations.
 */
export default function DisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="disclaimer-card">
      <button 
        className="disclaimer-trigger" 
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
      >
        <div className="disclaimer-label">
          {/* Glowing warning/info SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Important Notes &amp; Disclaimers</span>
        </div>
        
        {/* Animated Chevron */}
        <svg 
          className={`disclaimer-chevron ${isExpanded ? 'expanded' : ''}`} 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="disclaimer-content">
          <ul className="disclaimer-list">
            {DISCLAIMER_POINTS.map((point, index) => (
              <li key={index} className="disclaimer-item">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
