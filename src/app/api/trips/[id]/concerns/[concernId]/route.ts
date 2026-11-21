import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; concernId: string }> }
) {
  try {
    const { concernId } = await params;
    const success = await supabaseDb.resolveConcern(concernId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('Error resolving concern:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
