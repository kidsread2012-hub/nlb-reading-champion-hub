import React from 'react';
import LetterSoundCard from './LetterSoundCard';

export default function LetterSoundGrid({ cards }) {
  return (
    <div className="my-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
      {cards.map((c, i) => (
        <LetterSoundCard key={c.letter + '-' + i} letter={c.letter} word={c.word} />
      ))}
    </div>
  );
}