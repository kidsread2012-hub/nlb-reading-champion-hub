// Central mapping of letter → phoneme text (for browser TTS fallback) + audio clip URL.
// Audio clips are generated British-English pronunciations hosted on Base44.
// The LetterSoundCard prefers audioUrl when present and falls back to SpeechSynthesis (en-GB).

export const LETTER_SOUND_DATA = {
  s: { phoneme: 'sss', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/ce54c0e4e_speech.mp3' },
  a: { phoneme: 'ah', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/e00047ec2_speech.mp3' },
  t: { phoneme: 'tuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/53d1d7894_speech.mp3' },
  i: { phoneme: 'ih', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/28973ffec_speech.mp3' },
  p: { phoneme: 'puh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/14121e840_speech.mp3' },
  n: { phoneme: 'nnn', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/1a90ac96e_speech.mp3' },
  c: { phoneme: 'cuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/8c35aa331_speech.mp3' },
  k: { phoneme: 'cuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/095e1cb4d_speech.mp3' },
  e: { phoneme: 'eh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/639b0d2dc_speech.mp3' },
  h: { phoneme: 'huh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/5b13e1f09_speech.mp3' },
  r: { phoneme: 'rrr', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/2dbc4493a_speech.mp3' },
  m: { phoneme: 'mmm', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/d9b8125ac_speech.mp3' },
  d: { phoneme: 'duh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/bc120b2f9_speech.mp3' },
  g: { phoneme: 'guh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/d89840c9a_speech.mp3' },
  o: { phoneme: 'aw', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/43e998c4b_speech.mp3' },
  u: { phoneme: 'uh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a94368b2a_speech.mp3' },
  l: { phoneme: 'lll', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/0aec61774_speech.mp3' },
  f: { phoneme: 'fff', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/110e417c6_speech.mp3' },
  b: { phoneme: 'buh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/7ddcb1800_speech.mp3' },
  j: { phoneme: 'juh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a5d288c5e_speech.mp3' },
  q: { phoneme: 'kwuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/ac6481ed1_speech.mp3' },
  v: { phoneme: 'vvv', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/cdfc0f64d_speech.mp3' },
  w: { phoneme: 'wuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/4c127b82d_speech.mp3' },
  x: { phoneme: 'ks', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/5f4f56773_speech.mp3' },
  y: { phoneme: 'yuh', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/a72782c05_speech.mp3' },
  z: { phoneme: 'zzz', audioUrl: 'https://media.base44.com/files/public/6a8283551ca1bf63608554d5/e13e2b701_speech.mp3' },
};