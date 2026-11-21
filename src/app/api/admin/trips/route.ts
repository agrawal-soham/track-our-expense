import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Fetch all trips with creator info
    const { data: trips, error: tripsErr } = await supabase
      .from('trips')
      .select('*, profiles:created_by(id, username, full_name, email)')
      .order('created_at', { ascending: false });

    if (tripsErr) {
      return NextResponse.json({ error: tripsErr.message }, { status: 500 });
    }

    // For each trip, get member count and total spend
    const result = [];
    for (const t of trips || []) {
      const { count: memberCount } = await supabase
        .from('trip_members')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', t.id);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('trip_id', t.id);

      const totalSpend = (expenses || []).reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0);

      result.push({
        id: t.id,
        code: t.code,
        name: t.name,
        description: t.description,
        currency: t.currency || '₹',
        status: t.status || 'active',
        createdAt: t.created_at,
        creator: t.profiles,
        memberCount: memberCount || 0,
        totalSpend: Math.round(totalSpend * 100) / 100,
      });
    }

    return NextResponse.json({ trips: result });
  } catch (err: any) {
    console.error('Error fetching admin trips:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
