'use client';

import React from 'react';
import { Trip, Member, MemberBalance, SimplifiedDebt } from '@/types';
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Scale, HandCoins } from 'lucide-react';

interface BalancesTabProps {
  trip: Trip;
  memberBalances: MemberBalance[];
  debts: SimplifiedDebt[];
  activeMember: Member | null;
  onQuickSettle: (fromId: string, toId: string, amount: number) => void;
}

export default function BalancesTab({
  trip,
  memberBalances,
  debts,
  activeMember,
  onQuickSettle,
}: BalancesTabProps) {
  // Find active member's balance
  const myBalance = memberBalances.find((b) => b.memberId === activeMember?.id);

  return (
    <div className="space-y-6 pb-20">
      {/* Active User's Personal Status Banner */}
      {activeMember && myBalance && (
        <div
          className={`p-5 rounded-2xl border shadow-xs transition ${
            myBalance.netBalance > 0.01
              ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200'
              : myBalance.netBalance < -0.01
              ? 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-200'
              : 'bg-gradient-to-r from-slate-500/10 via-slate-500/5 to-transparent border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Personal Net Status
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {myBalance.netBalance > 0.01 ? (
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <TrendingUp className="w-6 h-6 shrink-0" />
                    You are owed {trip.currency}{Math.abs(myBalance.netBalance).toLocaleString()}
                  </span>
                ) : myBalance.netBalance < -0.01 ? (
                  <span className="text-rose-600 flex items-center gap-1.5">
                    <TrendingDown className="w-6 h-6 shrink-0" />
                    You owe {trip.currency}{Math.abs(myBalance.netBalance).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    You are all settled up!
                  </span>
                )}
              </h2>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Total paid: <span className="font-semibold text-slate-800">{trip.currency}{myBalance.totalPaid.toLocaleString()}</span></div>
              <div>Your share: <span className="font-semibold text-slate-800">{trip.currency}{myBalance.totalShare.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Settlements (Smart Debt Minimization) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Direct Payments Needed</h3>
              <p className="text-xs text-slate-500">
                Backend calculated with minimum number of transfers
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {debts.length} {debts.length === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>

        {debts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Everyone is square!</p>
            <p className="text-xs">No pending debts between any members in this trip.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {debts.map((debt, idx) => {
              const isSenderMe = activeMember?.id === debt.fromMemberId;
              const isRecipientMe = activeMember?.id === debt.toMemberId;

              return (
                <div
                  key={idx}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {isSenderMe ? <span className="text-blue-600">You</span> : debt.fromMemberName}
                    </span>

                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="text-[11px] font-medium text-slate-500">pays</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    <span className="font-bold text-slate-900 text-sm">
                      {isRecipientMe ? <span className="text-blue-600">You</span> : debt.toMemberName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-extrabold text-base text-slate-900">
                      {trip.currency}{debt.amount.toLocaleString()}
                    </span>

                    {/* Settle button */}
                    <button
                      onClick={() => onQuickSettle(debt.fromMemberId, debt.toMemberId, debt.amount)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                        isSenderMe
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      <span>{isSenderMe ? 'Pay Now' : 'Record Pay'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual Net Balances Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1">All Member Balances</h3>
        <p className="text-xs text-slate-500 mb-4">
          Detailed breakdown of total spent, share consumed, and net standings
        </p>

        <div className="space-y-3">
          {memberBalances.map((m) => {
            const isMe = activeMember?.id === m.memberId;

            return (
              <div
                key={m.memberId}
                className={`p-3.5 rounded-xl border transition ${
                  isMe ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: m.memberColor || '#3b82f6' }}
                    >
                      {m.memberName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {m.memberName} {isMe && <span className="text-blue-600 text-xs font-semibold">(You)</span>}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {m.netBalance > 0.01 ? (
                      <span className="font-extrabold text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        +{trip.currency}{m.netBalance.toLocaleString()}
                      </span>
                    ) : m.netBalance < -0.01 ? (
                      <span className="font-extrabold text-sm text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        -{trip.currency}{Math.abs(m.netBalance).toLocaleString()}
                      </span>
                    ) : (
                      <span className="font-semibold text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <div>
                    Paid for trip: <strong className="text-slate-700">{trip.currency}{m.totalPaid.toLocaleString()}</strong>
                  </div>
                  <div>
                    Fair share: <strong className="text-slate-700">{trip.currency}{m.totalShare.toLocaleString()}</strong>
                  </div>
                  <div>
                    Settlements paid: <strong className="text-slate-700">{trip.currency}{m.settlementsPaid.toLocaleString()}</strong>
                  </div>
                  <div>
                    Settlements received: <strong className="text-slate-700">{trip.currency}{m.settlementsReceived.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
