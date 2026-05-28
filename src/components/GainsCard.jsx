import React from 'react';

/**
 * Spaced currency formatter matching the friend's exact visual alignments.
 */
const formatSpacedCurrency = (value, isBanner = false) => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (isBanner) {
    return value < 0 ? `- $${formattedString}` : `$${formattedString}`;
  } else {
    return value < 0 ? `- $ ${formattedString}` : `$ ${formattedString}`;
  }
};

/**
 * Capital Gains card utilizing the original CSS styles.
 * 
 * @param {object} props
 * @param {string} props.title - 'Pre Harvesting' or 'After Harvesting'
 * @param {object} props.data - Gains data
 * @param {boolean} props.isAfter - Is after state card?
 * @param {number} props.savings - Dynamic savings amount
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

  const getNetColorClass = (value) => {
    return value < 0 ? "val-negative" : "val-positive";
  };

  return (
    <div className={`gains-card ${isAfter ? "after-card" : "pre-card"}`}>
      <h2 className="card-title">{title}</h2>

      <table className="gains-table">
        <thead>
          <tr>
            <th className="col-label" />
            <th className="col-val">Short-term</th>
            <th className="col-val">Long-term</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="row-label">Profits</td>
            <td className="row-val">{formatSpacedCurrency(stcgProfits)}</td>
            <td className="row-val">{formatSpacedCurrency(ltcgProfits)}</td>
          </tr>
          <tr>
            <td className="row-label">Losses</td>
            <td className="row-val val-negative">
              {stcgLosses === 0 ? '$ 0' : `-${formatSpacedCurrency(stcgLosses).replace('-', '')}`}
            </td>
            <td className="row-val val-negative">
              {ltcgLosses === 0 ? '$ 0' : `-${formatSpacedCurrency(ltcgLosses).replace('-', '')}`}
            </td>
          </tr>
          <tr className="net-row">
            <td className="row-label net-label">Net Capital Gains</td>
            <td className={`row-val net-val ${getNetColorClass(stcgNet)}`}>
              {formatSpacedCurrency(stcgNet)}
            </td>
            <td className={`row-val net-val ${getNetColorClass(ltcgNet)}`}>
              {formatSpacedCurrency(ltcgNet)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="realised-row">
        <span className="realised-label">
          {isAfter ? "Effective Capital Gains:" : "Realised Capital Gains:"}
        </span>
        <span className={`realised-val ${realizedTotal < 0 ? "val-negative" : ""}`}>
          {formatSpacedCurrency(realizedTotal, true)}
        </span>
      </div>

      {isAfter && savings !== null && savings > 0 && (
        <div className="savings-row">
          <span>🎉</span>
          <span>
            You are going to save upto{" "}
            <span className="savings-amount">
              {formatSpacedCurrency(savings, true)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
