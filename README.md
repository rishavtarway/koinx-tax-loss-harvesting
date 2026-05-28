# KoinX Frontend Internship - Tax Loss Harvesting Assignment

This is a responsive React-based Tax Loss Harvesting dashboard built for the KoinX frontend intern assignment. The tool allows users to see their capital gains (pre and post harvesting), view their crypto holdings, and simulate tax savings by selecting specific underperforming assets to harvest.

## Features Implemented

* **Capital Gains Cards**: Shows profits, losses, net capital gains, and total realized capital gains for both Pre-Harvesting and After-Harvesting states.
* **Dynamic Tax Simulator**: Selecting or deselecting a holding automatically recalculates the After-Harvesting card values in real-time.
* **Savings Calculator**: Displays a "You are going to save upto $X" alert when the projected capital gains are reduced.
* **Holdings Table**: Renders the complete list of holdings with checkbox selections, coin names, tickers, average buy prices, current prices, STCG, LTCG, and amount to sell.
* **Mobile Responsiveness**: Stacks the layout on mobile screens and consolidates columns to fit perfectly on narrow screens.
* **System Color scheme support**: Automatically boots in Light or Dark theme based on the user's computer preference, with a manual theme toggler in the header.

## Setup and Run Instructions

Make sure you have Node.js installed on your machine.

1. Navigate to the project folder:
   ```bash
   cd koinx-tax-loss-harvesting
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

To create a production-ready build:
```bash
npm run build
```
This will generate a `dist` folder which can be deployed to Vercel, Netlify, or any other hosting provider.

## Assumptions Made

1. **Tax Harvesting Arithmetic**:
   * For each selected holding, if the short-term or long-term gain is positive, the value is added to the baseline profits.
   * If the gain is negative, the absolute value is added to the baseline losses.
   * Net gains = Profits - Losses.
   * Realised Capital Gains = Net STCG + Net LTCG.
   * Savings are shown only when Pre-harvesting realized capital gains exceed Post-harvesting capital gains.
2. **Amount to Sell**:
   * The "Amount to Sell" column is populated with the selected asset's total holding balance when checked, indicating the complete sale needed to lock in that capital loss.
3. **Mock APIs**:
   * The API requests are mocked locally in `src/data/mockApi.js` using async promises and simulated network delays.
