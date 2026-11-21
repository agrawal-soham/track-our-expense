import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; concernId: string }> }
) {
  try {
    const { id, concernId } = await params;
    const trip = db.getTripById(id) || db.getTripByCode(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const success = db.resolveConcern(trip.id, concernId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    console.error('Error resolving concern:', err);
    return NextResponse.json({ error: 'Failed to resolve concern' }, { status: 500 });
  }
}
