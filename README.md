# Zinkis - Retail Location Intelligence Platform

Zinkis is a sophisticated WebGIS application designed for retail shop location analysis. It provides business owners and developers with data-driven insights to evaluate potential storefront locations using a combination of Google Maps Platform, BestTime, and OpenStreetMap data.

## 🚀 Key Features

*   **Competitor Analysis**: Discover nearby businesses in specific sectors using Google Places and OpenStreetMap (Overpass API).
*   **Foot Traffic Forecasts**: Visualize hourly popularity and peak times for specific venues via BestTime.app integration.
*   **Environmental Insights**:
    *   **Air Quality & Pollen**: Current atmospheric conditions and health advisories.
    *   **Solar Potential**: Estimated solar panel capacity and annual energy production (KWh) for buildings.
    *   **Elevation**: Precise terrain altitude for the target location.
*   **Logistics & Accessibility**: Calculate driving distances and travel times to major competitors.
*   **Address Validation**: Ensure high-quality location data with Google's Address Validation API.
*   **Responsive GIS Interface**: Fully localized (IT/EN) map-centric UI that works on mobile and desktop.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Lucide React.
*   **Mapping**: Leaflet.js, React-Leaflet.
*   **Data Viz**: Recharts (for popularity/foot traffic).
*   **Architecture**: Context API + Custom Hooks for clean state management and API orchestration.
*   **Backend/Proxy**: Netlify Functions (CORS Proxy for secure API communication).

## ⚙️ Setup & Configuration

### 1. API Keys Required
To use all features, you will need keys for:
*   **Google Maps Platform**: (Places, Maps, Air Quality, Pollen, Solar, Elevation, TimeZone, Address Validation).
*   **BestTime.app**: (Optional) For foot traffic data.

### 2. Local Development
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (configured with a local proxy in `vite.config.js`):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` and enter your API keys in the **Settings (Impostazioni)** panel. Keys are stored safely in `localStorage`.

### 3. Deployment
The app is optimized for **Netlify**:
*   The `functions/proxy.js` handles API requests to bypass CORS and protect your client-side keys.
*   The `vite.config.js` is set up to handle proxying during development.

## 📂 Project Structure

*   `src/services/AnalysisContext.jsx`: Global state for API keys and search results.
*   `src/services/useLocationAnalysis.js`: Core logic for coordinating multi-API data fetching.
*   `src/services/apiClient.js`: Secure communication wrapper using the proxy pattern.
*   `src/components/AnalyticsPanel.jsx`: Tabbed interface for environmental and popularity data.
*   `functions/proxy.js`: Production serverless proxy.

---
*Created with focus on performance, accessibility, and architectural cleaniless.*
