const axios = require('axios');

const ALLOWED_DOMAINS = [
  'maps.googleapis.com',
  'places.googleapis.com',
  'airquality.googleapis.com',
  'pollen.googleapis.com',
  'solar.googleapis.com',
  'addressvalidation.googleapis.com',
  'routes.googleapis.com',
  'tile.googleapis.com',
  'roads.googleapis.com',
  'timezone.googleapis.com',
  'besttime.app',
  'overpass-api.de',
  'nominatim.openstreetmap.org'
];

exports.handler = async (event, context) => {
  const { httpMethod, headers, queryStringParameters, body } = event;

  const targetUrl = queryStringParameters.url;
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing target URL' }),
    };
  }

  try {
    const urlObj = new URL(targetUrl);
    if (!ALLOWED_DOMAINS.includes(urlObj.hostname)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Domain not allowed: ' + urlObj.hostname }),
      };
    }

    // Sanitize headers: only keep essential ones or common safe ones
    const safeHeaders = {};
    const allowedHeaders = ['content-type', 'authorization', 'accept', 'x-goog-api-key', 'x-goog-fieldmask'];

    Object.keys(headers).forEach(key => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        safeHeaders[key] = headers[key];
      }
    });

    // Add User-Agent for Nominatim compliance
    safeHeaders['User-Agent'] = 'Zinkis-Retail-Analysis-App/1.0 (contact: support@zinkis-app.local)';

    const config = {
      method: httpMethod,
      url: targetUrl,
      headers: safeHeaders,
    };

    if (body && httpMethod !== 'GET') {
      config.data = body;
    }

    const response = await axios(config);

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Goog-Api-Key, X-Goog-FieldMask',
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.message, details: error.response ? error.response.data : null }),
    };
  }
};
