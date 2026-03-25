'use client';

export interface TranslateResult {
  translatedText: string;
  detectedSourceLang?: string;
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<TranslateResult> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang, sourceLang }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Translation failed: ${response.status}`);
  }

  return response.json();
}

export const SUPPORTED_LANGUAGES = [
  { code: 'JA', name: '日本語' },
  { code: 'EN', name: 'English' },
  { code: 'ZH', name: '中文（簡体）' },
  { code: 'ZH-HANT', name: '繁體中文（台湾）' },
  { code: 'KO', name: '한국어' },
  { code: 'FR', name: 'Français' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'ES', name: 'Español' },
  { code: 'IT', name: 'Italiano' },
  { code: 'PT', name: 'Português' },
  { code: 'RU', name: 'Русский' },
];

export function getLangName(code: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name ?? code;
}
