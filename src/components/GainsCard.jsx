import React from 'react';
import { formatCurrency } from '../utils/calculations';

/**
 * Premium Capital Gains Glass Card Component
 * 
 * @param {object} props
 * @param {string} props.title - 'Pre Harvesting' or 'After Harvesting'
 * @param {object} props.data - Capital gains records containing stcg and ltcg profiles
 * @param {boolean} props.isAfter - Is this the simulated After Harvesting card?
 * @param {number} props.savings - The calculated tax savings amount (if applicable)
 */
export default function GainsCard({ title, data, isAfter = false, savings = null }) {
  if (!data) return null;

  const stcgProfits = data.stcg.profits;
  const stcgLosses = data.stcg.losses;
  const stcgNet = stcgProfits - stcgLosses;

  const ltcgProfits = data.ltcg.profits;
  const ltcgLosses = data.ltcg.losses;
  const ltcgNet = ltcgProfits - ltcgLosses;

  const realizedTotal = stcgNet + ltcgNet;

  // Visual helper to apply color tags
  const getValClass = (value) => {
    if (value === 0) return 'text-neutral';
    return value < 0 ? 'val-negative' : 'val-positive';
  };

  return (
    <div className={`card-glass ${isAfter ? 'card-post' : 'card-pre'}`}>
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
        <span className="card-badge">
          {isAfter ? 'Projection' : 'Baseline'}
        </span>
      </div>

      <table className="card-table">
        <thead>
          <tr>
            <th></th>
            <th>Short-term</th>
            <th>Long-term</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Profits</td>
            <td>{formatCurrency(stcgProfits)}</td>
            <td>{formatCurrency(ltcgProfits)}</td>
          </tr>
          <tr>
            <td>Losses</td>
            <td className="val-negative">-{formatCurrency(stcgLosses, '')}</td>
            <td className="val-negative">-{formatCurrency(ltcgLosses, '')}</td>
          </tr>
          <tr className="row-net">
            <td>Net Gains</td>
            <td className={getValClass(stcgNet)}>{formatCurrency(stcgNet)}</td>
            <td className={getValClass(ltcgNet)}>{formatCurrency(ltcgNet)}</td>
          </tr>
        </tbody>
      </table>

      <div className="card-realised-banner">
        <span className="realised-title">
          {isAfter ? 'Effective Capital Gains' : 'Realised Capital Gains'}
        </span>
        <span className={`realised-value ${getValClass(realizedTotal)}`}>
          {formatCurrency(realizedTotal)}
        </span>
      </div>

      {isAfter && savings !== null && savings > 0 && (
        <div className="savings-banner">
          <div className="savings-icon-container">
            <span>🎉</span>
          </div>
          <div className="savings-info">
            <span className="savings-label">Taxes Reduced / Saved</span>
            <span className="savings-val">
              You save {formatCurrency(savings)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
