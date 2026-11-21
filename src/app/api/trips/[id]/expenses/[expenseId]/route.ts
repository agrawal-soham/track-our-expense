import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseStore';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { expenseId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';

    const success = await supabaseDb.deleteExpense(expenseId, userId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('Error deleting expense:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
