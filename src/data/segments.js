// Learning segment configuration — visual style + metadata for each programme pillar.
// Power Up (orange) = early reading / letter sounds; Read (red) = storytelling / reading aloud.

import { Zap, BookOpen } from 'lucide-react';

export const SEGMENTS = [
  {
    id: 'power_up',
    name: 'Power Up',
    tagline: 'Growing confident, independent readers',
    icon: Zap,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    panelBg: 'bg-white',
    panelBorder: 'border-orange-200/70',
    bandBg: 'bg-orange-100',
    titleColor: 'text-orange-900',
    subtitleColor: 'text-orange-700/80',
    accent: 'orange',
    accentHex: '#EA580C',
    leftEdge: 'border-l-4 border-l-orange-500',
    iconChipBg: 'bg-orange-100',
    iconChipColor: 'text-orange-600',
  },
  {
    id: 'storytelling',
    name: 'Read',
    tagline: 'Reading aloud & storytelling',
    icon: BookOpen,
    iconBg: 'bg-red-600',
    iconColor: 'text-white',
    panelBg: 'bg-white',
    panelBorder: 'border-red-200/70',
    bandBg: 'bg-red-100',
    titleColor: 'text-red-900',
    subtitleColor: 'text-red-700/80',
    accent: 'red',
    accentHex: '#DC2626',
    leftEdge: 'border-l-4 border-l-red-600',
    iconChipBg: 'bg-red-100',
    iconChipColor: 'text-red-600',
  },
];