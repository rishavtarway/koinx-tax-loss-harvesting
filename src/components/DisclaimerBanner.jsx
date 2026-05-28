import React, { useState } from 'react';

const DISCLAIMER_POINTS = [
  "Tax-loss harvesting is currently not allowed under Indian tax regulations. Please consult your tax advisor before making any decisions.",
  "Tax harvesting does not apply to derivatives or futures. These are handled separately as business income under tax rules.",
  "Price and market value data is fetched from Coingecko, not from individual exchanges. As a result, values may slightly differ from the ones on your exchange.",
  "Some countries do not have a short-term / long-term bifurcation. For now, we are calculating everything as long-term.",
  "Only realized losses are considered for harvesting. Unrealized losses in held assets are not counted.",
];

/**
 * Collapsible disclaimer card matching the original CSS classes.
 */
export default function DisclaimerBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="disclaimer-banner">
      <button className="disclaimer-header" onClick={() => setOpen((o) => !o)}>
        <div className="disclaimer-left">
          <span className="info-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8.5" stroke="#3b82f6" />
              <text x="9" y="13" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">i</text>
            </svg>
          </span>
          <span className="disclaimer-title">Important Notes &amp; Disclaimers</span>
        </div>
        <svg
          className={`chevron ${open ? "open" : ""}`}
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="disclaimer-list">
          {DISCLAIMER_POINTS.map((pt, i) => (
            <li key={i} className="disclaimer-item">
              <span className="bullet">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
