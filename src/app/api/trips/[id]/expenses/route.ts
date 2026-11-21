import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      amount,
      paidBy,
      splitBetween,
      paymentMode = 'online',
      remarks,
      category = 'General',
      date,
      createdBy,
    } = body;

    const numAmount = parseFloat(amount);
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Expense title is required' }, { status: 400 });
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid expense amount is required' }, { status: 400 });
    }
    if (!paidBy) {
      return NextResponse.json({ error: 'Payer is required' }, { status: 400 });
    }
    if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
      return NextResponse.json({ error: 'At least one person must be in split' }, { status: 400 });
    }

    const saved = await supabaseDb.addExpense({
      tripId: id,
      title: title.trim(),
      amount: Math.round(numAmount * 100) / 100,
      paidBy,
      splitBetween,
      paymentMode: paymentMode === 'cash' ? 'cash' : 'online',
      remarks: remarks?.trim() || '',
      category: category.trim(),
      date: date || new Date().toISOString().split('T')[0],
      createdBy: createdBy || paidBy,
    });

    return NextResponse.json({ expense: saved }, { status: 201 });
  } catch (err: any) {
    console.error('Error adding expense:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
