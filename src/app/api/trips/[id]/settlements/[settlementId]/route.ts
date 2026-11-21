import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; settlementId: string }> }
) {
  try {
    const { settlementId } = await params;
    const body = await req.json();
    const { status, resolvedBy } = body;

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
    }

    const updated = await supabaseDb.updateSettlementStatus(settlementId, status, resolvedBy);
    return NextResponse.json({ settlement: updated });
  } catch (err: any) {
    console.error('Error updating settlement:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
