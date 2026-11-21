import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Trip, Member } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const trip = db.getTripByCode(code);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found with this invite code' }, { status: 404 });
    }
    return NextResponse.json({ trip });
  }

  const trips = db.getAllTrips();
  return NextResponse.json({ trips });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, currency = '₹', creatorName, memberNames = [] } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Trip name is required' }, { status: 400 });
    }

    const creatorId = 'm-' + uuidv4().substring(0, 8);
    const creatorMember: Member = {
      id: creatorId,
      name: creatorName?.trim() || 'Creator',
      color: '#3b82f6',
      joinedAt: new Date().toISOString(),
    };

    const colors = ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];
    const members: Member[] = [creatorMember];

    if (Array.isArray(memberNames)) {
      memberNames.forEach((mName: string, idx: number) => {
        if (mName && mName.trim() && mName.trim().toLowerCase() !== creatorMember.name.toLowerCase()) {
          members.push({
            id: 'm-' + uuidv4().substring(0, 8),
            name: mName.trim(),
            color: colors[idx % colors.length],
            joinedAt: new Date().toISOString(),
          });
        }
      });
    }

    // Generate readable 6-character code
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newTrip: Trip = {
      id: 'trip-' + uuidv4(),
      code: randomCode,
      name: name.trim(),
      description: description?.trim() || '',
      currency,
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
      members,
    };

    const saved = db.createTrip(newTrip);
    return NextResponse.json({ trip: saved, creatorMember }, { status: 201 });
  } catch (err: unknown) {
    console.error('Error creating trip:', err);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
