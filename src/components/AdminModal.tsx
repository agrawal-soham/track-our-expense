'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, PauseCircle, PlayCircle, Trash2, Loader2, Users, Wallet, RefreshCw } from 'lucide-react';

interface AdminTrip {
  id: string;
  code: string;
  name: string;
  description?: string;
  currency: string;
  status: 'active' | 'paused';
  createdAt: string;
  creator: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  } | null;
  memberCount: number;
  totalSpend: number;
}

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripUpdated?: () => void;
}

export default function AdminModal({ isOpen, onClose, onTripUpdated }: AdminModalProps) {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAllTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/trips');
      const data = await res.json();
      if (data.trips) {
        setTrips(data.trips);
      }
    } catch (err) {
      console.error('Failed to fetch admin trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllTrips();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePause = async (tripId: string, currentStatus: 'active' | 'paused') => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setActionId(tripId);
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchAllTrips();
      if (onTripUpdated) onTripUpdated();
    } catch (err: any) {
      alert(err.message || 'Error updating trip');
    } finally {
      setActionId(null);
    }
  };

  const deleteTrip = async (tripId: string, tripName: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete the trip "${tripName}"? This cannot be undone.`)) {
      return;
    }
    setActionId(tripId);
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete trip');
      await fetchAllTrips();
      if (onTripUpdated) onTripUpdated();
    } catch (err: any) {
      alert(err.message || 'Error deleting trip');
    } finally {
      setActionId(null);
    }
  };

  const totalVolume = trips.reduce((acc, t) => acc + t.totalSpend, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Platform Admin Console</h2>
              <p className="text-xs text-slate-400">Manage, pause, or delete any trip across the entire system</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllTrips}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-level platform stats */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-slate-200/80">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Trips</div>
            <div className="text-xl font-black text-slate-900">{trips.length}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Active Trips</div>
            <div className="text-xl font-black text-emerald-600">
              {trips.filter((t) => t.status !== 'paused').length}
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Volume</div>
            <div className="text-xl font-black text-blue-600">
              ₹{totalVolume.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Trips Table / List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs">Loading all platform trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No trips exist on the platform yet.
            </div>
          ) : (
            trips.map((t) => {
              const isPaused = t.status === 'paused';
              const isBusy = actionId === t.id;

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPaused ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {t.code}
                      </span>
                      {isPaused ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          PAUSED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>
                        Creator: <strong className="text-slate-800">{t.creator?.full_name || 'User'}</strong>{' '}
                        <span className="text-blue-600 font-mono">(@{t.creator?.username || 'user'})</span>
                      </span>
                      <span>•</span>
                      <span>{t.memberCount} members</span>
                      <span>•</span>
                      <span>Spend: <strong className="text-slate-900">{t.currency}{t.totalSpend.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => togglePause(t.id, t.status)}
                      disabled={isBusy}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isPaused
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      }`}
                    >
                      {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={() => deleteTrip(t.id, t.name)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
