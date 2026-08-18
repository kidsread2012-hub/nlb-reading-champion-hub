import React from 'react';
import { Flame } from 'lucide-react';

export default function StreakChip({ streak }) {
  if (!streak || streak < 1) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold shrink-0">
      <Flame className="w-3.5 h-3.5" />
      {streak} streak
    </span>
  );
}