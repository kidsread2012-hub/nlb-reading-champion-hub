import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { LETTER_SOUND_DATA } from '@/lib/letterSounds';
import { onPlayingChange, playAudio, playTTS, stopAll, getPlayingLetter } from '@/lib/letterAudioManager';

export default function LetterSoundCard({ letter, word }) {
  const audioKey = letter.includes('/') ? letter.replace('/', '').toLowerCase() : letter.toLowerCase();
  const [playing, setPlaying] = useState(() => getPlayingLetter() === audioKey);
  const data = LETTER_SOUND_DATA[audioKey] || {};

  useEffect(() => {
    return onPlayingChange((activeLetter) => {
      setPlaying(activeLetter === audioKey);
    });
  }, [audioKey]);

  const play = () => {
    if (getPlayingLetter() === audioKey) {
      // tapping the currently-playing card stops it
      stopAll();
      return;
    }
    if (data.audioUrl) {
      playAudio(data.audioUrl, audioKey, () => playTTS(data.phoneme || letter, audioKey));
    } else {
      playTTS(data.phoneme || letter, audioKey);
    }
  };

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Play the ${letter} sound, as in ${word}`}
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
        className={`font-literacy ${letter.length > 1 ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-bold leading-none ${
          playing ? 'text-primary' : 'text-foreground'
        }`}
      >
        {letter}
      </span>
      <span className="text-base md:text-lg text-muted-foreground">{word}</span>
    </button>
  );
}