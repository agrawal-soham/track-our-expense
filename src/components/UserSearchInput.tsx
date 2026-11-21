'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { Search, AtSign, UserPlus, Check, AlertCircle, Loader2 } from 'lucide-react';

interface UserSearchInputProps {
  selectedUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onRemoveUser: (userId: string) => void;
  currentUserId?: string;
}

export default function UserSearchInput({
  selectedUsers,
  onSelectUser,
  onRemoveUser,
  currentUserId,
}: UserSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const cleanQ = query.trim().replace(/^@/, '');
    if (cleanQ.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(cleanQ)}`);
        const data = await res.json();
        setResults(data.users || []);
        setHasSearched(true);
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const isSelected = (id: string) => selectedUsers.some((u) => u.id === id);

  return (
    <div className="space-y-3">
      {/* Selected Users Chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          {selectedUsers.map((u) => (
            <div
              key={u.id}
              className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs shadow-2xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{u.full_name}</span>
              <span className="font-mono text-blue-600 font-bold">@{u.username}</span>
              {u.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => onRemoveUser(u.id)}
                  className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search registered user by @username, full name, or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3.5 top-3" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {query.trim().length >= 2 && !loading && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
          {results.length === 0 && hasSearched ? (
            <div className="p-4 text-center text-xs text-slate-500 space-y-1">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="font-bold text-slate-800">No registered user found</p>
              <p className="text-[11px] text-slate-400">
                Only people who have signed up in TrackOurExpense can be added to trips. Ask your friend to create an account first!
              </p>
            </div>
          ) : (
            results.map((u) => {
              const alreadyAdded = isSelected(u.id);

              return (
                <div
                  key={u.id}
                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition rounded-xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : '@'}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {u.full_name}
                      </div>
                      <div className="text-[11px] font-mono text-blue-600 font-bold flex items-center gap-1">
                        <AtSign className="w-3 h-3" />
                        {u.username}
                      </div>
                    </div>
                  </div>

                  {alreadyAdded ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                      <Check className="w-3 h-3" /> Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectUser(u);
                        setQuery('');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
