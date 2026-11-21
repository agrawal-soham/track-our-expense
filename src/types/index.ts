export type PaymentMode = 'cash' | 'online';

export interface UserProfile {
  id: string; // auth.users UUID
  username: string; // unique handle e.g. @soham
  full_name: string;
  email: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at: string;
}

export interface Member {
  id: string; // user profile UUID
  username?: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  joinedAt: string;
}

export interface Trip {
  id: string;
  code: string; // 6-character short code
  name: string;
  description?: string;
  currency: string;
  status?: 'active' | 'paused';
  createdBy: string; // user profile UUID
  createdAt: string;
  members: Member[];
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  paidBy: string; // user profile UUID
  splitBetween: string[]; // user profile UUIDs
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
  raisedBy: string; // user profile UUID
  raisedByName: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export type SettlementStatus = 'pending' | 'approved' | 'rejected';

export interface Settlement {
  id: string;
  tripId: string;
  fromUser: string; // user profile UUID
  toUser: string; // user profile UUID
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
  username: string;
  memberColor: string;
  totalPaid: number;
  totalShare: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netBalance: number;
}

export interface SimplifiedDebt {
  fromMemberId: string;
  fromMemberName: string;
  fromUsername: string;
  toMemberId: string;
  toMemberName: string;
  toUsername: string;
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
