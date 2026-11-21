'use client';

import React, { useState } from 'react';
import { Trip } from '@/types';
import { UserPlus, X, Copy, Check, Users } from 'lucide-react';

interface AddMemberModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (name: string) => Promise<void>;
}

export default function AddMemberModal({
  trip,
  isOpen,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onAddMember(name.trim());
      setName('');
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

        <div className="p-6 space-y-5">
          {/* Shareable Invite Code Box */}
          <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4">
            <div className="text-xs font-semibold text-blue-800 mb-1">Share with Friends</div>
            <p className="text-xs text-blue-900/80 mb-3">
              Friends can open the link or enter the code to join on their own phone:
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
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Current Members List */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Existing Members
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {trip.members.map((m) => (
                <div
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: m.color || '#3b82f6' }}
                  />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Member Input */}
          <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Add Friend Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Vicky, Neha..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
