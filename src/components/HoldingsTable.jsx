import React, { useState, useMemo, useRef, useEffect } from 'react';

/**
 * Spaced currency formatter matching the original visual alignments.
 */
const formatSpacedCurrency = (value) => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return value < 0 ? `-$${formattedString}` : `+$${formattedString}`;
};

const formatSpacedValueCurrency = (value) => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `$ ${formattedString}`;
};

const formatSpacedCryptoBalance = (balance) => {
  if (Math.abs(balance) < 1e-10) return "~0";
  if (Math.abs(balance) < 0.0001) return balance.toExponential(2);
  return balance.toLocaleString("en-US", { maximumFractionDigits: 6 });
};

/**
 * Holdings Table Component replicating the exact original class names and cell paddings.
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
    if (Math.abs(gain) < 0.0001) return 'gain-zero';
    return gain < 0 ? 'gain-neg' : 'gain-pos';
  };

  return (
    <div className="holdings-section">
      <div className="holdings-header">
        <h2 className="holdings-title">Holdings</h2>
      </div>

      <div className="table-scroll">
        <table className="holdings-table">
          <thead>
            <tr className="thead-row">
              <th className="th-check">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  ref={selectAllRef}
                  onChange={() => onToggleAllAssets(allIds)}
                  className="row-checkbox"
                />
              </th>
              <th className="th-left">Asset</th>
              <th className="th-right">
                <div>Holdings</div>
                <div className="th-sub hide-mobile">Avg Buy Price</div>
              </th>
              <th className="th-right hide-mobile">Total Current Value</th>
              <th className="th-right hide-mobile">Short-term</th>
              <th className="th-right hide-mobile">Long-Term</th>
              <th className="th-right hide-mobile">Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {displayedHoldings.map((holding) => {
              const isSelected = selectedIds.has(holding.id);
              const totalValue = holding.totalHolding * holding.currentPrice;

              return (
                <tr 
                  key={holding.id} 
                  className={`holding-row ${isSelected ? 'row-selected' : ''}`}
                  onClick={() => onToggleAsset(holding.id)}
                >
                  {/* Checkbox cell with exact padding */}
                  <td className="td-check" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggleAsset(holding.id)}
                      className="row-checkbox"
                    />
                  </td>

                  {/* Asset cell with exact padding */}
                  <td className="td-asset">
                    <div className="asset-inner">
                      <img 
                        src={holding.logo} 
                        alt={holding.coin} 
                        className="coin-logo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%231f2937'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af' font-size='10' font-family='sans-serif' font-weight='bold'%3E${holding.coin.slice(0, 2)}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                      <div className="coin-info">
                        <span className="asset-name">
                          {holding.coin === 'USDC' && holding.coinName.includes('Bridged') ? 'USDC' : holding.coinName.split(' ')[0]}
                        </span>
                        <span className="asset-ticker">
                          {holding.coin}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Holdings Quantity with exact padding */}
                  <td className="td-right">
                    <div className="cell-primary">
                      {formatSpacedCryptoBalance(holding.totalHolding)} {holding.coin}
                    </div>
                    {/* Desktop subtext */}
                    <div className="cell-secondary hide-mobile">
                      $ {holding.averageBuyPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{holding.coin}
                    </div>
                    {/* Mobile subtext */}
                    <div className="cell-secondary show-mobile-only">
                      {formatSpacedValueCurrency(totalValue)}
                    </div>
                  </td>

                  {/* Total Current Value with exact padding (Desktop only) */}
                  <td className="td-right hide-mobile">
                    <div className="cell-primary">
                      {formatSpacedValueCurrency(totalValue)}
                    </div>
                  </td>

                  {/* Short-term Gain with exact padding (Desktop only) */}
                  <td className="td-right hide-mobile">
                    <div className={`cell-gain ${getGainClass(holding.stcg.gain)}`}>
                      {formatSpacedCurrency(holding.stcg.gain)}
                    </div>
                    <div className="cell-secondary">
                      {formatSpacedCryptoBalance(holding.stcg.balance)} {holding.coin}
                    </div>
                  </td>

                  {/* Long-term Gain with exact padding (Desktop only) */}
                  <td className="td-right hide-mobile">
                    <div className={`cell-gain ${getGainClass(holding.ltcg.gain)}`}>
                      {formatSpacedCurrency(holding.ltcg.gain)}
                    </div>
                    <div className="cell-secondary">
                      {formatSpacedCryptoBalance(holding.ltcg.balance)} {holding.coin}
                    </div>
                  </td>

                  {/* Amount to Sell with exact padding (Desktop only) */}
                  <td className="td-right hide-mobile">
                    {isSelected ? (
                      <span className="amount-to-sell">
                        {formatSpacedCryptoBalance(holding.totalHolding)} {holding.coin}
                      </span>
                    ) : (
                      <span className="cell-secondary">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {holdings.length > ITEMS_PREVIEW_LIMIT && (
        <div className="view-all-row">
          <button 
            className="view-all-btn"
            onClick={() => setViewAll(prev => !prev)}
          >
            {viewAll ? 'View less' : 'View all'}
          </button>
        </div>
      )}
    </div>
  );
}
