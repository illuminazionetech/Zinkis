import axios from 'axios';

const proxyUrl = '/.netlify/functions/proxy';

const apiClient = {
  get: async (targetUrl, params = {}) => {
    // 1. Try via Proxy
    try {
      const url = new URL(proxyUrl, window.location.origin);
      const fullTargetUrl = new URL(targetUrl);
      Object.keys(params).forEach(key => fullTargetUrl.searchParams.append(key, params[key]));
      url.searchParams.set('url', fullTargetUrl.toString());

      const response = await axios.get(url.toString());
      return response.data;
    } catch (proxyError) {
      // If proxy fails (404 = not found, likely local dev), try direct
      if (proxyError.response?.status === 404 || proxyError.code === 'ERR_NETWORK') {
        console.warn('Proxy not available, falling back to direct API call');
        const response = await axios.get(targetUrl, { params });
        return response.data;
      }
      throw proxyError;
    }
  },

  post: async (targetUrl, data = {}, headers = {}) => {
    // 1. Try via Proxy
    try {
      const url = new URL(proxyUrl, window.location.origin);
      url.searchParams.set('url', targetUrl);

      const response = await axios.post(url.toString(), data, { headers });
      return response.data;
    } catch (proxyError) {
      // If proxy fails, try direct
      if (proxyError.response?.status === 404 || proxyError.code === 'ERR_NETWORK') {
        console.warn('Proxy not available, falling back to direct API call');
        const response = await axios.post(targetUrl, data, { headers });
        return response.data;
      }
      throw proxyError;
    }
  }
};

export default apiClient;
