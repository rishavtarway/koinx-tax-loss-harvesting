import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatCurrency, formatCryptoBalance, sortHoldingsByImpact } from '../utils/calculations';

/**
 * Premium Interactive Holdings Table Component
 * 
 * @param {object} props
 * @param {Array} props.holdings - Complete array of crypto asset holdings
 * @param {Set} props.selectedIds - Set containing selected asset unique IDs
 * @param {function} props.onToggleAsset - Handler to toggle a single asset selection
 * @param {function} props.onToggleAllAssets - Handler to select/deselect all currently filtered assets
 */
export default function HoldingsTable({ holdings, selectedIds, onToggleAsset, onToggleAllAssets }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('impact');
  const [viewAll, setViewAll] = useState(false);
  const selectAllRef = useRef(null);

  const ITEMS_PREVIEW_LIMIT = 6;

  // 1. Search Filtering Logic
  const filteredHoldings = useMemo(() => {
    if (!searchTerm.trim()) return holdings;
    
    const query = searchTerm.toLowerCase().trim();
    return holdings.filter(h => 
      h.coin.toLowerCase().includes(query) || 
      h.coinName.toLowerCase().includes(query)
    );
  }, [holdings, searchTerm]);

  // 2. Sorting Logic
  const sortedHoldings = useMemo(() => {
    const list = [...filteredHoldings];
    
    switch (sortBy) {
      case 'impact':
        return sortHoldingsByImpact(list);
      case 'alphabetical':
        return list.sort((a, b) => a.coin.localeCompare(b.coin));
      case 'price-desc':
        return list.sort((a, b) => b.currentPrice - a.currentPrice);
      case 'stcg-desc':
        return list.sort((a, b) => b.stcg.gain - a.stcg.gain);
      case 'ltcg-desc':
        return list.sort((a, b) => b.ltcg.gain - a.ltcg.gain);
      default:
        return list;
    }
  }, [filteredHoldings, sortBy]);

  // 3. Paginated Display
  const displayedHoldings = useMemo(() => {
    if (viewAll) return sortedHoldings;
    return sortedHoldings.slice(0, ITEMS_PREVIEW_LIMIT);
  }, [sortedHoldings, viewAll]);

  // 4. Selection calculations on *filtered* subset
  const filteredIds = useMemo(() => filteredHoldings.map(h => h.id), [filteredHoldings]);
  const selectedFilteredCount = useMemo(() => {
    return filteredIds.filter(id => selectedIds.has(id)).length;
  }, [filteredIds, selectedIds]);

  const isAllSelected = filteredHoldings.length > 0 && selectedFilteredCount === filteredHoldings.length;
  const isSomeSelected = selectedFilteredCount > 0 && !isAllSelected;

  // 5. Update Select-All Indeterminate state
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

  const getGainDisplay = (gain) => {
    if (Math.abs(gain) < 0.0001) return '$0.00';
    return formatCurrency(gain);
  };

  return (
    <div className="holdings-container">
      <div className="holdings-controls">
        <div className="holdings-title-row">
          <h3 className="holdings-main-title">Asset Holdings</h3>
          <span className="holdings-count-badge">
            {filteredHoldings.length} {filteredHoldings.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>

        <div className="table-actions">
          {/* Custom Search Input */}
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name or ticker..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Custom Sorting Options */}
          <select 
            className="sort-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="impact">Sort by: Tax Impact</option>
            <option value="alphabetical">Sort by: Alphabetical</option>
            <option value="price-desc">Sort by: Current Price (High)</option>
            <option value="stcg-desc">Sort by: STCG Gain (High)</option>
            <option value="ltcg-desc">Sort by: LTCG Gain (High)</option>
          </select>
        </div>
      </div>

      <div className="table-scroll-wrapper">
        <table className="holdings-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={selectAllRef}
                    onChange={() => onToggleAllAssets(filteredIds)}
                  />
                  <span className="checkbox-custom"></span>
                </label>
              </th>
              <th>Asset</th>
              <th className="th-right">Holdings Balance</th>
              <th className="th-right hide-mobile">Current Price</th>
              <th className="th-right hide-tablet">Total Current Value</th>
              <th className="th-right">Short-Term Gain</th>
              <th className="th-right">Long-Term Gain</th>
              <th className="th-right">Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {displayedHoldings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text-muted)' }}>
                  No matching assets found. Try adjusting your search query.
                </td>
              </tr>
            ) : (
              displayedHoldings.map((holding) => {
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

                    {/* Asset Logo and Ticker cell */}
                    <td>
                      <div className="asset-cell">
                        <img 
                          src={holding.logo} 
                          alt={holding.coin} 
                          className="coin-icon"
                          onError={(e) => {
                            // Fallback rendering
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%231e293b'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='10' font-family='sans-serif' font-weight='bold'%3E${holding.coin.slice(0, 2)}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                        <div className="coin-info">
                          <span className="coin-symbol">{holding.coin}</span>
                          <span className="coin-fullname" title={holding.coinName}>
                            {holding.coinName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Holdings quantity and average buy price */}
                    <td className="td-right">
                      <div className="val-primary">
                        {formatCryptoBalance(holding.totalHolding)} {holding.coin}
                      </div>
                      <div className="val-secondary">
                        Avg: {formatCurrency(holding.averageBuyPrice)}
                      </div>
                    </td>

                    {/* Current Price */}
                    <td className="td-right hide-mobile">
                      <div className="val-primary">
                        {formatCurrency(holding.currentPrice)}
                      </div>
                    </td>

                    {/* Total Current Value */}
                    <td className="td-right hide-tablet">
                      <div className="val-primary">
                        {formatCurrency(totalValue)}
                      </div>
                    </td>

                    {/* STCG Gain */}
                    <td className="td-right">
                      <div className={`gain-pill ${getGainClass(holding.stcg.gain)}`}>
                        {getGainDisplay(holding.stcg.gain)}
                      </div>
                      <div className="val-secondary">
                        Bal: {formatCryptoBalance(holding.stcg.balance)} {holding.coin}
                      </div>
                    </td>

                    {/* LTCG Gain */}
                    <td className="td-right">
                      <div className={`gain-pill ${getGainClass(holding.ltcg.gain)}`}>
                        {getGainDisplay(holding.ltcg.gain)}
                      </div>
                      <div className="val-secondary">
                        Bal: {formatCryptoBalance(holding.ltcg.balance)} {holding.coin}
                      </div>
                    </td>

                    {/* Amount to Sell */}
                    <td className="td-right">
                      {isSelected ? (
                        <span className="sell-badge">
                          {formatCryptoBalance(holding.totalHolding)} {holding.coin}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--c-text-muted)', fontSize: '13px' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sortedHoldings.length > ITEMS_PREVIEW_LIMIT && (
        <div className="view-more-row">
          <button 
            className={`btn-view-all ${viewAll ? 'expanded' : ''}`}
            onClick={() => setViewAll(prev => !prev)}
          >
            <span>{viewAll ? 'View Less' : `View All (${sortedHoldings.length})`}</span>
            <svg 
              width="16" 
              height="16" 
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
        </div>
      )}
    </div>
  );
}
