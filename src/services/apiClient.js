import axios from 'axios';

const proxyUrl = '/.netlify/functions/proxy';

const apiClient = {
  get: async (targetUrl, params = {}) => {
    const url = new URL(proxyUrl, window.location.origin);
    url.searchParams.append('url', targetUrl);

    // Add other params to the targetUrl if needed, or send them as is
    const fullTargetUrl = new URL(targetUrl);
    Object.keys(params).forEach(key => fullTargetUrl.searchParams.append(key, params[key]));

    url.searchParams.set('url', fullTargetUrl.toString());

    const response = await axios.get(url.toString());
    return response.data;
  },

  post: async (targetUrl, data = {}, headers = {}) => {
    const url = new URL(proxyUrl, window.location.origin);
    url.searchParams.append('url', targetUrl);

    const response = await axios.post(url.toString(), data, { headers });
    return response.data;
  }
};

export default apiClient;
