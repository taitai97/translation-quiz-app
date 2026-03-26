import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <Link href="/auth" className="text-sm text-blue-600 hover:underline">← 戻る</Link>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-6">利用規約</h1>
        <div className="text-sm text-gray-600 space-y-5 leading-relaxed">
          <p>本規約は、Translingo（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には、本規約に同意いただいた上でご利用いただきます。</p>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">第1条（利用登録）</h2>
            <p>本サービスへの登録は、本規約に同意した時点で完了します。虚偽の情報を登録した場合、登録を取り消すことがあります。</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">第2条（禁止事項）</h2>
            <p>以下の行為を禁止します。</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>法令または公序良俗に反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーや第三者に不利益を与える行為</li>
              <li>不正アクセスや過度な負荷をかける行為</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">第3条（サービスの変更・停止）</h2>
            <p>当方は、ユーザーへの事前通知なく本サービスの内容変更や提供停止を行う場合があります。これによりユーザーに生じた損害について、当方は責任を負いません。</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">第4条（免責事項）</h2>
            <p>本サービスは現状有姿で提供されます。翻訳結果の正確性、完全性について保証しません。本サービスの利用によって生じた損害について、当方は一切責任を負いません。</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-2">第5条（規約の変更）</h2>
            <p>当方は必要に応じて本規約を変更できます。変更後の規約はサービス上に表示した時点から効力を生じます。</p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">制定日：2025年1月</p>
        </div>
      </div>
    </div>
  );
}
