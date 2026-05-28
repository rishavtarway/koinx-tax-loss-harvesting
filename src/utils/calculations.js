/**
 * Premium Crypto Portfolio and Capital Gains Utility Calculations Engine
 */

/**
 * Formats a numeric value as a beautifully structured currency string.
 * Supports customizable prefixes (defaults to INR ₹ or USD $).
 * 
 * @param {number} value - Numeric amount
 * @param {string} prefix - Currency symbol prefix
 * @returns {string} Fully formatted text representation
 */
export const formatCurrency = (value, prefix = "$") => {
  const absoluteValue = Math.abs(value);
  const formattedString = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (value < 0) {
    return `-${prefix}${formattedString}`;
  }
  return `${prefix}${formattedString}`;
};

/**
 * High-precision balance formatter designed specifically for crypto quantities.
 * Prevents UI layout blowups by automatically switching to scientific notation 
 * for micro-fractional balances, while keeping standard balances clean and readable.
 * 
 * @param {number} balance - The holding quantity balance
 * @param {number} maxDecimals - Maximum fractional digits
 * @returns {string} Clean human-readable string
 */
export const formatCryptoBalance = (balance, maxDecimals = 6) => {
  const absVal = Math.abs(balance);
  
  if (absVal === 0) return "0";
  if (absVal < 1e-10) return "~0";
  if (absVal < 0.0001) return balance.toExponential(3);
  
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

/**
 * Main calculation engine for Tax Loss Harvesting.
 * Accepts the baseline pre-harvesting gains and a list of currently selected holdings.
 * Incorporates selected assets' gains/losses into the totals to calculate the post-harvesting profile.
 * 
 * @param {object} baseGains - Baseline Capital Gains object (STCG & LTCG)
 * @param {Array} selectedAssets - Currently selected holdings array
 * @returns {object} Re-computed post-harvesting capital gains profile
 */
export const computeHarvestedGains = (baseGains, selectedAssets) => {
  // Deep clone or extract primitive values to avoid mutation
  let stcgProfits = baseGains.stcg.profits;
  let stcgLosses = baseGains.stcg.losses;
  let ltcgProfits = baseGains.ltcg.profits;
  let ltcgLosses = baseGains.ltcg.losses;

  selectedAssets.forEach((asset) => {
    // Process Short Term gains/losses
    if (asset.stcg && asset.stcg.gain !== 0) {
      if (asset.stcg.gain > 0) {
        stcgProfits += asset.stcg.gain;
      } else {
        stcgLosses += Math.abs(asset.stcg.gain);
      }
    }

    // Process Long Term gains/losses
    if (asset.ltcg && asset.ltcg.gain !== 0) {
      if (asset.ltcg.gain > 0) {
        ltcgProfits += asset.ltcg.gain;
      } else {
        ltcgLosses += Math.abs(asset.ltcg.gain);
      }
    }
  });

  const stcgNet = stcgProfits - stcgLosses;
  const ltcgNet = ltcgProfits - ltcgLosses;
  const totalRealised = stcgNet + ltcgNet;

  return {
    stcg: { 
      profits: stcgProfits, 
      losses: stcgLosses, 
      net: stcgNet 
    },
    ltcg: { 
      profits: ltcgProfits, 
      losses: ltcgLosses, 
      net: ltcgNet 
    },
    realised: totalRealised
  };
};

/**
 * Professional sorting utility for holdings table.
 * Sorts holdings in logical descending order by absolute total gain value.
 * This pushes the most impactful crypto assets (those with the highest potential gains/losses) to the top.
 * 
 * @param {Array} holdings - Original holdings list
 * @returns {Array} Descending sorted copy
 */
export const sortHoldingsByImpact = (holdings) => {
  return [...holdings].sort((first, second) => {
    const firstImpact = Math.abs(first.stcg.gain) + Math.abs(first.ltcg.gain);
    const secondImpact = Math.abs(second.stcg.gain) + Math.abs(second.ltcg.gain);
    return secondImpact - firstImpact;
  });
};
