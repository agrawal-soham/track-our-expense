'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import UserSearchInput from './UserSearchInput';
import { X, Compass, Users } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateTrip: (data: {
    name: string;
    description?: string;
    currency: string;
    memberUserIds: string[];
  }) => Promise<void>;
}

export default function CreateTripModal({
  isOpen,
  onClose,
  currentUser,
  onCreateTrip,
}: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [selectedFriends, setSelectedFriends] = useState<UserProfile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectUser = (user: UserProfile) => {
    if (!selectedFriends.some((u) => u.id === user.id)) {
      setSelectedFriends([...selectedFriends, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedFriends(selectedFriends.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a trip name.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateTrip({
        name: name.trim(),
        description: description.trim(),
        currency,
        memberUserIds: selectedFriends.map((u) => u.id),
      });
      onClose();
      setName('');
      setDescription('');
      setSelectedFriends([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Group Trip</h2>
              <p className="text-xs text-slate-500">Track and split with registered friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Manali Snow Expedition 🏔️"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="AED">AED (Dirham)</option>
                <option value="THB">฿ (Baht)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Created By (You)
              </label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium truncate">
                {currentUser.full_name} <span className="text-blue-600 font-bold font-mono">@{currentUser.username}</span>
              </div>
            </div>
          </div>

          {/* Add Registered Members via User ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Add Trip Members by User ID
              </label>
              <span className="text-[11px] text-slate-400">
                Only registered users are searchable
              </span>
            </div>
            <UserSearchInput
              selectedUsers={selectedFriends}
              onSelectUser={handleSelectUser}
              onRemoveUser={handleRemoveUser}
              currentUserId={currentUser.id}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 5 days roadtrip with college friends"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition"
            >
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
