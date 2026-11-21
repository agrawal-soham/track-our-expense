export type PaymentMode = 'cash' | 'online';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  pin?: string;
  joinedAt: string;
}

export interface Trip {
  id: string;
  code: string; // 6-character short code for easy joining (e.g. "GOA24")
  name: string;
  description?: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  members: Member[];
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  paidBy: string; // member id
  splitBetween: string[]; // member ids
  paymentMode: PaymentMode;
  remarks?: string;
  category: string;
  date: string;
  createdAt: string;
  createdBy: string;
}

export interface Concern {
  id: string;
  expenseId: string;
  tripId: string;
  raisedBy: string; // member id
  raisedByName: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export type SettlementStatus = 'pending' | 'approved' | 'rejected';

export interface Settlement {
  id: string;
  tripId: string;
  fromUser: string; // member id who paid
  toUser: string; // member id who received
  amount: number;
  paymentMode: PaymentMode;
  notes?: string;
  status: SettlementStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  memberColor: string;
  totalPaid: number;
  totalShare: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netBalance: number; // positive = owed to them, negative = they owe
}

export interface SimplifiedDebt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

export interface TripAnalytics {
  totalSpend: number;
  memberBalances: MemberBalance[];
  debts: SimplifiedDebt[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  paymentModeBreakdown: {
    cash: number;
    online: number;
  };
  dailySpending: {
    date: string;
    amount: number;
  }[];
}
