import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <Link href="/auth" className="text-sm text-blue-600 hover:underline">← 戻る</Link>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-6">プライバシーポリシー</h1>
        <div className="text-sm text-gray-600 space-y-5 leading-relaxed">
          <p>Translingo（以下「本サービス」）は、ユーザーの個人情報の取り扱いについて以下の通り定めます。</p>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">1. 収集する情報</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>メールアドレス（登録時）</li>
              <li>Googleアカウント情報（Google認証を選択した場合）</li>
              <li>翻訳履歴・学習データ（サービス提供のため）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">2. 情報の利用目的</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの提供・改善</li>
              <li>ユーザー認証・アカウント管理</li>
              <li>サービスの利用状況分析（集計・匿名化されたデータ）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">3. 第三者への提供</h2>
            <p>以下の場合を除き、個人情報を第三者に提供しません。</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく開示が必要な場合</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">4. 利用する外部サービス</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong>：認証・データ保存（米国）</li>
              <li><strong>DeepL</strong>：翻訳処理（ドイツ）</li>
              <li><strong>Vercel</strong>：アプリケーションホスティング（米国）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">5. データの削除</h2>
            <p>アカウントの削除を希望される場合は、設定画面からログアウト後、お問い合わせください。登録情報および翻訳履歴を削除します。</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">6. お問い合わせ</h2>
            <p>個人情報の取り扱いに関するお問い合わせは、アプリ内のサポート窓口までご連絡ください。</p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">制定日：2025年1月</p>
        </div>
      </div>
    </div>
  );
}
