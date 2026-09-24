import posthog from 'posthog-js';

const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';
let initialized = false;

const isAdminPath = () => window.location.pathname.startsWith('/admin');

export const initializeAnalytics = () => {
  const projectKey = process.env.REACT_APP_POSTHOG_KEY?.trim();
  if (!projectKey || isAdminPath() || initialized) return false;

  posthog.init(projectKey, {
    api_host: process.env.REACT_APP_POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    capture_performance: true,
    disable_session_recording: false,
    enable_recording_console_log: false,
    persistence: 'localStorage',
    person_profiles: 'identified_only',
    session_recording: {
      blockSelector: '.ph-no-capture, [data-ph-no-capture]',
      maskAllInputs: true,
      maskTextSelector: '.ph-mask, [data-ph-mask]',
      recordBody: false,
      recordHeaders: false,
      recordCrossOriginIframes: false,
    },
    loaded: (client) => client.startSessionRecording(),
  });
  initialized = true;
  return true;
};

export const captureAnalyticsEvent = (eventName, properties = {}) => {
  if (!initialized || isAdminPath()) return;
  posthog.capture(eventName, properties);
};

export const questionLengthBucket = (length) => {
  if (length < 50) return 'under_50';
  if (length < 150) return '50_149';
  if (length < 300) return '150_299';
  return '300_plus';
};

export const sourceHost = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
};
