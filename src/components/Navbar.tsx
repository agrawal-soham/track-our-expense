'use client';

import React, { useState } from 'react';
import { Trip, UserProfile } from '@/types';
import { Compass, Users, Share2, Plus, Check, ChevronDown, LogOut, Copy, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  trip: Trip | null;
  currentUser: UserProfile;
  onOpenCreateTrip: () => void;
  onOpenAddMember: () => void;
  onOpenAdmin?: () => void;
  tripsList: Trip[];
  onSelectTrip: (tripId: string) => void;
  onSignOut: () => void;
}

export default function Navbar({
  trip,
  currentUser,
  onOpenCreateTrip,
  onOpenAddMember,
  onOpenAdmin,
  tripsList,
  onSelectTrip,
  onSignOut,
}: NavbarProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showTripMenu, setShowTripMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if current user is admin
  const isAdmin =
    currentUser.is_admin ||
    currentUser.email === 'soham3389@gmail.com' ||
    currentUser.email === 'soham.agrawal005@gmail.com' ||
    currentUser.username === 'soham24';

  const copyInvite = () => {
    if (!trip) return;
    const url = `${window.location.origin}/?join=${trip.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyMyId = () => {
    navigator.clipboard.writeText(`@${currentUser.username}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
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
                    {trip ? trip.name : 'Select Trip'}
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                  </h1>
                  {trip ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                        CODE: {trip.code}
                      </span>
                      <span>• {trip.members.length} members</span>
                      {trip.status === 'paused' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          PAUSED
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">No active trip</span>
                  )}
                </div>
              </button>

              {/* Trip Switcher Dropdown */}
              {showTripMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Your Trips
                  </div>
                  {tripsList.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400 italic">No trips yet. Create one!</div>
                  ) : (
                    tripsList.map((t) => (
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
                    ))
                  )}
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
            {/* Overall Admin Button */}
            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                title="Overall Admin Console"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition shadow-2xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {trip && (
              <>
                <button
                  onClick={copyInvite}
                  title="Share invite link"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition active:scale-95 shadow-2xs"
                >
                  {copiedLink ? (
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

                <button
                  onClick={onOpenAddMember}
                  title="Add members"
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <Users className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Authenticated User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-full transition border border-slate-200/80 text-xs text-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold leading-tight">{currentUser.full_name}</div>
                  <div className="text-[10px] font-mono text-blue-600 font-semibold">
                    @{currentUser.username}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{currentUser.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Your Unique ID</div>
                      <div className="font-mono text-blue-600 font-bold text-xs">@{currentUser.username}</div>
                    </div>
                    <button
                      onClick={copyMyId}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 p-1.5 hover:bg-slate-200 rounded-lg transition"
                      title="Copy User ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isAdmin && onOpenAdmin && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600" /> Platform Admin Console
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
