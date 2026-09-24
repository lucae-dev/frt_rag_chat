import { countSources, linkInlineCitations } from '../services/citationLinks';

const responseWithSources = `Il requisito si applica [S1].

---
**Fonti**
- [S1] [DPR IVA 633/1972 — Art. 10](https://www.normattiva.it/dpr-633)`;

test('turns an inline citation into the official source link', () => {
  expect(linkInlineCitations(responseWithSources)).toContain('[S1](https://www.normattiva.it/dpr-633)');
});

test('does not alter citations when the response has no source section', () => {
  expect(linkInlineCitations('Risposta senza fonti [S1].')).toBe('Risposta senza fonti [S1].');
});

test('counts only sources from the deterministic footer', () => {
  expect(countSources(responseWithSources)).toBe(1);
  expect(countSources('Risposta senza fonti [S1].')).toBe(0);
});
