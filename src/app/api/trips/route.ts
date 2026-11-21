import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('userId');

    if (code) {
      const trip = await supabaseDb.getTripByCode(code);
      if (!trip) {
        return NextResponse.json({ error: 'Trip not found with this invite code' }, { status: 404 });
      }
      return NextResponse.json({ trip });
    }

    if (userId) {
      const trips = await supabaseDb.getTripsForUser(userId);
      return NextResponse.json({ trips });
    }

    return NextResponse.json({ trips: [] });
  } catch (err: any) {
    console.error('Error fetching trips:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, currency = '₹', creatorId, memberUserIds = [] } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Trip name is required' }, { status: 400 });
    }
    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    const savedTrip = await supabaseDb.createTrip({
      name: name.trim(),
      description: description?.trim() || '',
      currency,
      creatorId,
      memberUserIds,
    });

    if (!savedTrip) {
      return NextResponse.json({ error: 'Failed to create trip in database' }, { status: 500 });
    }

    return NextResponse.json({ trip: savedTrip }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating trip:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
