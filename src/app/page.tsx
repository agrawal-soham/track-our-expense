'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trip, Expense, Member, Concern, Settlement, TripAnalytics } from '@/types';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import Navbar from '@/components/Navbar';
import TimelineTab from '@/components/TimelineTab';
import BalancesTab from '@/components/BalancesTab';
import SettlementsTab from '@/components/SettlementsTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import AddExpenseModal from '@/components/AddExpenseModal';
import RaiseConcernModal from '@/components/RaiseConcernModal';
import CreateTripModal from '@/components/CreateTripModal';
import AddMemberModal from '@/components/AddMemberModal';
import AdminModal from '@/components/AdminModal';
import {
  Receipt,
  Scale,
  HandCoins,
  BarChart3,
  Plus,
  Loader2,
  Compass,
  AlertTriangle,
} from 'lucide-react';

function MainApp() {
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [tripsList, setTripsList] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [analytics, setAnalytics] = useState<TripAnalytics | null>(null);

  const [activeTab, setActiveTab] = useState<'timeline' | 'balances' | 'settlements' | 'analytics'>('timeline');
  const [loadingTrip, setLoadingTrip] = useState(false);

  // Modals state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showRaiseConcern, setShowRaiseConcern] = useState(false);
  const [selectedExpenseForConcern, setSelectedExpenseForConcern] = useState<Expense | null>(null);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Fetch all trips for currently authenticated user
  const fetchMyTrips = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/trips?userId=${userId}`);
      const data = await res.json();
      if (data.trips) {
        setTripsList(data.trips);
        return data.trips;
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
    return [];
  }, []);

  // Fetch full details for a trip
  const fetchTripDetails = useCallback(async (tripId: string) => {
    try {
      setLoadingTrip(true);
      const res = await fetch(`/api/trips/${tripId}`);
      if (!res.ok) throw new Error('Failed to fetch trip');
      const data = await res.json();

      setActiveTrip(data.trip);
      setExpenses(data.expenses || []);
      setSettlements(data.settlements || []);
      setConcerns(data.concerns || []);
      setAnalytics(data.analytics || null);
    } catch (err) {
      console.error('Error loading trip details:', err);
    } finally {
      setLoadingTrip(false);
    }
  }, []);

  // Initial load when user logs in
  useEffect(() => {
    if (!profile) return;

    async function init() {
      const trips = await fetchMyTrips(profile!.id);

      // Check URL query parameters for ?join=CODE
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('join');

      if (joinCode) {
        try {
          const res = await fetch(`/api/trips?code=${joinCode}`);
          const data = await res.json();
          if (data.trip) {
            // Join this trip in Supabase
            await fetch(`/api/trips/${data.trip.id}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: profile!.id }),
            });
            await fetchMyTrips(profile!.id);
            await fetchTripDetails(data.trip.id);
            return;
          }
        } catch (e) {
          console.error('Failed to auto-join trip:', e);
        }
      }

      if (trips.length > 0) {
        await fetchTripDetails(trips[0].id);
      }
    }

    init();
  }, [profile, fetchMyTrips, fetchTripDetails]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-slate-300 font-medium">Connecting to Supabase Cloud...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

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
  }) => {
    if (!activeTrip) return;
    if (activeTrip.status === 'paused') {
      alert('This trip is currently paused by admin. New expenses cannot be added.');
      return;
    }
    const res = await fetch(`/api/trips/${activeTrip.id}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...expenseData,
        createdBy: profile.id,
      }),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    await fetchTripDetails(activeTrip.id);
  };

  // Delete Expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeTrip) return;
    const res = await fetch(
      `/api/trips/${activeTrip.id}/expenses/${expenseId}?userId=${profile.id}`,
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
        raisedBy: profile.id,
        raisedByName: profile.full_name,
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
        resolvedBy: profile.id,
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
    memberUserIds: string[];
  }) => {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        creatorId: profile.id,
      }),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    const result = await res.json();

    await fetchMyTrips(profile.id);
    await fetchTripDetails(result.trip.id);
  };

  // Add registered member
  const handleAddMember = async (userId: string) => {
    if (!activeTrip) return;
    const res = await fetch(`/api/trips/${activeTrip.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
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
    (s) => s.status === 'pending' && s.toUser === profile.id
  ).length;

  const isTripPaused = activeTrip?.status === 'paused';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        trip={activeTrip}
        currentUser={profile}
        onOpenCreateTrip={() => setShowCreateTrip(true)}
        onOpenAddMember={() => setShowAddMember(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        tripsList={tripsList}
        onSelectTrip={(id) => fetchTripDetails(id)}
        onSignOut={signOut}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-24">
        {loadingTrip ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Syncing with Supabase Cloud...</p>
          </div>
        ) : !activeTrip ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Welcome, {profile.full_name}!</h2>
              <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">Your User ID: @{profile.username}</p>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                You haven&apos;t joined or created any trips yet. Create your first group trip or have friends add your User ID!
              </p>
            </div>
            <button
              onClick={() => setShowCreateTrip(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              + Create Your First Trip
            </button>
          </div>
        ) : (
          <>
            {/* Trip Paused Alert Banner */}
            {isTripPaused && (
              <div className="mb-4 bg-amber-500/10 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-sm">This Trip is Paused by Platform Admin</div>
                  <div className="text-xs text-amber-800">
                    Existing expenses, balances, and calculations are frozen. No new expenses can be added until resumed.
                  </div>
                </div>
              </div>
            )}

            {/* View Tab Buttons Bar */}
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
                currentUser={profile}
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
                currentUser={profile}
                onQuickSettle={handleQuickSettle}
              />
            )}

            {activeTab === 'settlements' && (
              <SettlementsTab
                trip={activeTrip}
                settlements={settlements}
                currentUser={profile}
                onRecordSettlement={handleRecordSettlement}
                onUpdateStatus={handleUpdateSettlementStatus}
              />
            )}

            {activeTab === 'analytics' && analytics && (
              <AnalyticsTab
                trip={activeTrip}
                analytics={analytics}
                currentUser={profile}
                expenses={expenses}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (Add Expense) */}
      {activeTrip && !isTripPaused && (
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
            currentUser={profile}
            isOpen={showAddExpense}
            onClose={() => setShowAddExpense(false)}
            onAddExpense={handleAddExpense}
          />

          <RaiseConcernModal
            trip={activeTrip}
            expense={selectedExpenseForConcern}
            currentUser={profile}
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
        </>
      )}

      <CreateTripModal
        isOpen={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
        currentUser={profile}
        onCreateTrip={handleCreateTrip}
      />

      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onTripUpdated={() => {
          if (profile) {
            fetchMyTrips(profile.id);
            if (activeTrip) fetchTripDetails(activeTrip.id);
          }
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
