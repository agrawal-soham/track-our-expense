import { supabase } from '@/lib/supabaseClient';
import { Trip, Member, Expense, Concern, Settlement, TripAnalytics } from '@/types';
import { calculateAnalytics } from '@/lib/calculations';

const COLORS = ['#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

export const supabaseDb = {
  // Get all trips for a specific user
  async getTripsForUser(userId: string): Promise<Trip[]> {
    // Find all trip_ids the user is a member of
    const { data: memberRows, error: memberErr } = await supabase
      .from('trip_members')
      .select('trip_id')
      .eq('user_id', userId);

    if (memberErr || !memberRows || memberRows.length === 0) {
      return [];
    }

    const tripIds = memberRows.map((r) => r.trip_id);

    // Fetch trip details
    const { data: trips, error: tripsErr } = await supabase
      .from('trips')
      .select('*')
      .in('id', tripIds)
      .order('created_at', { ascending: false });

    if (tripsErr || !trips) {
      return [];
    }

    // For each trip, load its members
    const result: Trip[] = [];
    for (const t of trips) {
      const members = await this.getTripMembers(t.id);
      result.push({
        id: t.id,
        code: t.code,
        name: t.name,
        description: t.description,
        currency: t.currency || '₹',
        createdBy: t.created_by,
        createdAt: t.created_at,
        members,
      });
    }

    return result;
  },

  // Get trip by Code
  async getTripByCode(code: string): Promise<Trip | null> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .ilike('code', code.trim())
      .single();

    if (error || !data) return null;

    const members = await this.getTripMembers(data.id);
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      currency: data.currency || '₹',
      createdBy: data.created_by,
      createdAt: data.created_at,
      members,
    };
  },

  // Get members of a trip
  async getTripMembers(tripId: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('trip_members')
      .select('user_id, joined_at, profiles(id, username, full_name, email, avatar_url)')
      .eq('trip_id', tripId)
      .order('joined_at', { ascending: true });

    if (error || !data) return [];

    return data.map((row: any, idx: number) => {
      const p = row.profiles;
      return {
        id: row.user_id,
        username: p?.username || 'user',
        name: p?.full_name || p?.username || 'Member',
        email: p?.email || '',
        avatar: p?.avatar_url,
        color: COLORS[idx % COLORS.length],
        joinedAt: row.joined_at,
      };
    });
  },

  // Get full trip details (members, expenses, concerns, settlements, analytics)
  async getTripWithDetails(tripId: string) {
    const { data: tripRow, error: tripErr } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripErr || !tripRow) return null;

    const members = await this.getTripMembers(tripId);

    // Load expenses
    const { data: expRows } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: false });

    const expenses: Expense[] = (expRows || []).map((e: any) => ({
      id: e.id,
      tripId: e.trip_id,
      title: e.title,
      amount: parseFloat(e.amount),
      paidBy: e.paid_by,
      splitBetween: e.split_between || [],
      paymentMode: e.payment_mode || 'online',
      remarks: e.remarks || '',
      category: e.category || 'General',
      date: e.date,
      createdAt: e.created_at,
      createdBy: e.created_by,
    }));

    // Load settlements
    const { data: setRows } = await supabase
      .from('settlements')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    const settlements: Settlement[] = (setRows || []).map((s: any) => ({
      id: s.id,
      tripId: s.trip_id,
      fromUser: s.from_user,
      toUser: s.to_user,
      amount: parseFloat(s.amount),
      paymentMode: s.payment_mode || 'online',
      notes: s.notes || '',
      status: s.status,
      createdAt: s.created_at,
      resolvedAt: s.resolved_at,
      resolvedBy: s.resolved_by,
    }));

    // Load concerns
    const { data: conRows } = await supabase
      .from('concerns')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    const concerns: Concern[] = (conRows || []).map((c: any) => ({
      id: c.id,
      expenseId: c.expense_id,
      tripId: c.trip_id,
      raisedBy: c.raised_by,
      raisedByName: c.raised_by_name,
      message: c.message,
      resolved: c.resolved,
      createdAt: c.created_at,
    }));

    const trip: Trip = {
      id: tripRow.id,
      code: tripRow.code,
      name: tripRow.name,
      description: tripRow.description,
      currency: tripRow.currency || '₹',
      createdBy: tripRow.created_by,
      createdAt: tripRow.created_at,
      members,
    };

    const analytics = calculateAnalytics(members, expenses, settlements);

    return {
      trip,
      expenses,
      settlements,
      concerns,
      analytics,
    };
  },

  // Create Trip
  async createTrip(data: {
    name: string;
    description?: string;
    currency: string;
    creatorId: string;
    memberUserIds: string[];
  }): Promise<Trip | null> {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: tripRow, error: tripErr } = await supabase
      .from('trips')
      .insert({
        code: randomCode,
        name: data.name.trim(),
        description: data.description?.trim() || '',
        currency: data.currency || '₹',
        created_by: data.creatorId,
      })
      .select()
      .single();

    if (tripErr || !tripRow) {
      console.error('Error inserting trip:', tripErr);
      return null;
    }

    // Insert members
    const allUserIds = Array.from(new Set([data.creatorId, ...data.memberUserIds]));
    const memberInserts = allUserIds.map((uId) => ({
      trip_id: tripRow.id,
      user_id: uId,
    }));

    await supabase.from('trip_members').insert(memberInserts);

    const members = await this.getTripMembers(tripRow.id);

    return {
      id: tripRow.id,
      code: tripRow.code,
      name: tripRow.name,
      description: tripRow.description,
      currency: tripRow.currency,
      createdBy: tripRow.created_by,
      createdAt: tripRow.created_at,
      members,
    };
  },

  // Add Member
  async addMember(tripId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('trip_members').insert({
      trip_id: tripId,
      user_id: userId,
    });
    return !error;
  },

  // Add Expense
  async addExpense(expenseData: {
    tripId: string;
    title: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
    paymentMode: 'cash' | 'online';
    remarks?: string;
    category: string;
    date: string;
    createdBy: string;
  }) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: expenseData.tripId,
        title: expenseData.title,
        amount: expenseData.amount,
        paid_by: expenseData.paidBy,
        split_between: expenseData.splitBetween,
        payment_mode: expenseData.paymentMode,
        remarks: expenseData.remarks || '',
        category: expenseData.category || 'General',
        date: expenseData.date,
        created_by: expenseData.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete Expense
  async deleteExpense(expenseId: string, userId: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return true;
  },

  // Add Concern
  async addConcern(data: {
    expenseId: string;
    tripId: string;
    raisedBy: string;
    raisedByName: string;
    message: string;
  }) {
    const { data: con, error } = await supabase
      .from('concerns')
      .insert({
        expense_id: data.expenseId,
        trip_id: data.tripId,
        raised_by: data.raisedBy,
        raised_by_name: data.raisedByName,
        message: data.message,
      })
      .select()
      .single();

    if (error) throw error;
    return con;
  },

  // Resolve Concern
  async resolveConcern(concernId: string) {
    const { error } = await supabase
      .from('concerns')
      .update({ resolved: true })
      .eq('id', concernId);

    if (error) throw error;
    return true;
  },

  // Record Settlement
  async recordSettlement(data: {
    tripId: string;
    fromUser: string;
    toUser: string;
    amount: number;
    paymentMode: 'cash' | 'online';
    notes?: string;
  }) {
    const { data: set, error } = await supabase
      .from('settlements')
      .insert({
        trip_id: data.tripId,
        from_user: data.fromUser,
        to_user: data.toUser,
        amount: data.amount,
        payment_mode: data.paymentMode,
        notes: data.notes || '',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return set;
  },

  // Update Settlement Status
  async updateSettlementStatus(settlementId: string, status: 'approved' | 'rejected', resolvedBy: string) {
    const { data, error } = await supabase
      .from('settlements')
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
      })
      .eq('id', settlementId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
