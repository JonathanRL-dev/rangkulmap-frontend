import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ColorModePreference = 'light' | 'dark' | 'system';
export type TextSizeLevel = 0 | 1 | 2 | 3;
export type LanguageCode = 'id' | 'en' | 'jv';

export const TEXT_SIZE_SCALES: Record<TextSizeLevel, number> = {
  0: 0.9,
  1: 1,
  2: 1.15,
  3: 1.35
};

interface AccessibilityContextValue {
  colorModePreference: ColorModePreference;
  setColorModePreference: (preference: ColorModePreference) => void;
  resolvedMode: 'light' | 'dark';
  textSizeLevel: TextSizeLevel;
  setTextSizeLevel: (level: TextSizeLevel) => void;
  fontScale: number;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  voiceCommandEnabled: boolean;
  setVoiceCommandEnabled: (enabled: boolean) => void;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function AccessibilityProvider({ children }: {children: React.ReactNode;}) {
  const [colorModePreference, setColorModePreference] = useState<ColorModePreference>('light');
  const [textSizeLevel, setTextSizeLevel] = useState<TextSizeLevel>(1);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceCommandEnabled, setVoiceCommandEnabled] = useState(true);
  const [language, setLanguage] = useState<LanguageCode>('id');
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedMode: 'light' | 'dark' =
  colorModePreference === 'system' ? systemPrefersDark ? 'dark' : 'light' : colorModePreference;

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      colorModePreference,
      setColorModePreference,
      resolvedMode,
      textSizeLevel,
      setTextSizeLevel,
      fontScale: TEXT_SIZE_SCALES[textSizeLevel],
      highContrast,
      setHighContrast,
      voiceCommandEnabled,
      setVoiceCommandEnabled,
      language,
      setLanguage
    }),
    [colorModePreference, resolvedMode, textSizeLevel, highContrast, voiceCommandEnabled, language]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility harus dipakai di dalam AccessibilityProvider');
  }
  return context;
}