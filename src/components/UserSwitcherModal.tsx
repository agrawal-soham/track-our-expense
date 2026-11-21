'use client';

import React, { useState } from 'react';
import { Trip, Member } from '@/types';
import { X, Check, UserCheck, UserPlus } from 'lucide-react';

interface UserSwitcherModalProps {
  trip: Trip;
  activeMember: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: Member) => void;
  onJoinAsNewMember: (name: string) => Promise<void>;
}

export default function UserSwitcherModal({
  trip,
  activeMember,
  isOpen,
  onClose,
  onSelectMember,
  onJoinAsNewMember,
}: UserSwitcherModalProps) {
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleJoinNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      await onJoinAsNewMember(newName.trim());
      setNewName('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Who Are You?</h2>
              <p className="text-xs text-slate-500">Select your profile on this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Member profiles */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {trip.members.map((m) => {
              const isSelected = activeMember?.id === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMember(m);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: m.color || '#3b82f6' }}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold">{m.name}</span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Or join with new name */}
          <form onSubmit={handleJoinNew} className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Not on the list? Enter your name:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Your name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
