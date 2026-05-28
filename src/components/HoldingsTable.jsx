import React, { useState, useMemo, useRef, useEffect } from 'react';

/**
 * Standard Figma balance and currency spacing formatter.
 */
const formatFigmaTableCurrency = (value) => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return value < 0 ? `-$${formattedString}` : `+$${formattedString}`;
};

const formatFigmaValueCurrency = (value) => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `$ ${formattedString}`;
};

const formatFigmaCryptoBalance = (balance, symbol) => {
  const absVal = Math.abs(balance);
  if (absVal === 0) return `0 ${symbol}`;
  if (absVal < 1e-10) return `~0 ${symbol}`;
  
  let formattedBalance = balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  });
  
  return `${formattedBalance} ${symbol}`;
};

/**
 * Figma-exact Holdings Table Component
 * 
 * @param {object} props
 * @param {Array} props.holdings - Complete array of crypto asset holdings
 * @param {Set} props.selectedIds - Set containing selected asset unique IDs
 * @param {function} props.onToggleAsset - Handler to toggle a single asset selection
 * @param {function} props.onToggleAllAssets - Handler to select/deselect all holdings
 */
export default function HoldingsTable({ holdings, selectedIds, onToggleAsset, onToggleAllAssets }) {
  const [viewAll, setViewAll] = useState(false);
  const selectAllRef = useRef(null);

  const ITEMS_PREVIEW_LIMIT = 6;

  // Paginated Display
  const displayedHoldings = useMemo(() => {
    if (viewAll) return holdings;
    return holdings.slice(0, ITEMS_PREVIEW_LIMIT);
  }, [holdings, viewAll]);

  // Selection calculations
  const allIds = useMemo(() => holdings.map(h => h.id), [holdings]);
  const isAllSelected = holdings.length > 0 && selectedIds.size === holdings.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  // Update Indeterminate state
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  // Helper for gain styling classes
  const getGainClass = (gain) => {
    if (Math.abs(gain) < 0.0001) return 'gain-neutral';
    return gain < 0 ? 'gain-negative' : 'gain-positive';
  };

  return (
    <div className="holdings-container">
      <div className="holdings-controls">
        <div className="holdings-title-row">
          <h3 className="holdings-main-title">Holdings</h3>
        </div>
      </div>

      <div className="table-scroll-wrapper">
        <table className="holdings-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={selectAllRef}
                    onChange={() => onToggleAllAssets(allIds)}
                  />
                  <span className="checkbox-custom"></span>
                </label>
              </th>
              <th style={{ textAlign: 'left' }}>Asset</th>
              <th className="th-right" style={{ textAlign: 'right' }}>
                <div>Holdings</div>
                <div style={{ textTransform: 'none', fontSize: '10px', color: 'var(--c-text-muted)', marginTop: '2px', fontWeight: 'normal' }}>
                  Current Market Rate
                </div>
              </th>
              <th className="th-right" style={{ textAlign: 'right' }}>Total Current Value</th>
              <th className="th-right" style={{ textAlign: 'right' }}>Short-term</th>
              <th className="th-right" style={{ textAlign: 'right' }}>Long-Term</th>
              <th className="th-right" style={{ textAlign: 'right' }}>Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {displayedHoldings.map((holding) => {
              const isSelected = selectedIds.has(holding.id);
              const totalValue = holding.totalHolding * holding.currentPrice;

              return (
                <tr 
                  key={holding.id} 
                  className={`holding-tr ${isSelected ? 'row-selected' : ''}`}
                  onClick={() => onToggleAsset(holding.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Checkbox cell */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => onToggleAsset(holding.id)}
                      />
                      <span className="checkbox-custom"></span>
                    </label>
                  </td>

                  {/* Asset cell */}
                  <td>
                    <div className="asset-cell">
                      <img 
                        src={holding.logo} 
                        alt={holding.coin} 
                        className="coin-icon"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%231e293b'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='10' font-family='sans-serif' font-weight='bold'%3E${holding.coin.slice(0, 2)}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                      <div className="coin-info">
                        <span className="coin-symbol">
                          {holding.coin === 'USDC' && holding.coinName.includes('Bridged') ? 'USDC' : holding.coinName.split(' ')[0]}
                        </span>
                        <span className="coin-fullname">
                          {holding.coin}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Holdings Balance */}
                  <td className="td-right">
                    <div className="val-primary">
                      {formatFigmaCryptoBalance(holding.totalHolding, holding.coin).replace(` ${holding.coin}`, '')} {holding.coin}
                    </div>
                    <div className="val-secondary">
                      $ {holding.averageBuyPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{holding.coin}
                    </div>
                  </td>

                  {/* Total Current Value */}
                  <td className="td-right">
                    <div className="val-primary">
                      {formatFigmaValueCurrency(totalValue)}
                    </div>
                  </td>

                  {/* Short-term Gain */}
                  <td className="td-right">
                    <div className={`gain-pill ${getGainClass(holding.stcg.gain)}`}>
                      {formatFigmaTableCurrency(holding.stcg.gain)}
                    </div>
                    <div className="val-secondary">
                      {formatFigmaCryptoBalance(holding.stcg.balance, holding.coin)}
                    </div>
                  </td>

                  {/* Long-term Gain */}
                  <td className="td-right">
                    <div className={`gain-pill ${getGainClass(holding.ltcg.gain)}`}>
                      {formatFigmaTableCurrency(holding.ltcg.gain)}
                    </div>
                    <div className="val-secondary">
                      {formatFigmaCryptoBalance(holding.ltcg.balance, holding.coin)}
                    </div>
                  </td>

                  {/* Amount to Sell */}
                  <td className="td-right">
                    {isSelected ? (
                      <span className="sell-badge">
                        {formatFigmaCryptoBalance(holding.totalHolding, holding.coin)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--c-text-muted)' }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {holdings.length > ITEMS_PREVIEW_LIMIT && (
        <div className="view-more-row">
          <button 
            className="btn-view-all"
            onClick={() => setViewAll(prev => !prev)}
          >
            {viewAll ? 'View less' : 'View all'}
          </button>
        </div>
      )}
    </div>
  );
}
