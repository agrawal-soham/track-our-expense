import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fromUser, toUser, amount, paymentMode = 'online', notes } = body;

    const numAmount = parseFloat(amount);
    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'Both sender and recipient are required' }, { status: 400 });
    }
    if (fromUser === toUser) {
      return NextResponse.json({ error: 'Sender and recipient cannot be the same person' }, { status: 400 });
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const saved = await supabaseDb.recordSettlement({
      tripId: id,
      fromUser,
      toUser,
      amount: Math.round(numAmount * 100) / 100,
      paymentMode: paymentMode === 'cash' ? 'cash' : 'online',
      notes: notes?.trim() || '',
    });

    return NextResponse.json({ settlement: saved }, { status: 201 });
  } catch (err: any) {
    console.error('Error recording settlement:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
