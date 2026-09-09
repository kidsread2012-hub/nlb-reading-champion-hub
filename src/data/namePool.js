// Age-appropriate, locally familiar child names reflecting Singapore's multicultural context.
// Used by the AI Coach guided practice to name the child(ren) in each scenario.

export const CHILD_NAMES = [
  'Emma',
  'Arjun',
  'Mei Ling',
  'Siti',
  'Wei Jie',
  'Priya',
  'Hafiz',
  'Xin Yi',
  'Nurul',
  'Jia Hao',
  'Aisha',
  'Ravi',
  'Chloe',
  'Daniel',
  'Farah',
  'Gabriel',
  'Hana',
  'Isaac',
  'Kavya',
  'Lucas',
  'Maya',
  'Omar',
  'Preeti',
  'Qi Wen',
  'Sanjay',
  'Tara',
  'Uma',
  'Vishnu',
  'Xuan',
  'Yuki',
];

// Pick a single random name, optionally excluding the last-used to avoid back-to-back repeats.
export function pickName(exclude) {
  let pool = CHILD_NAMES;
  if (exclude && pool.length > 1) {
    pool = pool.filter((n) => n !== exclude);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// Pick N distinct random names, optionally excluding the last-used.
export function pickNames(count, exclude) {
  let pool = CHILD_NAMES.filter((n) => n !== exclude);
  const picked = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool = pool.filter((n) => n !== pool[idx]);
  }
  return picked;
}