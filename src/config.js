// src/config.js
const defaultApiBaseUrl = import.meta.env.PROD ? '' : 'http://localhost:8080';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

const config = { API_BASE_URL: apiBaseUrl };

export default config;
