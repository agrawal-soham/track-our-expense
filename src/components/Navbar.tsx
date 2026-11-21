'use client';

import React, { useState } from 'react';
import { Trip, Member } from '@/types';
import { Compass, Users, Share2, Plus, Check, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  trip: Trip | null;
  activeMember: Member | null;
  onOpenCreateTrip: () => void;
  onOpenUserSwitcher: () => void;
  onOpenAddMember: () => void;
  tripsList: Trip[];
  onSelectTrip: (tripId: string) => void;
}

export default function Navbar({
  trip,
  activeMember,
  onOpenCreateTrip,
  onOpenUserSwitcher,
  onOpenAddMember,
  tripsList,
  onSelectTrip,
}: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const [showTripMenu, setShowTripMenu] = useState(false);

  const copyInvite = () => {
    if (!trip) return;
    const url = `${window.location.origin}/?join=${trip.code}`;
    const text = `Join our trip "${trip.name}" on TrackOurExpense! Code: ${trip.code}\nLink: ${url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Trip Dropdown */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowTripMenu(!showTripMenu)}
                className="flex items-center gap-1.5 text-left group hover:opacity-85 transition"
              >
                <div>
                  <h1 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-1">
                    {trip ? trip.name : 'TrackOurExpense'}
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                  </h1>
                  {trip && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                        CODE: {trip.code}
                      </span>
                      <span>• {trip.members.length} members</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Trip Switcher Dropdown */}
              {showTripMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Your Trips
                  </div>
                  {tripsList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTrip(t.id);
                        setShowTripMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition flex items-center justify-between ${
                        trip?.id === t.id ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.members.length} members</div>
                      </div>
                      {trip?.id === t.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                    <button
                      onClick={() => {
                        setShowTripMenu(false);
                        onOpenCreateTrip();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    >
                      <Plus className="w-4 h-4" /> Create New Trip
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {trip && (
              <>
                {/* Invite Button */}
                <button
                  onClick={copyInvite}
                  title="Share invite link"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition active:scale-95 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Invite</span>
                    </>
                  )}
                </button>

                {/* Add Member Quick Button */}
                <button
                  onClick={onOpenAddMember}
                  title="Add friends to trip"
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <Users className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Active User Switcher Pill */}
            <button
              onClick={onOpenUserSwitcher}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-full transition border border-slate-200/80 text-xs text-slate-800"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                style={{ backgroundColor: activeMember?.color || '#3b82f6' }}
              >
                {activeMember?.name ? activeMember.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="max-w-[70px] sm:max-w-[100px] truncate font-medium">
                {activeMember ? activeMember.name : 'Select You'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
