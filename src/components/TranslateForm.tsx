'use client';

import { useState, useCallback, useRef } from 'react';
import { ArrowLeftRight, Copy, Plus, Check, Loader2, Mic, MicOff } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLangName } from '@/lib/deepl';
import { saveTranslation, saveCard } from '@/lib/storage';
import { createNewCard } from '@/lib/spaced-repetition';
import type { Translation } from '@/types';
import { pinyin } from 'pinyin-pro';

function generatePinyin(text: string): string {
  return pinyin(text, { toneType: 'symbol', separator: ' ' });
}

function isChinese(langCode: string): boolean {
  return langCode === 'ZH-HANT' || langCode === 'ZH' || langCode === 'ZH-HANS';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('deepl_api_key') ?? '';
}

// 言語コード → SpeechRecognition lang 属性に変換
function toLang(code: string): string {
  const map: Record<string, string> = {
    JA: 'ja-JP', EN: 'en-US', ZH: 'zh-CN', 'ZH-HANT': 'zh-TW',
    KO: 'ko-KR', FR: 'fr-FR', DE: 'de-DE', ES: 'es-ES',
    IT: 'it-IT', PT: 'pt-BR', RU: 'ru-RU',
  };
  return map[code] ?? 'ja-JP';
}

export default function TranslateForm() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLang, setSourceLang] = useState('AUTO');
  const [targetLang, setTargetLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('default_target_lang') ?? 'JA';
    }
    return 'JA';
  });
  const [result, setResult] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    setAdded(false);

    try {
      const apiKey = getApiKey();
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-deepl-api-key': apiKey } : {}),
        },
        body: JSON.stringify({
          text: sourceText.trim(),
          targetLang,
          sourceLang: sourceLang === 'AUTO' ? undefined : sourceLang,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error);
      }

      const data = await response.json();
      const detectedLang = data.detectedSourceLang ?? sourceLang;

      const translation: Translation = {
        id: generateId(),
        sourceText: sourceText.trim(),
        translatedText: data.translatedText,
        sourceLang: detectedLang,
        targetLang,
        createdAt: Date.now(),
        inStudyList: false,
      };

      await saveTranslation(translation);
      setResult(translation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '翻訳に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleAddToStudy = useCallback(async () => {
    if (!result) return;
    const card = createNewCard(result);
    await saveCard(card);
    await saveTranslation({ ...result, inStudyList: true });
    setResult(prev => prev ? { ...prev, inStudyList: true } : prev);
    setAdded(true);
  }, [result]);

  const swapLanguages = useCallback(() => {
    if (sourceLang === 'AUTO') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (result) {
      setSourceText(result.translatedText);
      setResult(null);
    }
  }, [sourceLang, targetLang, result]);

  const toggleVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('このブラウザは音声入力に対応していません');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = toLang(sourceLang === 'AUTO' ? 'JA' : sourceLang);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setSourceText(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, sourceLang]);

  return (
    <div className="flex flex-col gap-4">
      {/* 言語選択 */}
      <div className="flex items-center gap-2">
        <select
          value={sourceLang}
          onChange={e => setSourceLang(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="AUTO">自動検出</option>
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        {/* 入れ替えボタン */}
        <button
          onClick={swapLanguages}
          disabled={sourceLang === 'AUTO'}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeftRight size={18} />
        </button>

        <select
          value={targetLang}
          onChange={e => setTargetLang(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {/* 入力エリア */}
      <div className="relative">
        <textarea
          value={sourceText}
          onChange={e => setSourceText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTranslate();
          }}
          placeholder="翻訳するテキストを入力..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* 音声入力ボタン */}
        <button
          onClick={toggleVoice}
          title="音声入力"
          className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <span className="absolute bottom-2 right-3 text-xs text-gray-400">
          {sourceText.length}文字
        </span>
      </div>

      {isListening && (
        <p className="text-sm text-red-500 text-center animate-pulse">🎤 話しかけてください...</p>
      )}

      {/* 翻訳ボタン */}
      <button
        onClick={handleTranslate}
        disabled={isLoading || !sourceText.trim()}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            翻訳中...
          </>
        ) : '翻訳する'}
      </button>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* 翻訳結果 */}
      {result && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {getLangName(result.sourceLang)} → {getLangName(result.targetLang)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'コピー済み' : 'コピー'}
              </button>
              <button
                onClick={handleAddToStudy}
                disabled={added || result.inStudyList}
                className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-60 disabled:cursor-not-allowed px-2 py-1 rounded"
              >
                {added || result.inStudyList ? (
                  <><Check size={14} /> 追加済み</>
                ) : (
                  <><Plus size={14} /> 学習リストへ</>
                )}
              </button>
            </div>
          </div>
          <div className="px-4 py-4">
            <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-900">{result.translatedText}</p>
            {isChinese(result.targetLang) && (
              <p className="mt-2 text-sm text-blue-500 leading-relaxed whitespace-pre-wrap">
                {generatePinyin(result.translatedText)}
              </p>
            )}
          </div>
        </div>
      )}

      {!getApiKey() && (
        <p className="text-xs text-amber-600 text-center">
          ⚠️ DeepL APIキー未設定のためモック翻訳です。設定画面でAPIキーを入力してください。
        </p>
      )}
    </div>
  );
}
