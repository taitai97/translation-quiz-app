import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.text || !body.targetLang) {
    return NextResponse.json({ error: 'text and targetLang are required' }, { status: 400 });
  }

  const { text, targetLang, sourceLang } = body;

  if (text.length > 500) {
    return NextResponse.json({ error: '翻訳テキストは500文字以内にしてください' }, { status: 400 });
  }

  // ユーザーのキー優先、なければサーバーの環境変数にフォールバック
  const apiKey = request.headers.get('x-deepl-api-key') || process.env.DEEPL_API_KEY;

  if (!apiKey) {
    // どちらも未設定の場合のみモック翻訳
    return NextResponse.json({
      translatedText: `[Mock] ${text}`,
      detectedSourceLang: sourceLang || 'AUTO',
    });
  }

  try {
    const params = new URLSearchParams({
      text,
      target_lang: targetLang,
    });
    if (sourceLang && sourceLang !== 'AUTO') {
      params.append('source_lang', sourceLang);
    }

    const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!deeplResponse.ok) {
      const errorText = await deeplResponse.text();
      return NextResponse.json(
        { error: `DeepL API error: ${deeplResponse.status} ${errorText}` },
        { status: deeplResponse.status }
      );
    }

    const data = await deeplResponse.json();
    const translation = data.translations?.[0];

    return NextResponse.json({
      translatedText: translation?.text ?? '',
      detectedSourceLang: translation?.detected_source_language,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to call DeepL API' }, { status: 500 });
  }
}
