'use client';

import React from 'react';
import { Trip, TripAnalytics } from '@/types';
import { PieChart, Wallet, CreditCard, Banknote, Calendar, Award } from 'lucide-react';

interface AnalyticsTabProps {
  trip: Trip;
  analytics: TripAnalytics;
}

export default function AnalyticsTab({ trip, analytics }: AnalyticsTabProps) {
  const memberCount = trip.members.length || 1;
  const avgPerPerson = Math.round(analytics.totalSpend / memberCount);

  // Find top spender
  const sortedByPaid = [...analytics.memberBalances].sort((a, b) => b.totalPaid - a.totalPaid);
  const topSpender = sortedByPaid[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Wallet className="w-4 h-4 text-blue-600" /> Total Trip Spend
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
            <Award className="w-4 h-4 text-amber-500" /> Top Contributor
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {topSpender ? topSpender.memberName : 'None'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Paid {trip.currency}{topSpender ? topSpender.totalPaid.toLocaleString() : 0}
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
