import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import DisclaimerBanner from './components/DisclaimerBanner';
import GainsCard from './components/GainsCard';
import HoldingsTable from './components/HoldingsTable';
import { getCapitalGainsData, getHoldingsData } from './data/mockApi';
import { computeHarvestedGains } from './utils/calculations';

/**
 * Figma-exact, Mobile Responsive, and System-Theme-Aware Tax Loss Harvesting App Component
 * Matches the original CSS HTML structures (app-main, page-title-row, how-it-works-wrapper, etc.)
 */
export default function App() {
  const [capitalGains, setCapitalGains] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme state synchronized with the OS setting
  const [theme, setTheme] = useState('light');

  // Automatically load and listen to OS system colors (Light/Dark mode)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial state
    const systemPrefersDark = mediaQuery.matches;
    const initialTheme = systemPrefersDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // System theme change listener
    const handleSystemThemeChange = (e) => {
      const nextTheme = e.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    };

    // Standard media listener binding
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      return nextTheme;
    });
  };

  // 1. Core Data Retrieval
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [gainsRes, holdingsRes] = await Promise.all([
          getCapitalGainsData(600), // simulated network latency
          getHoldingsData(800)
        ]);

        if (active) {
          setCapitalGains(gainsRes.capitalGains);
          setHoldings(holdingsRes);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError('Failed to fetch portfolio analysis data. Please check your network connection.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // 2. Interactive Selection Handlers
  const handleToggleAsset = useCallback((id) => {
    setSelectedIds((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleToggleAllAssets = useCallback((idsToToggle) => {
    setSelectedIds((prevSet) => {
      const newSet = new Set(prevSet);
      const allSelected = idsToToggle.every(id => newSet.has(id));

      if (allSelected) {
        idsToToggle.forEach(id => newSet.delete(id));
      } else {
        idsToToggle.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  }, []);

  // 3. Real-Time Math & Projection Engine
  const selectedHoldings = useMemo(() => {
    return holdings.filter(h => selectedIds.has(h.id));
  }, [holdings, selectedIds]);

  const preHarvestingData = useMemo(() => {
    if (!capitalGains) return null;
    return {
      stcg: { ...capitalGains.stcg },
      ltcg: { ...capitalGains.ltcg }
    };
  }, [capitalGains]);

  const postHarvestingData = useMemo(() => {
    if (!capitalGains) return null;
    return computeHarvestedGains(capitalGains, selectedHoldings);
  }, [capitalGains, selectedHoldings]);

  const taxSavings = useMemo(() => {
    if (!preHarvestingData || !postHarvestingData) return 0;
    
    const preRealized = 
      (preHarvestingData.stcg.profits - preHarvestingData.stcg.losses) +
      (preHarvestingData.ltcg.profits - preHarvestingData.ltcg.losses);
      
    const postRealized = postHarvestingData.realised;
    
    if (preRealized > postRealized) {
      return preRealized - postRealized;
    }
    return 0;
  }, [preHarvestingData, postHarvestingData]);

  // Loading Spinner matching your friend's spinner exactly
  const renderLoadingSpinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="app-root">
      {/* Navigation Header with brand logo and theme switcher */}
      <Header theme={theme} onToggleTheme={handleToggleTheme} />

      {/* Main Container styled exactly to the original paddings and max-width */}
      <main className="app-main">
        {/* Page Title & Spaced Hover Tooltip */}
        <div className="page-title-row">
          <h1 className="page-title">Tax Harvesting</h1>
          <span className="how-it-works-wrapper">
            <a href="#!" className="how-it-works" onClick={(e) => e.preventDefault()}>How it works?</a>
            <div className="hiw-tooltip">
              <div className="hiw-tooltip-arrow" />
              Tax-loss harvesting lets you sell underperforming assets at a loss to decrease your taxable gains, lowering your overall tax bill.{" "}
              <a href="#!" className="tooltip-link" onClick={(e) => e.preventDefault()}>Know More</a>
            </div>
          </span>
        </div>

        {/* Accordion Warning Banner */}
        <DisclaimerBanner />

        {/* Glowing Error Banner */}
        {error && (
          <div className="error-banner">⚠️ {error}</div>
        )}

        {/* Dashboard Grid Content */}
        {loading ? (
          renderLoadingSpinner()
        ) : (
          <>
            {/* Pre & Post Harvesting Cards Grid */}
            <div className="cards-grid">
              <GainsCard 
                title="Pre Harvesting" 
                data={preHarvestingData} 
                isAfter={false} 
              />
              
              <GainsCard 
                title="After Harvesting" 
                data={postHarvestingData} 
                isAfter={true} 
                savings={taxSavings} 
              />
            </div>

            {/* Responsive Holdings Table */}
            <HoldingsTable 
              holdings={holdings}
              selectedIds={selectedIds}
              onToggleAsset={handleToggleAsset}
              onToggleAllAssets={handleToggleAllAssets}
            />
          </>
        )}
      </main>
    </div>
  );
}
