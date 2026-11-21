import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { expenseId, raisedBy, raisedByName, message } = body;

    if (!expenseId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Expense ID and message are required' }, { status: 400 });
    }

    const saved = await supabaseDb.addConcern({
      expenseId,
      tripId: id,
      raisedBy,
      raisedByName: raisedByName || 'Member',
      message: message.trim(),
    });

    return NextResponse.json({ concern: saved }, { status: 201 });
  } catch (err: any) {
    console.error('Error raising concern:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
