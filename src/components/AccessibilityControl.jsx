import React, { useState } from 'react';
import { Accessibility, Sun, Moon } from 'lucide-react';
import { useAccessibility } from '@/hooks/useAccessibility';

export default function AccessibilityControl() {
  const { prefs, toggleFont, setSize, toggleTheme, sizeLabels, sizeTitles } = useAccessibility();
  const [open, setOpen] = useState(false);
  const sizes = Object.keys(sizeLabels);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        aria-expanded={open}
      >
        <Accessibility className="w-4 h-4 shrink-0" />
        Accessibility
      </button>
      {open && (
        <div className="mt-2 space-y-3 p-3 rounded-lg bg-sidebar-accent/40">
          {/* Font toggle */}
          <div>
            <p className="text-xs text-sidebar-foreground/60 mb-1.5 font-medium">Reading font</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => prefs.font !== 'default' && toggleFont()}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  prefs.font === 'default'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'bg-sidebar-background/40 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => prefs.font !== 'dyslexic' && toggleFont()}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  prefs.font === 'dyslexic'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'bg-sidebar-background/40 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                }`}
              >
                Dyslexic
              </button>
            </div>
          </div>
          {/* Theme toggle */}
          <div>
            <p className="text-xs text-sidebar-foreground/60 mb-1.5 font-medium">Theme</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => prefs.theme !== 'light' && toggleTheme()}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  prefs.theme !== 'dark'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'bg-sidebar-background/40 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => prefs.theme !== 'dark' && toggleTheme()}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  prefs.theme === 'dark'
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'bg-sidebar-background/40 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>
          {/* Size adjuster */}
          <div>
            <p className="text-xs text-sidebar-foreground/60 mb-1.5 font-medium">Text size</p>
            <div className="grid grid-cols-4 gap-1">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  title={sizeTitles[s]}
                  className={`px-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    prefs.size === s
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'bg-sidebar-background/40 text-sidebar-foreground/70 hover:text-sidebar-foreground'
                  }`}
                >
                  {sizeLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}