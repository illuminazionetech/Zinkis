import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import axios from 'axios';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/.netlify/functions/proxy': {
        target: 'http://localhost:5173',
        bypass: async (req, res) => {
          if (!req.url.includes('url=')) return;

          const url = new URL(req.url, `http://${req.headers.host}`);
          const targetUrl = url.searchParams.get('url');

          if (targetUrl) {
            try {
              const result = await axios({
                method: req.method,
                url: targetUrl,
                data: req.method === 'POST' ? req.body : undefined,
                headers: {
                  'User-Agent': 'Zinkis-Dev-Proxy',
                  'Accept': 'application/json'
                }
              });
              res.writeHead(result.status, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify(result.data));
            } catch (error) {
              res.writeHead(error.response?.status || 500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({
                error: error.message,
                details: error.response?.data
              }));
            }
            return false; // Handled by bypass
          }
        }
      }
    }
  }
});
