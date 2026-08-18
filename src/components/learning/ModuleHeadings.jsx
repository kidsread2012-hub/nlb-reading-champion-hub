import React from 'react';

// C.A.P components — warm palette
const CAP_H3 = {
  Characterisation: { letter: 'C', badge: 'bg-amber-500' },
  Animation: { letter: 'A', badge: 'bg-rose-500' },
};

// 3Ps components — cool palette
const PS_H3 = {
  Pronunciation: { letter: 'P', badge: 'bg-sky-500' },
  Pause: { letter: 'P', badge: 'bg-violet-500' },
  Projection: { letter: 'P', badge: 'bg-teal-500' },
};

function extractText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node?.props?.children) return extractText(node.props.children);
  return '';
}

export function H2Renderer({ children }) {
  const text = extractText(children);
  const isCAP = text.includes('C.A.P');
  const is3Ps = text.includes('3Ps');

  if (isCAP) {
    return (
      <h2 className="!mt-8 flex items-center gap-3 border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/70 rounded-r-lg">
        {children}
      </h2>
    );
  }
  if (is3Ps) {
    return (
      <h2 className="!mt-8 flex items-center gap-3 border-l-4 border-sky-400 pl-4 py-2 bg-sky-50/70 rounded-r-lg">
        {children}
      </h2>
    );
  }
  return <h2 className="text-xl font-semibold mt-7 mb-3 text-foreground">{children}</h2>;
}

export function H3Renderer({ children }) {
  const text = extractText(children).trim();
  const capMatch = CAP_H3[text];
  const psMatch = PS_H3[text];

  if (capMatch || psMatch) {
    const match = capMatch || psMatch;
    return (
      <h3 className="flex items-center gap-3">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${match.badge} text-white text-base font-bold shadow-sm shrink-0`}>
          {match.letter}
        </span>
        <span>{children}</span>
      </h3>
    );
  }
  return <h3 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h3>;
}