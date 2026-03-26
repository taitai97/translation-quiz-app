import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 認証チェック
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // service_role でRLSをバイパスして全データを集計
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneWeekAgoISO = new Date(oneWeekAgo).toISOString();

  const [
    { data: usersData },
    { count: totalTranslations },
    { count: weekTranslations },
    { count: totalCards },
    { count: totalSessions },
    { data: dailyData },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('translations').select('*', { count: 'exact', head: true }),
    admin.from('translations').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
    admin.from('cards').select('*', { count: 'exact', head: true }),
    admin.from('study_records').select('*', { count: 'exact', head: true }),
    admin.from('study_records').select('reviewed_at, user_id').gte('reviewed_at', oneWeekAgo),
  ]);

  const users = usersData?.users ?? [];
  const totalUsers = users.length;
  const weekUsers = users.filter(u => new Date(u.created_at) >= new Date(oneWeekAgoISO)).length;

  // 日別アクティブユーザー（直近7日）
  const dailyActive: Record<string, Set<string>> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyActive[d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })] = new Set();
  }
  for (const row of (dailyData ?? [])) {
    const d = new Date(row.reviewed_at);
    const key = d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    if (dailyActive[key]) dailyActive[key].add(row.user_id);
  }
  const dailyActiveUsers = Object.entries(dailyActive).map(([date, set]) => ({
    date,
    count: set.size,
  }));

  // プロバイダー別ユーザー数
  const providerCount: Record<string, number> = {};
  for (const u of users) {
    const provider = u.app_metadata?.provider ?? 'unknown';
    providerCount[provider] = (providerCount[provider] ?? 0) + 1;
  }

  return NextResponse.json({
    users: { total: totalUsers, thisWeek: weekUsers, byProvider: providerCount },
    translations: { total: totalTranslations ?? 0, thisWeek: weekTranslations ?? 0 },
    cards: { total: totalCards ?? 0 },
    sessions: { total: totalSessions ?? 0 },
    dailyActiveUsers,
  });
}
