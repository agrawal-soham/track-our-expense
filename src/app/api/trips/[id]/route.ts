import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { calculateAnalytics } from '@/lib/calculations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let trip = db.getTripById(id);

  if (!trip) {
    // Check if code was passed instead of id
    trip = db.getTripByCode(id);
  }

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  const expenses = db.getExpenses(trip.id);
  const settlements = db.getSettlements(trip.id);
  const concerns = db.getConcerns(trip.id);

  const analytics = calculateAnalytics(trip.members, expenses, settlements);

  return NextResponse.json({
    trip,
    expenses,
    settlements,
    concerns,
    analytics,
  });
}
