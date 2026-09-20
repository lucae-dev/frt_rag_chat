// src/config.js
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const config = { API_BASE_URL: apiBaseUrl };

export default config;
