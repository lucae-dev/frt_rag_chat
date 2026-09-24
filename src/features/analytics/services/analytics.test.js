jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    capture: jest.fn(),
    init: jest.fn(),
    startSessionRecording: jest.fn(),
  },
}));

import posthog from 'posthog-js';
import {
  captureAnalyticsEvent,
  initializeAnalytics,
  questionLengthBucket,
  sourceHost,
} from './analytics';

test('initializes session replay with chat privacy protections', () => {
  process.env.REACT_APP_POSTHOG_KEY = 'phc_test_key';
  process.env.REACT_APP_POSTHOG_HOST = 'https://eu.i.posthog.com';
  window.history.pushState({}, '', '/');

  expect(initializeAnalytics()).toBe(true);
  expect(posthog.init).toHaveBeenCalledWith('phc_test_key', expect.objectContaining({
    autocapture: false,
    disable_session_recording: false,
    enable_recording_console_log: false,
    session_recording: expect.objectContaining({
      maskAllInputs: true,
      recordBody: false,
      recordHeaders: false,
    }),
  }));

  const config = posthog.init.mock.calls[0][1];
  config.loaded(posthog);
  expect(posthog.startSessionRecording).toHaveBeenCalled();

  captureAnalyticsEvent('question_submitted', { question_length_bucket: 'under_50' });
  expect(posthog.capture).toHaveBeenCalledWith('question_submitted', {
    question_length_bucket: 'under_50',
  });
});

test('buckets content length without exposing content', () => {
  expect(questionLengthBucket(20)).toBe('under_50');
  expect(questionLengthBucket(100)).toBe('50_149');
  expect(questionLengthBucket(200)).toBe('150_299');
  expect(questionLengthBucket(500)).toBe('300_plus');
});

test('keeps only the source hostname for citation analytics', () => {
  expect(sourceHost('https://www.normattiva.it/atto?secret=value')).toBe('www.normattiva.it');
  expect(sourceHost('not-a-url')).toBe('unknown');
});
