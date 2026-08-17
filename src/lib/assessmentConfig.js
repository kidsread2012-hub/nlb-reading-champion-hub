// Assessment section definitions — mirrors base44/shared/assessmentConfig.ts for client-side use

export const ASSESSMENT_SECTIONS = [
  { id: "group1_letters", name: "Group 1 Letters", subtitle: "Letter Sounds", items: ["s", "a", "t", "i", "p", "n"], order: 1 },
  { id: "group1_blending", name: "Group 1 Blending", subtitle: "Word Blending", items: ["sit", "pin", "tap", "nap", "pan", "ant"], order: 2 },
  { id: "group2_letters", name: "Group 2 Letters", subtitle: "Letter Sounds", items: ["c", "k", "e", "h", "r", "m", "d"], order: 3 },
  { id: "group2_blending", name: "Group 2 Blending", subtitle: "Word Blending", items: ["cat", "hen", "red", "map", "rat", "kit", "rid"], order: 4 },
  { id: "group3_letters", name: "Group 3 Letters", subtitle: "Letter Sounds", items: ["g", "o", "u", "l", "f", "b"], order: 5 },
  { id: "group3_blending", name: "Group 3 Blending", subtitle: "Word Blending", items: ["bat", "sob", "fog", "lip", "tub", "elk"], order: 6 },
  { id: "rest_letters", name: "Rest of the Letters", subtitle: "Letter Sounds", items: ["j", "v", "w", "x", "y", "z"], order: 7 },
  { id: "rest_blending", name: "Blending", subtitle: "Word Blending", items: ["job", "van", "win", "box", "yap", "zap"], order: 8 },
  { id: "tricky_words", name: "Tricky Words", subtitle: "Sight Words", items: ["the", "to", "we", "be", "are", "here", "go", "who", "saw", "right", "also", "after"], order: 9 },
];

export const LEVEL_DESCRIPTIONS = {
  "Level 1": {
    title: "Level 1 — Foundation",
    description: "The child is building foundational letter-sound knowledge. Focus on Group 1 and Group 2 letter sounds and simple blending.",
    color: "emerald",
  },
  "Level 2": {
    title: "Level 2 — Developing",
    description: "The child knows basic letter sounds and blending. Focus on Group 3 sounds, blending, and introducing long vowel patterns.",
    color: "amber",
  },
  "Level 3": {
    title: "Level 3 — Proficient",
    description: "The child has strong phonics skills. Focus on long vowels, spelling patterns, and tricky words.",
    color: "blue",
  },
};