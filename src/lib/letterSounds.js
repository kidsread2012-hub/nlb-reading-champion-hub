// Central mapping of letter → phoneme text (for browser TTS fallback) + audio clip URL.
// Audio clips are generated British-English pronunciations hosted on Base44.
// The LetterSoundCard prefers audioUrl when present and falls back to SpeechSynthesis (en-GB).

export const LETTER_SOUND_DATA = {
  s: { phoneme: 'sss', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/232e72353_S.mp3' },
  a: { phoneme: 'ah', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/bb704d89e_A.mp3' },
  t: { phoneme: 'tuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/fabd387ef_T.mp3' },
  i: { phoneme: 'ih', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/280dd7e1f_I.mp3' },
  p: { phoneme: 'puh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/cdc93a374_P.mp3' },
  n: { phoneme: 'nnn', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/d30153b3b_N.mp3' },
  ck: { phoneme: 'cuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/c1d0d1773_ck.mp3' },
  c: { phoneme: 'cuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/c1d0d1773_ck.mp3' },
  k: { phoneme: 'cuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/c1d0d1773_ck.mp3' },
  e: { phoneme: 'eh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/1d0693760_E.mp3' },
  h: { phoneme: 'huh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/dd5f336e5_H.mp3' },
  r: { phoneme: 'rrr', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a10faa965_R.mp3' },
  m: { phoneme: 'mmm', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/0c7ea1587_M.mp3' },
  d: { phoneme: 'duh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/07ecb00a9_D.mp3' },
  g: { phoneme: 'guh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/d4d294f73_G.mp3' },
  o: { phoneme: 'aw', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/32d99b96e_O.mp3' },
  u: { phoneme: 'uh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/594324691_U.mp3' },
  l: { phoneme: 'lll', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/98e261b82_L.mp3' },
  f: { phoneme: 'fff', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/c6890bfc6_F.mp3' },
  b: { phoneme: 'buh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/e7f2ed66b_B.mp3' },
  j: { phoneme: 'juh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a5d288c5e_speech.mp3' },
  v: { phoneme: 'vvv', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/b4870da7c_V.mp3' },
  w: { phoneme: 'wuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a401e24cf_W.mp3' },
  x: { phoneme: 'ks', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/f0e00ff90_X.mp3' },
  y: { phoneme: 'yuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/762bd4c6a_Y.mp3' },
  z: { phoneme: 'zzz', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a02c55c40_Z.mp3' },
};