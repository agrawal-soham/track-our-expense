'use client';

import React, { useState } from 'react';
import { Expense, Trip, UserProfile } from '@/types';
import { AlertCircle, X } from 'lucide-react';

interface RaiseConcernModalProps {
  trip: Trip;
  expense: Expense | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitConcern: (expenseId: string, message: string) => Promise<void>;
}

export default function RaiseConcernModal({
  trip,
  expense,
  currentUser,
  isOpen,
  onClose,
  onSubmitConcern,
}: RaiseConcernModalProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitConcern(expense.id, message.trim());
      setMessage('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">Raise Concern on Entry</h2>
              <p className="text-xs text-amber-800">Flag an issue to the group</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense Info Summary */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="font-bold text-slate-900 text-sm">{expense.title}</div>
            <div className="text-slate-500 mt-0.5">
              Amount: <strong className="text-slate-800">{trip.currency}{expense.amount.toLocaleString()}</strong> • Date: {expense.date}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                What seems incorrect or needs clarification? *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. I didn't take this ride, please exclude me from split, or total bill was ₹400."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Posting as: <strong className="text-slate-700">{currentUser.full_name}</strong> <span className="font-mono text-blue-600">(@{currentUser.username})</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-amber-600/20 active:scale-95 transition"
              >
                {submitting ? 'Submitting...' : 'Post Concern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
