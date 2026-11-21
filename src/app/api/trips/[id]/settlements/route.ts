import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Settlement } from '@/types';
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

  const settlements = db.getSettlements(trip.id);
  return NextResponse.json({ settlements });
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

    const newSettlement: Settlement = {
      id: 'set-' + uuidv4(),
      tripId: trip.id,
      fromUser,
      toUser,
      amount: Math.round(numAmount * 100) / 100,
      paymentMode: paymentMode === 'cash' ? 'cash' : 'online',
      notes: notes?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const saved = db.addSettlement(trip.id, newSettlement);
    return NextResponse.json({ settlement: saved }, { status: 201 });
  } catch (err: unknown) {
    console.error('Error creating settlement request:', err);
    return NextResponse.json({ error: 'Failed to create settlement request' }, { status: 500 });
  }
}
