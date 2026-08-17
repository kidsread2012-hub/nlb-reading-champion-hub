import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nlb_accessibility_prefs';

const SIZE_STEPS = { sm: 16, md: 18, lg: 20, xl: 24 };
const SIZE_LABELS = { sm: 'S', md: 'M', lg: 'L', xl: 'XL' };
const SIZE_TITLES = { sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra Large' };

const DEFAULT_PREFS = { font: 'default', size: 'md', theme: 'light' };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_PREFS;
}

function applyPrefs(prefs) {
  const root = document.documentElement;
  root.classList.toggle('font-dyslexic', prefs.font === 'dyslexic');
  root.classList.toggle('dark', prefs.theme === 'dark');
  root.style.fontSize = `${SIZE_STEPS[prefs.size] || 18}px`;
}

export function useAccessibility() {
  const [prefs, setPrefs] = useState(() => loadPrefs());

  useEffect(() => {
    applyPrefs(prefs);
  }, [prefs]);

  const update = useCallback((newPrefs) => {
    setPrefs((prev) => {
      const merged = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        /* ignore */
      }
      applyPrefs(merged);
      return merged;
    });
  }, []);

  const toggleFont = useCallback(() => {
    update({ font: prefs.font === 'dyslexic' ? 'default' : 'dyslexic' });
  }, [prefs.font, update]);

  const setSize = useCallback((size) => {
    update({ size });
  }, [update]);

  const toggleTheme = useCallback(() => {
    update({ theme: prefs.theme === 'dark' ? 'light' : 'dark' });
  }, [prefs.theme, update]);

  return { prefs, toggleFont, setSize, toggleTheme, sizeLabels: SIZE_LABELS, sizeTitles: SIZE_TITLES };
}