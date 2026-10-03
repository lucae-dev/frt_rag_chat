// src/config.js
const defaultApiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

const config = { API_BASE_URL: apiBaseUrl };

export default config;
