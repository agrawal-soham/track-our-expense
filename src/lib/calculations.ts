import { Expense, Member, Settlement, MemberBalance, SimplifiedDebt, TripAnalytics } from '@/types';

/**
 * Rounds a number to 2 decimal places to avoid floating point anomalies
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates net balance and full breakdown for all members in a trip
 */
export function calculateBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): { memberBalances: MemberBalance[]; debts: SimplifiedDebt[]; totalSpend: number } {
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const totalPaidMap = new Map<string, number>();
  const totalShareMap = new Map<string, number>();
  const settlementsPaidMap = new Map<string, number>();
  const settlementsReceivedMap = new Map<string, number>();

  // Initialize maps for all members
  members.forEach((m) => {
    totalPaidMap.set(m.id, 0);
    totalShareMap.set(m.id, 0);
    settlementsPaidMap.set(m.id, 0);
    settlementsReceivedMap.set(m.id, 0);
  });

  let totalSpend = 0;

  // Process all expenses
  expenses.forEach((exp) => {
    totalSpend += exp.amount;
    const currentPaid = totalPaidMap.get(exp.paidBy) || 0;
    totalPaidMap.set(exp.paidBy, currentPaid + exp.amount);

    const splitCount = exp.splitBetween.length;
    if (splitCount > 0) {
      const perPersonShare = exp.amount / splitCount;
      exp.splitBetween.forEach((memberId) => {
        const currentShare = totalShareMap.get(memberId) || 0;
        totalShareMap.set(memberId, currentShare + perPersonShare);
      });
    }
  });

  // Process settlements (only APPROVED settlements alter balances)
  settlements
    .filter((s) => s.status === 'approved')
    .forEach((s) => {
      const paid = settlementsPaidMap.get(s.fromUser) || 0;
      settlementsPaidMap.set(s.fromUser, paid + s.amount);

      const received = settlementsReceivedMap.get(s.toUser) || 0;
      settlementsReceivedMap.set(s.toUser, received + s.amount);
    });

  // Calculate net balances for each member
  const memberBalances: MemberBalance[] = members.map((m) => {
    const paid = round2(totalPaidMap.get(m.id) || 0);
    const share = round2(totalShareMap.get(m.id) || 0);
    const sPaid = round2(settlementsPaidMap.get(m.id) || 0);
    const sReceived = round2(settlementsReceivedMap.get(m.id) || 0);

    // netBalance = (Expenses Paid - Expense Share) + (Settlement Paid - Settlement Received)
    const netBalance = round2((paid - share) + (sPaid - sReceived));

    return {
      memberId: m.id,
      memberName: m.name,
      memberColor: m.color || '#3b82f6',
      totalPaid: paid,
      totalShare: share,
      settlementsPaid: sPaid,
      settlementsReceived: sReceived,
      netBalance,
    };
  });

  // Debt Simplification Algorithm (Greedy matching)
  const debts = simplifyDebts(memberBalances, memberMap);

  return {
    memberBalances,
    debts,
    totalSpend: round2(totalSpend),
  };
}

/**
 * Simplifies multi-party balances into minimal direct payments
 */
function simplifyDebts(
  balances: MemberBalance[],
  memberMap: Map<string, Member>
): SimplifiedDebt[] {
  // Separate into debtors (net < -0.01) and creditors (net > 0.01)
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.netBalance < -0.01) {
      debtors.push({ id: b.memberId, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ id: b.memberId, amount: b.netBalance });
    }
  });

  const result: SimplifiedDebt[] = [];

  // Greedy match largest debtor with largest creditor
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = round2(Math.min(debtor.amount, creditor.amount));

    if (transferAmount > 0.01) {
      result.push({
        fromMemberId: debtor.id,
        fromMemberName: memberMap.get(debtor.id)?.name || 'Unknown',
        toMemberId: creditor.id,
        toMemberName: memberMap.get(creditor.id)?.name || 'Unknown',
        amount: transferAmount,
      });
    }

    debtor.amount = round2(debtor.amount - transferAmount);
    creditor.amount = round2(creditor.amount - transferAmount);

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return result;
}

/**
 * Calculates comprehensive analytics for the trip
 */
export function calculateAnalytics(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[]
): TripAnalytics {
  const { memberBalances, debts, totalSpend } = calculateBalances(
    members,
    expenses,
    settlements
  );

  // Category breakdown
  const categoryMap = new Map<string, number>();
  let cashTotal = 0;
  let onlineTotal = 0;
  const dailyMap = new Map<string, number>();

  expenses.forEach((exp) => {
    const cat = exp.category || 'General';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp.amount);

    if (exp.paymentMode === 'cash') {
      cashTotal += exp.amount;
    } else {
      onlineTotal += exp.amount;
    }

    const dateKey = exp.date ? exp.date.substring(0, 10) : 'Other';
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + exp.amount);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount: round2(amount),
      percentage: totalSpend > 0 ? round2((amount / totalSpend) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const dailySpending = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({
      date,
      amount: round2(amount),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSpend,
    memberBalances,
    debts,
    categoryBreakdown,
    paymentModeBreakdown: {
      cash: round2(cashTotal),
      online: round2(onlineTotal),
    },
    dailySpending,
  };
}
