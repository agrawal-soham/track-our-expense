'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trip, Expense, Member, Concern, Settlement, TripAnalytics } from '@/types';
import Navbar from '@/components/Navbar';
import TimelineTab from '@/components/TimelineTab';
import BalancesTab from '@/components/BalancesTab';
import SettlementsTab from '@/components/SettlementsTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import AddExpenseModal from '@/components/AddExpenseModal';
import RaiseConcernModal from '@/components/RaiseConcernModal';
import CreateTripModal from '@/components/CreateTripModal';
import AddMemberModal from '@/components/AddMemberModal';
import UserSwitcherModal from '@/components/UserSwitcherModal';
import {
  Receipt,
  Scale,
  HandCoins,
  BarChart3,
  Plus,
  Loader2,
  Users,
} from 'lucide-react';

export default function Home() {
  const [tripsList, setTripsList] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [analytics, setAnalytics] = useState<TripAnalytics | null>(null);
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const [activeTab, setActiveTab] = useState<'timeline' | 'balances' | 'settlements' | 'analytics'>('timeline');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showRaiseConcern, setShowRaiseConcern] = useState(false);
  const [selectedExpenseForConcern, setSelectedExpenseForConcern] = useState<Expense | null>(null);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  // Fetch all trips
  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (data.trips) {
        setTripsList(data.trips);
        return data.trips;
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
    return [];
  };

  // Fetch full details for a trip
  const fetchTripDetails = useCallback(async (tripId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trips/${tripId}`);
      if (!res.ok) throw new Error('Failed to fetch trip');
      const data = await res.json();

      setActiveTrip(data.trip);
      setExpenses(data.expenses || []);
      setSettlements(data.settlements || []);
      setConcerns(data.concerns || []);
      setAnalytics(data.analytics || null);

      // Check stored user profile for this trip in localStorage
      const storedMemberId = localStorage.getItem(`track_user_${data.trip.id}`);
      if (storedMemberId) {
        const found = data.trip.members.find((m: Member) => m.id === storedMemberId);
        if (found) {
          setActiveMember(found);
          return;
        }
      }

      // Default to first member
      if (data.trip.members.length > 0) {
        setActiveMember(data.trip.members[0]);
        localStorage.setItem(`track_user_${data.trip.id}`, data.trip.members[0].id);
      }
    } catch (err) {
      console.error('Error loading trip details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      const trips = await fetchTrips();
      // Check URL query parameters for ?join=CODE or ?trip=ID
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('join');
      const tripIdParam = params.get('trip');

      let targetTrip: Trip | undefined;

      if (joinCode) {
        targetTrip = trips.find((t: Trip) => t.code.toUpperCase() === joinCode.toUpperCase());
        if (!targetTrip) {
          try {
            const res = await fetch(`/api/trips?code=${joinCode}`);
            const data = await res.json();
            if (data.trip) targetTrip = data.trip;
          } catch (e) {
            console.error('Failed to resolve code:', e);
          }
        }
      } else if (tripIdParam) {
        targetTrip = trips.find((t: Trip) => t.id === tripIdParam);
      }

      if (targetTrip) {
        await fetchTripDetails(targetTrip.id);
      } else if (trips.length > 0) {
        await fetchTripDetails(trips[0].id);
      } else {
        setLoading(false);
      }
    }

    init();
  }, [fetchTripDetails]);

  // Handle member selection
  const handleSelectMember = (member: Member) => {
    setActiveMember(member);
    if (activeTrip) {
      localStorage.setItem(`track_user_${activeTrip.id}`, member.id);
    }
  };

  // Add Expense
  const handleAddExpense = async (expenseData: {
    title: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
    paymentMode: 'cash' | 'online';
    remarks?: string;
    category: string;
    date: string;
    createdBy: string;
  }) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    await fetchTripDetails(activeTrip.id);
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeTrip) return;
    const res = await fetch(
      `/api/trips/${activeTrip.id}/expenses/${expenseId}?userId=${activeMember?.id || ''}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
      return;
    }
    await fetchTripDetails(activeTrip.id);
  };

  // Raise Concern
  const handleRaiseConcern = async (expenseId: string, message: string) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/concerns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expenseId,
        raisedBy: activeMember?.id,
        raisedByName: activeMember?.name,
        message,
      }),
    });
    if (!res.ok) throw new Error('Failed to raise concern');
    await fetchTripDetails(activeTrip.id);
  };

  // Resolve Concern
  const handleResolveConcern = async (concernId: string) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/concerns/${concernId}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to resolve concern');
    await fetchTripDetails(activeTrip.id);
  };

  // Record Settlement
  const handleRecordSettlement = async (settlementData: {
    fromUser: string;
    toUser: string;
    amount: number;
    paymentMode: 'cash' | 'online';
    notes?: string;
  }) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settlementData),
    });
    if (!res.ok) throw new Error('Failed to record settlement');
    await fetchTripDetails(activeTrip.id);
  };

  // Approve / Reject Settlement
  const handleUpdateSettlementStatus = async (
    settlementId: string,
    status: 'approved' | 'rejected'
  ) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/settlements/${settlementId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        resolvedBy: activeMember?.id,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to update settlement');
      return;
    }
    await fetchTripDetails(activeTrip.id);
  };

  // Create Trip
  const handleCreateTrip = async (data: {
    name: string;
    description?: string;
    currency: string;
    creatorName: string;
    memberNames: string[];
  }) => {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    const result = await res.json();

    await fetchTrips();
    await fetchTripDetails(result.trip.id);
    if (result.creatorMember) {
      handleSelectMember(result.creatorMember);
    }
  };

  // Add member manually
  const handleAddMember = async (name: string) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to add member');
    await fetchTripDetails(activeTrip.id);
  };

  // Quick Settle from Balances tab
  const handleQuickSettle = (fromId: string, toId: string, amount: number) => {
    setActiveTab('settlements');
  };

  // Pending settlement approvals count for badge
  const pendingApprovalsForMe = settlements.filter(
    (s) => s.status === 'pending' && s.toUser === activeMember?.id
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        trip={activeTrip}
        activeMember={activeMember}
        onOpenCreateTrip={() => setShowCreateTrip(true)}
        onOpenUserSwitcher={() => setShowUserSwitcher(true)}
        onOpenAddMember={() => setShowAddMember(true)}
        tripsList={tripsList}
        onSelectTrip={(id) => fetchTripDetails(id)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm">Calculating group math &amp; loading trip...</p>
          </div>
        ) : !activeTrip ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No active trip selected</h2>
            <p className="text-sm text-slate-500 mb-6">
              Create your trip or join an existing one using an invite code.
            </p>
            <button
              onClick={() => setShowCreateTrip(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition"
            >
              + Create a Trip
            </button>
          </div>
        ) : (
          <>
            {/* View Tab Buttons Bar (Desktop & Tablet) */}
            <div className="bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs mb-5 grid grid-cols-4 gap-1">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'timeline'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('balances')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'balances'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <Scale className="w-4 h-4 shrink-0" />
                <span>Balances</span>
              </button>

              <button
                onClick={() => setActiveTab('settlements')}
                className={`relative py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'settlements'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <HandCoins className="w-4 h-4 shrink-0" />
                <span>Settlements</span>
                {pendingApprovalsForMe > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute top-2 right-2 sm:right-4" />
                )}
                {pendingApprovalsForMe > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute top-2 right-2 sm:right-4" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'analytics'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Analytics</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'timeline' && (
              <TimelineTab
                trip={activeTrip}
                expenses={expenses}
                concerns={concerns}
                activeMember={activeMember}
                onOpenAddExpense={() => setShowAddExpense(true)}
                onOpenRaiseConcern={(exp) => {
                  setSelectedExpenseForConcern(exp);
                  setShowRaiseConcern(true);
                }}
                onDeleteExpense={handleDeleteExpense}
                onResolveConcern={handleResolveConcern}
              />
            )}

            {activeTab === 'balances' && analytics && (
              <BalancesTab
                trip={activeTrip}
                memberBalances={analytics.memberBalances}
                debts={analytics.debts}
                activeMember={activeMember}
                onQuickSettle={handleQuickSettle}
              />
            )}

            {activeTab === 'settlements' && (
              <SettlementsTab
                trip={activeTrip}
                settlements={settlements}
                activeMember={activeMember}
                onRecordSettlement={handleRecordSettlement}
                onUpdateStatus={handleUpdateSettlementStatus}
              />
            )}

            {activeTab === 'analytics' && analytics && (
              <AnalyticsTab trip={activeTrip} analytics={analytics} />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (Add Expense) */}
      {activeTrip && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl shadow-blue-500/30 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm">Add Expense</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {activeTrip && (
        <>
          <AddExpenseModal
            trip={activeTrip}
            activeMember={activeMember}
            isOpen={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            onAddExpense={handleAddExpense}
          />

          <RaiseConcernModal
            trip={activeTrip}
            expense={selectedExpenseForConcern}
            activeMember={activeMember}
            isOpen={showRaiseConcern}
            onClose={() => {
              setShowRaiseConcern(false);
              setSelectedExpenseForConcern(null);
            }}
            onSubmitConcern={handleRaiseConcern}
          />

          <AddMemberModal
            trip={activeTrip}
            isOpen={showAddMember}
            onClose={() => setShowAddMember(false)}
            onAddMember={handleAddMember}
          />

          <UserSwitcherModal
            trip={activeTrip}
            activeMember={activeMember}
            isOpen={showUserSwitcher}
            onClose={() => setShowUserSwitcher(false)}
            onSelectMember={handleSelectMember}
            onJoinAsNewMember={handleAddMember}
          />
        </>
      )}

      <CreateTripModal
        isOpen={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
        onCreateTrip={handleCreateTrip}
      />
    </div>
  );
}
