# KoinX Frontend Assignment - Tax Loss Harvesting Dashboard

A premium, fully responsive, and highly polished React dashboard that simulates **Tax Loss Harvesting** for cryptocurrency investments. This application allows users to analyze their capital gains profile, select underperforming holdings to offset profits against losses, and realize real-time tax savings.

---

## 🌟 Key Features

### 📊 Real-Time Tax Loss Simulator
* **Pre-Harvesting Card**: Shows baseline Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) profits, losses, and net values sourced from mock APIs.
* **After-Harvesting Card**: Projected gains card featuring a dynamic royal-to-blue gradient. Selection or deselection of individual assets instantly re-calculates the projected profits, losses, and total realized capital gains.
* **Live Savings Calculator**: A glowing green notification banner appears dynamically when taxes are reduced (`Pre-Harvesting Realized Gains > Post-Harvesting Realized Gains`).

### 🪙 Advanced Holdings Table
* **Dynamic Search**: Filter assets in real-time by coin symbol or name.
* **Multi-Column Sorting**: Sort your holdings by Tax Impact (absolute gain/loss), Alphabetical name, Current Price, STCG gains, or LTCG gains.
* **Interactive Selections**: High-performance multi-select checkboxes for holdings, complete with an **indeterminate state** in the table header select-all checkbox.
* **Smart Fallbacks**: Custom SVG fallbacks for currency logos that fail to load, maintaining visual integrity.
* **Amount to Sell**: Automatically displays the asset's total holding balance for selected assets to specify the harvesting quantity.
* **View More / View Less Pagination**: Prevents layout clutter by capping the list to the highest-impact holdings, with a seamless expanding toggle.

### 💎 Rich Design Aesthetics
* **Premium Dark Mode**: Styled with subtle space gradients, deep navy space panels, HSL-tailored colors, and thin border outlines.
* **Glassmorphic Panels**: Semi-transparent backgrounds with backdrop blur, subtle shadow elevations, and glowing hover states.
* **Fluid Feedback & Skeletons**: High-fidelity animated skeletons render during simulated network latency, avoiding generic spinners.
* **Collapsible Warnings**: The legal disclaimers banner has a collapsible accordion container with rotation chevrons.

---

## 🛠️ Architecture & Tech Stack

* **Core Framework**: React (Vite-based scaffolding)
* **Styling**: Modern vanilla CSS custom variables and design system tokens.
* **Data Access Layer**: Async Promise wrappers (`src/data/mockApi.js`) with artificial latency to test skeleton spinners.
* **Git Integrity**: Initialized as a brand-new repository with progressive, independent commits under Rishav Tarway's credentials (no cloned references).

---

## 📁 Project Directory Structure

```text
koinx-tax-loss-harvesting/
├── public/                  # Core static files and icons
├── src/
│   ├── assets/              # Core SVG assets
│   ├── components/          # Reusable modular UI components
│   │   ├── DisclaimerBanner.jsx  # Interactive accordion warning
│   │   ├── GainsCard.jsx         # Card template for Pre/Post states
│   │   ├── Header.jsx            # Premium navigation navbar
│   │   └── HoldingsTable.jsx     # High-fidelity holdings grid
│   ├── data/
│   │   └── mockApi.js       # Asynchronous mock API layer
│   ├── utils/
│   │   └── calculations.js  # Precision arithmetic calculations
│   ├── App.jsx              # Main orchestrator component
│   ├── index.css            # Premium CSS Design System tokens & global styles
│   └── main.jsx             # Entry script
├── index.html               # App entrypoint
├── package.json             # Core dependencies
└── README.md                # Documentation
```

---

## 💻 Local Setup & Running

Ensure you have **Node.js** (v18 or above) installed on your machine.

1. **Clone the repository** (or unzip the project folder).
2. **Navigate into the project directory**:
   ```bash
   cd koinx-tax-loss-harvesting
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Launch local dev server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** and visit `http://localhost:5173`.

---

## 📝 Core Architectural Assumptions

1. **Tax Loss Calculation**:
   * For any selected asset holding with a **positive gain** (`gain > 0`), that gain is added to the baseline **profits** of the corresponding category (STCG or LTCG).
   * For any selected asset holding with a **negative gain** (`gain < 0`), the absolute value of that loss is added to the baseline **losses** of the corresponding category (STCG or LTCG).
   * Net gains for STCG and LTCG are computed as `Profits - Losses`.
   * Realised Capital Gains is the sum of `Net STCG + Net LTCG`.
   * Savings are calculated as `Pre-harvesting Realised Gains - Post-harvesting Realised Gains` and are displayed only if this value is positive.

2. **Amount to Sell**:
   * In tax-loss harvesting, you must sell the asset to realize the loss. The "Amount to Sell" is automatically populated with the asset's total holding balance once selected, helping the user understand the operational step needed to lock in that tax credit.

3. **Data Availability**:
   * Sourced directly via high-fidelity static JSON data mock APIs, complying with the exact payload structures defined in the KoinX prompt details.

---

## 🚀 Deployment

The project is fully prepped for immediate deployment on **Vercel** or **Netlify**:

* To build the production-ready build folder locally:
  ```bash
  npm run build
  ```
* Drag and drop the resulting `dist/` directory directly onto Vercel dashboard, or install and run the Vercel CLI:
  ```bash
  npm install -g vercel
  vercel
  ```
