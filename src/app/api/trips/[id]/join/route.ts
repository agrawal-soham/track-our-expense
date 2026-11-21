import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Member } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, pin } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const trip = db.getTripById(id) || db.getTripByCode(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if name already exists in trip
    const existing = trip.members.find(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existing) {
      return NextResponse.json({ member: existing, trip, reconnected: true });
    }

    const colors = ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];
    const newMember: Member = {
      id: 'm-' + uuidv4().substring(0, 8),
      name: name.trim(),
      color: colors[trip.members.length % colors.length],
      pin: pin?.trim() || undefined,
      joinedAt: new Date().toISOString(),
    };

    const updatedTrip = db.addMemberToTrip(trip.id, newMember);
    return NextResponse.json({ member: newMember, trip: updatedTrip });
  } catch (err: unknown) {
    console.error('Error joining trip:', err);
    return NextResponse.json({ error: 'Failed to join trip' }, { status: 500 });
  }
}
