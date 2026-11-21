'use client';

import React, { useState } from 'react';
import { Trip, Expense, Member, Concern } from '@/types';
import {
  Banknote,
  Smartphone,
  AlertCircle,
  Trash2,
  Users,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface TimelineTabProps {
  trip: Trip;
  expenses: Expense[];
  concerns: Concern[];
  activeMember: Member | null;
  onOpenAddExpense: () => void;
  onOpenRaiseConcern: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onResolveConcern: (concernId: string) => Promise<void>;
}

export default function TimelineTab({
  trip,
  expenses,
  concerns,
  activeMember,
  onOpenAddExpense,
  onOpenRaiseConcern,
  onDeleteExpense,
  onResolveConcern,
}: TimelineTabProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const memberMap = new Map<string, Member>();
  trip.members.forEach((m) => memberMap.set(m.id, m));

  const categories = ['All', ...Array.from(new Set(expenses.map((e) => e.category || 'General')))];

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter((e) => (e.category || 'General') === filterCategory);

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    setDeletingId(expenseId);
    try {
      await onDeleteExpense(expenseId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Category Pills Filter */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No expenses recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Be the first to log a spend! Everyone in {trip.name} will see their balance update in real time.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            + Add First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredExpenses.map((expense) => {
            const payer = memberMap.get(expense.paidBy);
            const isPayerMe = activeMember?.id === expense.paidBy;
            const canDelete =
              activeMember?.id === expense.createdBy || activeMember?.id === trip.createdBy;

            const expenseConcerns = concerns.filter((c) => c.expenseId === expense.id);
            const unresolvedConcerns = expenseConcerns.filter((c) => !c.resolved);

            const perPerson =
              expense.splitBetween.length > 0
                ? Math.round((expense.amount / expense.splitBetween.length) * 100) / 100
                : 0;

            const isMeInSplit = activeMember ? expense.splitBetween.includes(activeMember.id) : false;

            return (
              <div
                key={expense.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  {/* Top Bar: Title, Amount, Mode */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {expense.category || 'General'}
                        </span>

                        {expense.paymentMode === 'cash' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                            <Banknote className="w-3 h-3" /> Cash
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <Smartphone className="w-3 h-3" /> Online / UPI
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {expense.date}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug">
                        {expense.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {trip.currency}{expense.amount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {trip.currency}{perPerson}/person
                      </div>
                    </div>
                  </div>

                  {/* Remarks if any */}
                  {expense.remarks && (
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2 mb-3 border border-slate-100 italic">
                      &quot;{expense.remarks}&quot;
                    </p>
                  )}

                  {/* Who paid & Split with */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    {/* Paid by info */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: payer?.color || '#3b82f6' }}
                      >
                        {payer?.name ? payer.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-slate-600">
                        Paid by <strong className="text-slate-900">{isPayerMe ? 'You' : payer?.name || 'Unknown'}</strong>
                      </span>
                    </div>

                    {/* Split list avatars */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1 mr-1">
                        <Users className="w-3 h-3" /> Split with ({expense.splitBetween.length}):
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {expense.splitBetween.map((mId) => {
                          const m = memberMap.get(mId);
                          return (
                            <div
                              key={mId}
                              title={m?.name || 'Member'}
                              className="w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[9px] font-bold"
                              style={{ backgroundColor: m?.color || '#64748b' }}
                            >
                              {m?.name ? m.name.charAt(0).toUpperCase() : '?'}
                            </div>
                          );
                        })}
                      </div>
                      {isMeInSplit && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded ml-1">
                          Your share: {trip.currency}{perPerson}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unresolved Concern Warning Banner */}
                  {unresolvedConcerns.length > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-2">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        Concern raised on this entry:
                      </div>
                      {unresolvedConcerns.map((c) => (
                        <div key={c.id} className="pl-5 flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-amber-950">{c.raisedByName}:</span> {c.message}
                          </div>
                          <button
                            onClick={() => onResolveConcern(c.id)}
                            className="shrink-0 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mark Resolved
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons footer */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100/70">
                    <button
                      onClick={() => onOpenRaiseConcern(expense)}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg font-medium transition"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{expenseConcerns.length > 0 ? `${expenseConcerns.length} Concern(s)` : 'Raise Concern'}</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
