import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Concern } from '@/types';
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

  const { searchParams } = new URL(req.url);
  const expenseId = searchParams.get('expenseId') || undefined;

  const concerns = db.getConcerns(trip.id, expenseId);
  return NextResponse.json({ concerns });
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
    const { expenseId, raisedBy, raisedByName, message } = body;

    if (!expenseId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Expense ID and message are required' }, { status: 400 });
    }

    const newConcern: Concern = {
      id: 'con-' + uuidv4(),
      expenseId,
      tripId: trip.id,
      raisedBy: raisedBy || 'anonymous',
      raisedByName: raisedByName || 'Member',
      message: message.trim(),
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    const saved = db.addConcern(trip.id, newConcern);
    return NextResponse.json({ concern: saved }, { status: 201 });
  } catch (err: unknown) {
    console.error('Error raising concern:', err);
    return NextResponse.json({ error: 'Failed to raise concern' }, { status: 500 });
  }
}
