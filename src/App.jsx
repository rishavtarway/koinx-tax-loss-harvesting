import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import DisclaimerBanner from './components/DisclaimerBanner';
import GainsCard from './components/GainsCard';
import HoldingsTable from './components/HoldingsTable';
import { getCapitalGainsData, getHoldingsData } from './data/mockApi';
import { computeHarvestedGains } from './utils/calculations';

/**
 * Premium Tax Loss Harvesting Orchestrator App Component
 */
export default function App() {
  const [capitalGains, setCapitalGains] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Core Data Retrieval
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [gainsRes, holdingsRes] = await Promise.all([
          getCapitalGainsData(800), // simulated premium loading delay
          getHoldingsData(1000)
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
      
      // Check if all given items are already selected
      const allSelected = idsToToggle.every(id => newSet.has(id));

      if (allSelected) {
        // Deselect all items in this subset
        idsToToggle.forEach(id => newSet.delete(id));
      } else {
        // Select all items in this subset
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
    
    // Only display savings if the projection reduces total taxable realized capital gains
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
        <Header />

        <main>
          {/* Headline Hero section */}
          <section className="hero-section">
            <div className="hero-meta">
              <h1>Tax Loss Harvesting</h1>
              <p>Optimize your crypto tax liabilities by offsetting realized profits with simulated asset losses.</p>
            </div>
            
            <button className="how-it-works-btn">
              <span>How does it work?</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="tooltip-box">
                <h4>What is Tax Loss Harvesting?</h4>
                <p>Tax-loss harvesting lets you sell underperforming assets at a loss to decrease your taxable gains, lowering your overall tax bill.</p>
                <p style={{ marginTop: '8px', color: 'var(--c-primary)' }}>Select individual holdings below to calculate real-time savings.</p>
              </div>
            </button>
          </section>

          {/* Legal / Warning Banner */}
          <DisclaimerBanner />

          {/* Glowing Error Banner */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--c-loss)',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '32px',
              fontWeight: 500,
              fontSize: '15px',
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
