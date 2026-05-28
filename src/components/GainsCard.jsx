import React from 'react';

/**
 * Custom spacing currency formatter designed specifically to match the Figma mockup.
 * Spacing rules:
 * - Table cells: profits/losses display as "$ 1,540" or "- $ 743" (with spaces).
 * - Total banners: realized values display as "$1,337" or "-$2,353" (without spaces).
 * 
 * @param {number} value - Numeric amount
 * @param {boolean} isBanner - Is it displayed in the bottom total banner?
 * @returns {string} Figma-spaced currency string
 */
const formatFigmaCurrency = (value, isBanner = false) => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (isBanner) {
    return value < 0 ? `-$${formattedString}` : `$${formattedString}`;
  } else {
    return value < 0 ? `- $ ${formattedString}` : `$ ${formattedString}`;
  }
};

/**
 * Capital Gains Glass Card Component matching the Figma mockups exactly.
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
    if (value === 0) return '';
    return value < 0 ? 'val-negative' : 'val-positive';
  };

  return (
    <div className={`card-glass ${isAfter ? 'card-post' : 'card-pre'}`}>
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
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
            <td>{formatFigmaCurrency(stcgProfits)}</td>
            <td>{formatFigmaCurrency(ltcgProfits)}</td>
          </tr>
          <tr>
            <td>Losses</td>
            <td className={isAfter ? '' : 'val-negative'}>
              {stcgLosses === 0 ? '$ 0' : `-${formatFigmaCurrency(stcgLosses).replace('-', '')}`}
            </td>
            <td className={isAfter ? '' : 'val-negative'}>
              {ltcgLosses === 0 ? '$ 0' : `-${formatFigmaCurrency(ltcgLosses).replace('-', '')}`}
            </td>
          </tr>
          <tr className="row-net">
            <td>Net Capital Gains</td>
            <td className={isAfter ? '' : getValClass(stcgNet)}>{formatFigmaCurrency(stcgNet)}</td>
            <td className={isAfter ? '' : getValClass(ltcgNet)}>{formatFigmaCurrency(ltcgNet)}</td>
          </tr>
        </tbody>
      </table>

      <div className="card-realised-banner">
        <span className="realised-title">
          {isAfter ? 'Effective Capital Gains:' : 'Realised Capital Gains:'}
        </span>
        <span className={`realised-value ${isAfter ? '' : getValClass(realizedTotal)}`}>
          {formatFigmaCurrency(realizedTotal, true)}
        </span>
      </div>

      {isAfter && savings !== null && savings > 0 && (
        <div className="savings-banner">
          <div className="savings-info">
            <span className="savings-label">
              You are going to save upto
            </span>
            <span className="savings-val">
              {formatFigmaCurrency(savings, true)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
