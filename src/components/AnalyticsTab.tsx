'use client';

import React, { useState, useEffect } from 'react';
import { Trip, TripAnalytics, UserProfile, Expense } from '@/types';
import {
  PieChart,
  Wallet,
  CreditCard,
  Banknote,
  Calendar,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check,
  Users,
} from 'lucide-react';

interface AnalyticsTabProps {
  trip: Trip;
  analytics: TripAnalytics;
  currentUser?: UserProfile;
  expenses?: Expense[];
}

export default function AnalyticsTab({
  trip,
  analytics,
  currentUser,
  expenses = [],
}: AnalyticsTabProps) {
  const memberCount = trip.members.length || 1;
  const avgPerPerson = Math.round(analytics.totalSpend / memberCount);

  // Find logged-in user's balance
  const myBalance = analytics.memberBalances.find(
    (b) => b.memberId === currentUser?.id
  );

  // Personal Budget Goal (saved in localStorage per trip)
  const budgetStorageKey = `personal_budget_${trip.id}_${currentUser?.id || 'default'}`;
  const [personalBudget, setPersonalBudget] = useState<number>(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(budgetStorageKey);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val > 0) {
        setPersonalBudget(val);
        setBudgetInput(saved);
      }
    }
  }, [budgetStorageKey]);

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setPersonalBudget(val);
      localStorage.setItem(budgetStorageKey, val.toString());
    } else {
      setPersonalBudget(0);
      localStorage.removeItem(budgetStorageKey);
    }
    setIsEditingBudget(false);
  };

  // Calculate personal category consumption
  const myCategoryMap = new Map<string, number>();
  if (currentUser) {
    expenses.forEach((exp) => {
      if (exp.splitBetween.includes(currentUser.id)) {
        const share = exp.amount / exp.splitBetween.length;
        const cat = exp.category || 'General';
        myCategoryMap.set(cat, (myCategoryMap.get(cat) || 0) + share);
      }
    });
  }
  const myCategoryBreakdown = Array.from(myCategoryMap.entries())
    .map(([cat, amt]) => ({
      category: cat,
      amount: Math.round(amt * 100) / 100,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Find top spender
  const sortedByPaid = [...analytics.memberBalances].sort((a, b) => b.totalPaid - a.totalPaid);
  const topSpender = sortedByPaid[0];

  const myCost = myBalance ? myBalance.totalShare : 0;
  const budgetPercent = personalBudget > 0 ? Math.round((myCost / personalBudget) * 100) : 0;
  const budgetRemaining = personalBudget > 0 ? personalBudget - myCost : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* ============================================================== */}
      {/* 🎯 HERO SECTION: YOUR PERSONAL SPEND & FINANCIAL GOAL          */}
      {/* ============================================================== */}
      {myBalance && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    Your Personal Trip Spending &amp; Goal
                  </h2>
                  <p className="text-xs text-indigo-200">
                    Track your exact consumption against your personal financial target
                  </p>
                </div>
              </div>

              {/* Budget Goal Edit Trigger */}
              <div className="flex items-center gap-2">
                {isEditingBudget ? (
                  <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
                    <span className="text-xs font-bold pl-2 text-indigo-200">{trip.currency}</span>
                    <input
                      type="number"
                      placeholder="e.g. 8000"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-24 bg-transparent text-xs font-bold text-white focus:outline-none placeholder-slate-400"
                      autoFocus
                    />
                    <button
                      onClick={saveBudget}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                      title="Save Goal"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setBudgetInput(personalBudget > 0 ? personalBudget.toString() : '');
                      setIsEditingBudget(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-indigo-100 transition active:scale-95"
                  >
                    <Edit2 className="w-3 h-3 text-indigo-300" />
                    <span>{personalBudget > 0 ? `Goal: ${trip.currency}${personalBudget.toLocaleString()}` : '+ Set Budget Goal'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Individual Spend Numbers: Consumption + Adjustment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Box 1: Your Real Cost */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-1">
                  Your Real Trip Cost (Share)
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span>{trip.currency}{myBalance.totalShare.toLocaleString()}</span>
                  {/* Adjustment amount (+ or -) */}
                  {myBalance.netBalance > 0.01 ? (
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{trip.currency}{myBalance.netBalance.toLocaleString()} (Get back)
                    </span>
                  ) : myBalance.netBalance < -0.01 ? (
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      -{trip.currency}{Math.abs(myBalance.netBalance).toLocaleString()} (To pay)
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/10 text-slate-300">
                      Settled
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-indigo-300 mt-1">
                  What you actually enjoyed on this trip
                </div>
              </div>

              {/* Box 2: Paid Upfront */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-1">
                  Paid Upfront at Vendors
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {trip.currency}{myBalance.totalPaid.toLocaleString()}
                </div>
                <div className="text-[11px] text-indigo-300 mt-1">
                  Cash or UPI swiped by you
                </div>
              </div>

              {/* Box 3: Budget Goal Status */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-1">
                  Goal Status
                </div>
                {personalBudget > 0 ? (
                  <>
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>{budgetPercent}%</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        budgetRemaining >= 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {budgetRemaining >= 0
                          ? `${trip.currency}${budgetRemaining.toLocaleString()} left`
                          : `${trip.currency}${Math.abs(budgetRemaining).toLocaleString()} over`}
                      </span>
                    </div>
                    {/* Goal Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          budgetPercent > 100
                            ? 'bg-rose-500'
                            : budgetPercent > 80
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, budgetPercent)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-indigo-200 pt-1">
                    No budget target set yet.{' '}
                    <button
                      onClick={() => setIsEditingBudget(true)}
                      className="underline text-blue-300 font-bold"
                    >
                      Set a goal
                    </button>{' '}
                    to keep your trip spending on track!
                  </div>
                )}
              </div>
            </div>

            {/* Personal Category Breakdown if any */}
            {myCategoryBreakdown.length > 0 && (
              <div className="pt-2 border-t border-indigo-900/50">
                <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">
                  Your Personal Spend by Category:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {myCategoryBreakdown.map((c) => (
                    <div
                      key={c.category}
                      className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs"
                    >
                      <div className="text-indigo-200 text-[11px] truncate">{c.category}</div>
                      <div className="font-bold text-white text-sm">
                        {trip.currency}{c.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 👥 ALL MEMBERS INDIVIDUAL SPEND & ADJUSTMENT GRID              */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Individual Member Spend &amp; Adjustments</h3>
              <p className="text-xs text-slate-500">
                True consumption share, upfront payment, and exact + / - delta for each person
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {trip.members.length} Members
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {analytics.memberBalances.map((m) => {
            const isMe = currentUser?.id === m.memberId;
            const sharePercent =
              analytics.totalSpend > 0
                ? Math.round((m.totalShare / analytics.totalSpend) * 100)
                : 0;

            return (
              <div
                key={m.memberId}
                className={`p-4 rounded-2xl border transition ${
                  isMe
                    ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50/50'
                }`}
              >
                {/* Header: Name, Handle, Net Adjustment (+ / -) */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: m.memberColor || '#3b82f6' }}
                    >
                      {m.memberName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                        <span>{m.memberName}</span>
                        {isMe && <span className="text-[11px] text-blue-600 font-bold">(You)</span>}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">@{m.username}</div>
                    </div>
                  </div>

                  {/* Net Adjustment Amount (+ or -) */}
                  <div className="text-right shrink-0">
                    {m.netBalance > 0.01 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{trip.currency}{m.netBalance.toLocaleString()}
                      </span>
                    ) : m.netBalance < -0.01 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        -{trip.currency}{Math.abs(m.netBalance).toLocaleString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual Money Spent Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Trip Share (Consumed)
                    </div>
                    <div className="font-black text-slate-900 text-base mt-0.5">
                      {trip.currency}{m.totalShare.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {sharePercent}% of group total
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Paid Upfront
                    </div>
                    <div className="font-black text-slate-900 text-base mt-0.5">
                      {trip.currency}{m.totalPaid.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {m.netBalance > 0.01
                        ? `Gets ${trip.currency}${m.netBalance.toLocaleString()} back`
                        : m.netBalance < -0.01
                        ? `Needs to pay ${trip.currency}${Math.abs(m.netBalance).toLocaleString()}`
                        : 'Exact match'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 📊 TRIP OVERVIEW METRICS                                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Wallet className="w-4 h-4 text-blue-600" /> Total Group Spend
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {trip.currency}{analytics.totalSpend.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all trip expenses</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <PieChart className="w-4 h-4 text-emerald-600" /> Avg / Person
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {trip.currency}{avgPerPerson.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">For {memberCount} group members</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Award className="w-4 h-4 text-amber-500" /> Top Upfront Spender
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {topSpender ? topSpender.memberName : 'None'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Paid {trip.currency}{topSpender ? topSpender.totalPaid.toLocaleString() : 0} upfront
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1">Spending by Category</h3>
        <p className="text-xs text-slate-500 mb-4">Where was the trip budget spent?</p>

        {analytics.categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No categorized spend yet.</p>
        ) : (
          <div className="space-y-3.5">
            {analytics.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.category}</span>
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{trip.currency}{cat.amount.toLocaleString()}</strong> ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cash vs Online Split */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1">Payment Method Split</h3>
        <p className="text-xs text-slate-500 mb-4">Online payments vs physical cash spent</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold mb-1">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Online / UPI
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950">
              {trip.currency}{analytics.paymentModeBreakdown.online.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              {analytics.totalSpend > 0
                ? Math.round((analytics.paymentModeBreakdown.online / analytics.totalSpend) * 100)
                : 0}% of all spends
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold mb-1">
              <Banknote className="w-4 h-4 text-amber-600" /> Cash
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950">
              {trip.currency}{analytics.paymentModeBreakdown.cash.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              {analytics.totalSpend > 0
                ? Math.round((analytics.paymentModeBreakdown.cash / analytics.totalSpend) * 100)
                : 0}% of all spends
            </div>
          </div>
        </div>
      </div>

      {/* Daily Spend Trend */}
      {analytics.dailySpending.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Day-by-Day Spending
          </h3>
          <p className="text-xs text-slate-500 mb-4">Daily breakdown across the trip dates</p>

          <div className="space-y-2">
            {analytics.dailySpending.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">{day.date}</span>
                <span className="font-bold text-slate-900">{trip.currency}{day.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
