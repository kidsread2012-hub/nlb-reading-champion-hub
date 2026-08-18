// Module-level singleton ensuring only one letter-sound clip plays at a time.
// Starting a new sound stops whatever is currently playing (MP3 or TTS).

let currentAudio = null;       // HTMLAudioElement currently playing
let currentUtterance = null;    // SpeechSynthesisUtterance currently playing
let currentLetter = null;      // which letter is playing
let listeners = new Set();      // subscribers notified on play/stop

function notify(letter) {
  currentLetter = letter;
  listeners.forEach((fn) => fn(letter));
}

export function onPlayingChange(fn) {
  listeners.add(fn);
  if (currentLetter) fn(currentLetter);
  return () => {
    listeners.delete(fn);
  };
}

export function getPlayingLetter() {
  return currentLetter;
}

export function stopAll() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onplaying = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  currentUtterance = null;
  notify(null);
}

export function playAudio(url, letter, onFallbackTTS) {
  stopAll();
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onplaying = () => notify(letter);
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
    notify(null);
  };
  audio.onerror = () => {
    if (currentAudio === audio) currentAudio = null;
    if (onFallbackTTS) onFallbackTTS();
  };
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
    if (onFallbackTTS) onFallbackTTS();
  });
}

export function playTTS(phoneme, letter) {
  stopAll();
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(phoneme);
  u.lang = 'en-GB';
  u.rate = 0.75;
  u.onstart = () => notify(letter);
  u.onend = () => {
    if (currentUtterance === u) currentUtterance = null;
    notify(null);
  };
  u.onerror = () => {
    if (currentUtterance === u) currentUtterance = null;
    notify(null);
  };
  currentUtterance = u;
  window.speechSynthesis.speak(u);
}