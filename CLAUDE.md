# Translation Quiz App — CLAUDE.md

## プロジェクト概要
日常的な翻訳単語・文章を記憶に定着させるWebアプリ。
翻訳機能 + SM-2アルゴリズムによるフラッシュカード復習。
ログイン不要・ローカル保存・PWA対応。

**技術スタック:** Next.js 14 + TypeScript + Tailwind CSS + IndexedDB (idb) + DeepL API

## 絶対ルール
- ユーザーデータは外部に送信しない（DeepL APIキーを使う翻訳リクエスト以外）
- DeepL APIキーはlocalStorageに保存する（Next.js API Route経由でのみ使用）
- 削除操作には必ず確認を入れる
- 頼んだことだけ実装する。余計な改善・リファクタリングはしない

## やってはいけないこと
- IndexedDB直接操作（必ずlib/storage.tsのラッパー経由で）
- APIキーをクライアントサイドのコードに直接埋め込む
- `npm run build`なしでデプロイしない

## ファイル構造
```
src/
  app/
    page.tsx              # 翻訳画面（メイン）
    history/page.tsx      # 履歴画面
    quiz/page.tsx         # フラッシュカード画面
    settings/page.tsx     # 設定画面
    layout.tsx            # 共通レイアウト（ナビゲーション）
    api/translate/route.ts # DeepL API Route（キーを隠す）
  components/
    TranslateForm.tsx     # 翻訳フォーム
    FlashCard.tsx         # フリップアニメーション付きカード
    HistoryList.tsx       # 履歴一覧
    Navigation.tsx        # ボトムナビ
  lib/
    storage.ts            # IndexedDB CRUD
    spaced-repetition.ts  # SM-2アルゴリズム
    deepl.ts              # DeepL API呼び出し（クライアント側）
  types/
    index.ts              # 型定義
```

## 設計原則
- IndexedDBのDBバージョンを変更するときは必ずマイグレーションを書く
- SM-2の計算ロジックはlib/spaced-repetition.tsに閉じ込める
- 言語コードはDeepL APIの形式（"JA", "EN", "ZH"等）に統一する

## デプロイ
- Vercel推奨: `git push`で自動デプロイ
- 環境変数: DEEPL_API_KEY（設定画面からlocalStorageに保存→APIルートで使用）
- `npm run dev` でローカル確認、`npm run build`でビルド確認

## デバッグ手順
1. ブラウザDevTools → Application → IndexedDB で保存データを確認
2. localStorage → `deepl_api_key`, `default_source_lang`, `default_target_lang`
3. APIエラーは `/api/translate` のレスポンスをNetworkタブで確認
