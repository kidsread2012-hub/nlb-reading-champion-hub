import React, { useState, useRef, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { LETTER_SOUND_DATA } from '@/lib/letterSounds';

export default function LetterSoundCard({ letter, word }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const data = LETTER_SOUND_DATA[letter.toLowerCase()] || {};

  const speakTTS = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(data.phoneme || letter);
    u.lang = 'en-GB';
    u.rate = 0.75;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  }, [data, letter]);

  const play = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      audio.onplaying = () => setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => speakTTS();
      audio.play().catch(() => speakTTS());
    } else {
      speakTTS();
    }
  }, [data, speakTTS]);

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Play the letter ${letter} sound, as in ${word}`}
      className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-4 md:p-5 transition-all duration-200 select-none cursor-pointer
        ${playing
          ? 'border-primary bg-primary/10 scale-[1.04] shadow-md'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
        }`}
    >
      <Volume2
        className={`absolute top-2.5 right-2.5 w-4 h-4 transition-opacity ${
          playing ? 'opacity-100 text-primary' : 'opacity-0'
        }`}
      />
      <span
        className={`font-literacy text-4xl md:text-5xl font-bold leading-none ${
          playing ? 'text-primary' : 'text-foreground'
        }`}
      >
        {letter}
      </span>
      <span className="text-sm md:text-base text-muted-foreground">{word}</span>
    </button>
  );
}