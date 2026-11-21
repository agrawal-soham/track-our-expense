'use client';

import React, { useState } from 'react';
import { Trip, Member } from '@/types';
import { X, Banknote, Smartphone, Check, Sparkles } from 'lucide-react';

interface AddExpenseModalProps {
  trip: Trip;
  activeMember: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (data: {
    title: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
    paymentMode: 'cash' | 'online';
    remarks?: string;
    category: string;
    date: string;
    createdBy: string;
  }) => Promise<void>;
}

const CATEGORIES = ['Food & Dining', 'Stay / Hotel', 'Travel & Fuel', 'Tickets & Sightseeing', 'Drinks & Party', 'Shopping', 'General'];

export default function AddExpenseModal({
  trip,
  activeMember,
  isOpen,
  onClose,
  onAddExpense,
}: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paidBy, setPaidBy] = useState(activeMember?.id || trip.members[0]?.id || '');
  const [splitBetween, setSplitBetween] = useState<string[]>(trip.members.map((m) => m.id));
  const [paymentMode, setPaymentMode] = useState<'cash' | 'online'>('online');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const splitCount = splitBetween.length;
  const perPerson = splitCount > 0 ? Math.round((numAmount / splitCount) * 100) / 100 : 0;

  const toggleMemberInSplit = (id: string) => {
    if (splitBetween.includes(id)) {
      if (splitBetween.length > 1) {
        setSplitBetween(splitBetween.filter((mId) => mId !== id));
      }
    } else {
      setSplitBetween([...splitBetween, id]);
    }
  };

  const selectAll = () => setSplitBetween(trip.members.map((m) => m.id));
  const clearOthers = () => {
    if (paidBy) setSplitBetween([paidBy]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numAmount <= 0 || !paidBy || splitBetween.length === 0) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddExpense({
        title: title.trim(),
        amount: numAmount,
        paidBy,
        splitBetween,
        paymentMode,
        remarks: remarks.trim(),
        category,
        date,
        createdBy: activeMember?.id || paidBy,
      });
      onClose();
      // Reset form
      setTitle('');
      setAmount('');
      setRemarks('');
      setSplitBetween(trip.members.map((m) => m.id));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add New Expense</h2>
            <p className="text-xs text-slate-500">Trip: {trip.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount (Big & Prominent) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Amount Spent
            </label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-black text-slate-400">{trip.currency}</span>
              <input
                type="number"
                step="0.01"
                min="0.1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-48 text-center text-3xl font-black text-slate-900 bg-transparent focus:outline-none placeholder-slate-300"
              />
            </div>
            {numAmount > 0 && splitCount > 0 && (
              <div className="text-xs font-semibold text-blue-600 mt-2">
                = {trip.currency}{perPerson} / person across {splitCount} people
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / What was this for? *
            </label>
            <input
              type="text"
              placeholder="e.g. Fort Entry Tickets &amp; Guides, Dinner at Thalassa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Who Paid & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Who Paid? *
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {trip.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === activeMember?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('online')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
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
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
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

          {/* Split Between */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Split With Whom? ({splitBetween.length}/{trip.members.length})
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearOthers}
                  className="text-slate-500 hover:underline"
                >
                  Only Payer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
              {trip.members.map((m) => {
                const isSelected = splitBetween.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMemberInSplit(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition text-left ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: m.color || '#3b82f6' }}
                    >
                      {isSelected ? <Check className="w-2.5 h-2.5" /> : m.name.charAt(0)}
                    </div>
                    <span className="truncate">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Remarks / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in cash at counter, 10% discount applied"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              {submitting ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
