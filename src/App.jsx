import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import DisclaimerBanner from './components/DisclaimerBanner';
import GainsCard from './components/GainsCard';
import HoldingsTable from './components/HoldingsTable';
import { getCapitalGainsData, getHoldingsData } from './data/mockApi';
import { computeHarvestedGains } from './utils/calculations';

/**
 * Figma-exact, Mobile Responsive, and System-Theme-Aware Tax Loss Harvesting App Component
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

  // Loading Skeletons
  const renderLoadingSkeletons = () => (
    <>
      <div className="gains-grid">
        <div className="card-glass skeleton skeleton-card"></div>
        <div className="card-glass skeleton skeleton-card"></div>
      </div>
      <div className="holdings-container">
        <div className="skeleton skeleton-title" style={{ width: '200px' }}></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
        <div className="skeleton skeleton-row"></div>
      </div>
    </>
  );

  return (
    <div className="app-root">
      <div className="app-container">
        {/* Navigation Bar */}
        <Header theme={theme} onToggleTheme={handleToggleTheme} />

        <main>
          {/* Headline Hero section matching Figma exactly */}
          <section className="hero-section">
            <div className="hero-meta">
              <h1>
                Tax Harvesting
                <button className="how-it-works-btn" style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
                  <span>How it works?</span>
                  <div className="tooltip-box">
                    <h4>What is Tax Loss Harvesting?</h4>
                    <p>Tax-loss harvesting lets you sell underperforming assets at a loss to decrease your taxable gains, lowering your overall tax bill.</p>
                    <p style={{ marginTop: '6px', color: '#60a5fa' }}>Select individual holdings below to calculate real-time savings.</p>
                  </div>
                </button>
              </h1>
            </div>
          </section>

          {/* Legal / Warning Accordion Banner */}
          <DisclaimerBanner />

          {/* Glowing Error Banner */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--c-loss)',
              padding: '14px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Primary Dashboard Content */}
          {loading ? (
            renderLoadingSkeletons()
          ) : (
            <>
              {/* Capital Gains Cards */}
              <div className="gains-grid">
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

              {/* Holdings Section */}
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
    </div>
  );
}
