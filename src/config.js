// src/config.js
const defaultApiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || defaultApiBaseUrl;

const config = { API_BASE_URL: apiBaseUrl };

export default config;
