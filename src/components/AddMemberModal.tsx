'use client';

import React, { useState } from 'react';
import { Trip, UserProfile } from '@/types';
import UserSearchInput from './UserSearchInput';
import { UserPlus, X, Copy, Check, Users, AtSign } from 'lucide-react';

interface AddMemberModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (userId: string) => Promise<void>;
}

export default function AddMemberModal({
  trip,
  isOpen,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await onAddMember(selectedUser.id);
      setSelectedUser(null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/?join=${trip.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Trip Members ({trip.members.length})</h2>
              <p className="text-xs text-slate-500">{trip.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Shareable Invite Code Box */}
          <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4">
            <div className="text-xs font-semibold text-blue-800 mb-1">Invite Code</div>
            <p className="text-xs text-blue-900/80 mb-3">
              Friends can log in on their device and enter this code:
            </p>
            <div className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-blue-200">
              <span className="font-mono font-bold text-sm text-slate-800 tracking-wider">
                CODE: {trip.code}
              </span>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Current Members with User IDs */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Existing Trip Members
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {trip.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: m.color || '#3b82f6' }}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-900">{m.name}</span>
                  </div>
                  <span className="font-mono text-blue-600 font-bold text-[11px]">
                    @{m.username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Add Registered Member */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Add Registered Friend by User ID
              </label>
              <UserSearchInput
                selectedUsers={selectedUser ? [selectedUser] : []}
                onSelectUser={(u) => setSelectedUser(u)}
                onRemoveUser={() => setSelectedUser(null)}
              />
            </div>

            {selectedUser && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Adding...' : `Add @${selectedUser.username} to Trip`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
