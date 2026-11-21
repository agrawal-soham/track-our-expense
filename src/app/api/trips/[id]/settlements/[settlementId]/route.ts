import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; settlementId: string }> }
) {
  try {
    const { id, settlementId } = await params;
    const trip = db.getTripById(id) || db.getTripByCode(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status, resolvedBy } = body;

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
    }

    const settlements = db.getSettlements(trip.id);
    const target = settlements.find((s) => s.id === settlementId);
    if (!target) {
      return NextResponse.json({ error: 'Settlement request not found' }, { status: 404 });
    }

    // Security check: Only the recipient (toUser) or trip creator can approve or reject
    if (resolvedBy && target.toUser !== resolvedBy && trip.createdBy !== resolvedBy) {
      return NextResponse.json(
        { error: 'Only the recipient of this payment can approve or reject it.' },
        { status: 403 }
      );
    }

    const updated = db.updateSettlementStatus(trip.id, settlementId, status, resolvedBy || target.toUser);
    return NextResponse.json({ settlement: updated });
  } catch (err: unknown) {
    console.error('Error updating settlement:', err);
    return NextResponse.json({ error: 'Failed to update settlement' }, { status: 500 });
  }
}
