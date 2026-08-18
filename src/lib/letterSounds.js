// Central mapping of letter → phoneme text (for browser TTS fallback) + optional audio clip URL.
// To use real British pronunciation clips, set `audioUrl` for each letter.
// The LetterSoundCard prefers audioUrl when present and falls back to SpeechSynthesis (en-GB).

export const LETTER_SOUND_DATA = {
  s: { phoneme: 'sss', audioUrl: null },
  a: { phoneme: 'ah', audioUrl: null },
  t: { phoneme: 'tuh', audioUrl: null },
  i: { phoneme: 'ih', audioUrl: null },
  p: { phoneme: 'puh', audioUrl: null },
  n: { phoneme: 'nnn', audioUrl: null },
  c: { phoneme: 'cuh', audioUrl: null },
  k: { phoneme: 'cuh', audioUrl: null },
  e: { phoneme: 'eh', audioUrl: null },
  h: { phoneme: 'huh', audioUrl: null },
  r: { phoneme: 'rrr', audioUrl: null },
  m: { phoneme: 'mmm', audioUrl: null },
  d: { phoneme: 'duh', audioUrl: null },
  g: { phoneme: 'guh', audioUrl: null },
  o: { phoneme: 'aw', audioUrl: null },
  u: { phoneme: 'uh', audioUrl: null },
  l: { phoneme: 'lll', audioUrl: null },
  f: { phoneme: 'fff', audioUrl: null },
  b: { phoneme: 'buh', audioUrl: null },
  j: { phoneme: 'juh', audioUrl: null },
  q: { phoneme: 'kwuh', audioUrl: null },
  v: { phoneme: 'vvv', audioUrl: null },
  w: { phoneme: 'wuh', audioUrl: null },
  x: { phoneme: 'ks', audioUrl: null },
  y: { phoneme: 'yuh', audioUrl: null },
  z: { phoneme: 'zzz', audioUrl: null },
};