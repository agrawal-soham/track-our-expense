import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Expense } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = db.getTripById(id) || db.getTripByCode(id);
  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  const expenses = db.getExpenses(trip.id);
  return NextResponse.json({ expenses });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = db.getTripById(id) || db.getTripByCode(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

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

    const newExpense: Expense = {
      id: 'exp-' + uuidv4(),
      tripId: trip.id,
      title: title.trim(),
      amount: Math.round(numAmount * 100) / 100,
      paidBy,
      splitBetween,
      paymentMode: paymentMode === 'cash' ? 'cash' : 'online',
      remarks: remarks?.trim() || '',
      category: category.trim(),
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: createdBy || paidBy,
    };

    const saved = db.addExpense(trip.id, newExpense);
    return NextResponse.json({ expense: saved }, { status: 201 });
  } catch (err: unknown) {
    console.error('Error adding expense:', err);
    return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
  }
}
