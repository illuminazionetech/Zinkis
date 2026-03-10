import axios from 'axios';

const PROXY_PATH = '/.netlify/functions/proxy';

/**
 * apiClient handles all external requests through the Netlify proxy
 * to avoid CORS issues and protect API keys in production.
 */
const apiClient = {
  get: async (targetUrl, params = {}) => {
    try {
      // Construct the target URL with its own params first
      const targetUrlObj = new URL(targetUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          targetUrlObj.searchParams.append(key, value);
        }
      });

      // Point to our local/Netlify proxy
      const proxyUrl = new URL(PROXY_PATH, window.location.origin);
      proxyUrl.searchParams.set('url', targetUrlObj.toString());

      const response = await axios.get(proxyUrl.toString());
      return response.data;
    } catch (error) {
      console.error(`API Client GET Error [${targetUrl}]:`, error.response?.data || error.message);
      throw error;
    }
  },

  post: async (targetUrl, data = {}, headers = {}) => {
    try {
      const proxyUrl = new URL(PROXY_PATH, window.location.origin);
      proxyUrl.searchParams.set('url', targetUrl);

      // Clean headers for proxying
      const safeHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };

      const response = await axios.post(proxyUrl.toString(), data, { headers: safeHeaders });
      return response.data;
    } catch (error) {
      console.error(`API Client POST Error [${targetUrl}]:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default apiClient;
