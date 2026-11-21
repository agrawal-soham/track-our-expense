import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const success = await supabaseDb.addMember(id, userId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('Error joining trip:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
