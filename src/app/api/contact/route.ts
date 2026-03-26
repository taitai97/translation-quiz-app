import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.category || !body?.message) {
    return NextResponse.json({ error: 'category and message are required' }, { status: 400 });
  }

  const { error } = await supabase.from('contact_messages').insert({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user_id: user.id,
    email: user.email ?? '',
    category: body.category,
    message: body.message,
    created_at: Date.now(),
    is_read: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
