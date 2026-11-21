import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const details = await supabaseDb.getTripWithDetails(id);

    if (!details) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (err: any) {
    console.error('Error getting trip details:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
