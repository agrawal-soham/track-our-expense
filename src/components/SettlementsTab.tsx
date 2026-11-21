'use client';

import React, { useState } from 'react';
import { Trip, Member, Settlement, UserProfile } from '@/types';
import {
  HandCoins,
  Check,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Smartphone,
  Plus,
} from 'lucide-react';

interface SettlementsTabProps {
  trip: Trip;
  settlements: Settlement[];
  currentUser: UserProfile;
  onRecordSettlement: (data: {
    fromUser: string;
    toUser: string;
    amount: number;
    paymentMode: 'cash' | 'online';
    notes?: string;
  }) => Promise<void>;
  onUpdateStatus: (settlementId: string, status: 'approved' | 'rejected') => Promise<void>;
}

export default function SettlementsTab({
  trip,
  settlements,
  currentUser,
  onRecordSettlement,
  onUpdateStatus,
}: SettlementsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'online'>('online');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const memberMap = new Map<string, Member>();
  trip.members.forEach((m) => memberMap.set(m.id, m));

  const pendingSettlements = settlements.filter((s) => s.status === 'pending');
  const historySettlements = settlements.filter((s) => s.status !== 'pending');

  // Settlements waiting specifically for THIS logged-in user to approve
  const myPendingApprovals = pendingSettlements.filter(
    (s) => s.toUser === currentUser.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!toUser || isNaN(num) || num <= 0) {
      alert('Please select a recipient and enter a valid payment amount.');
      return;
    }
    if (currentUser.id === toUser) {
      alert('You cannot send a settlement to yourself.');
      return;
    }

    setSubmitting(true);
    try {
      await onRecordSettlement({
        fromUser: currentUser.id,
        toUser,
        amount: num,
        paymentMode,
        notes,
      });
      setShowForm(false);
      setAmount('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (settlementId: string, status: 'approved' | 'rejected') => {
    setProcessingId(settlementId);
    try {
      await onUpdateStatus(settlementId, status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Trigger */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Two-Party Verified Settlements
            </div>
            <h2 className="text-xl sm:text-2xl font-black">Direct Settlement Approvals</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-md">
              When someone pays you, they log it here. Once you approve it from your account, everyone&apos;s trip balances update instantly in Supabase!
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="self-start sm:self-center inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition active:scale-95 shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Close Form' : 'Log Settlement Pay'}
          </button>
        </div>
      </div>

      {/* Record Settlement Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border-2 border-blue-500/30 p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-blue-600" /> Record Direct Settlement Payment
            </h3>
            <span className="text-xs text-slate-400">Recipient must approve</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Who Paid (Locked to Current User) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Who Paid? (Sender)
              </label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-bold truncate">
                {currentUser.full_name} <span className="text-blue-600 font-mono text-xs">(@{currentUser.username})</span>
              </div>
            </div>

            {/* Who Received */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Paid To? (Recipient) *
              </label>
              <select
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select recipient...</option>
                {trip.members
                  .filter((m) => m.id !== currentUser.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (@{m.username})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount ({trip.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('online')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    paymentMode === 'online'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Online / UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    paymentMode === 'cash'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" /> Cash
                </button>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Remarks / UPI Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent on GPay / Cash handed during dinner"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              {submitting ? 'Submitting...' : 'Send for Approval'}
            </button>
          </div>
        </form>
      )}

      {/* Urgent: Pending Approvals for Active Member */}
      {myPendingApprovals.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              !
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-base">
                Action Required: {myPendingApprovals.length} Payment(s) Waiting For Your Approval
              </h3>
              <p className="text-xs text-amber-800">
                A friend recorded that they paid you. Only your account can confirm or reject this.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {myPendingApprovals.map((s) => {
              const sender = memberMap.get(s.fromUser);
              const isProcessing = processingId === s.id;

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                      <span>{sender?.name || 'Friend'}</span>
                      <span className="font-mono text-blue-600 text-xs">@{sender?.username}</span>
                      <span>paid you</span>
                      <span className="text-lg font-black text-emerald-600">
                        {trip.currency}{s.amount.toLocaleString()}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {s.paymentMode}
                      </span>
                    </div>
                    {s.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic">&quot;{s.notes}&quot;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleStatusChange(s.id, 'rejected')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(s.id, 'approved')}
                      disabled={isProcessing}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm &amp; Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Other Pending Approvals in Trip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Pending Approval Requests ({pendingSettlements.length})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Payments that have been sent but awaiting confirmation from the recipient
        </p>

        {pendingSettlements.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">No pending settlement requests right now.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingSettlements.map((s) => {
              const sender = memberMap.get(s.fromUser);
              const recipient = memberMap.get(s.toUser);
              const isSenderMe = currentUser.id === s.fromUser;
              const isRecipientMe = currentUser.id === s.toUser;

              return (
                <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{isSenderMe ? <strong className="text-blue-600">You</strong> : sender?.name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">@{sender?.username}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{isRecipientMe ? <strong className="text-blue-600">You</strong> : recipient?.name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">@{recipient?.username}</span>
                      <span className="font-bold text-slate-900 ml-1">
                        {trip.currency}{s.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                        {s.paymentMode}
                      </span>
                    </div>
                    {s.notes && <p className="text-slate-500 text-[11px] mt-0.5">&quot;{s.notes}&quot;</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Waiting for @{recipient?.username}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settlement History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1">Settlement History</h3>
        <p className="text-xs text-slate-500 mb-4">
          All approved and completed direct payments in this trip
        </p>

        {historySettlements.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">No past settled transactions yet.</p>
        ) : (
          <div className="space-y-2.5">
            {historySettlements.map((s) => {
              const sender = memberMap.get(s.fromUser);
              const recipient = memberMap.get(s.toUser);
              const isApproved = s.status === 'approved';

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    isApproved ? 'bg-slate-50/70 border-slate-100' : 'bg-rose-50/50 border-rose-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{sender?.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">@{sender?.username}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{recipient?.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">@{recipient?.username}</span>
                      <span className="font-black text-slate-900 ml-1">
                        {trip.currency}{s.amount.toLocaleString()}
                      </span>
                    </div>
                    {s.notes && <div className="text-[11px] text-slate-500 mt-0.5">&quot;{s.notes}&quot;</div>}
                  </div>

                  <div>
                    {isApproved ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md flex items-center gap-1">
                        <X className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
