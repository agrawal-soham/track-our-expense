import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const trip = db.getTripById(id) || db.getTripByCode(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const expenses = db.getExpenses(trip.id);
    const target = expenses.find((e) => e.id === expenseId);
    if (!target) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Only the creator of the expense or the trip creator can delete it
    if (userId && target.createdBy !== userId && trip.createdBy !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this expense. You can raise a concern instead.' },
        { status: 403 }
      );
    }

    const success = db.deleteExpense(trip.id, expenseId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    console.error('Error deleting expense:', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
