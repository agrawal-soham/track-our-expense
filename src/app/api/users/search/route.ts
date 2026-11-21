import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  // Search profiles by username or full_name or email
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, email, avatar_url')
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(10);

  if (error) {
    console.error('Error searching profiles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data || [] });
}
