import fs from 'fs';
import path from 'path';
import { Trip, Expense, Concern, Settlement, Member } from '@/types';

interface StoreData {
  trips: Record<string, Trip>;
  expenses: Record<string, Expense[]>;
  concerns: Record<string, Concern[]>;
  settlements: Record<string, Settlement[]>;
}

// In-memory cache
let memoryStore: StoreData | null = null;

// File path for local disk persistence
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA: StoreData = {
  trips: {
    'trip-demo-goa': {
      id: 'trip-demo-goa',
      code: 'GOA2026',
      name: 'Goa Roadtrip 🚗🏖️',
      description: 'Annual college reunion & beach getaway with 6 friends',
      currency: '₹',
      createdBy: 'm1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      members: [
        { id: 'm1', name: 'Soham (You)', color: '#3b82f6', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm2', name: 'Aarav', color: '#10b981', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm3', name: 'Priya', color: '#ec4899', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm4', name: 'Rohan', color: '#f59e0b', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm5', name: 'Ananya', color: '#8b5cf6', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm6', name: 'Kabir', color: '#06b6d4', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ],
    },
  },
  expenses: {
    'trip-demo-goa': [
      {
        id: 'exp-1',
        tripId: 'trip-demo-goa',
        title: 'Highway Tolls & Fuel',
        amount: 3600,
        paidBy: 'm1',
        splitBetween: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
        paymentMode: 'online',
        remarks: 'Fastag recharge and Shell petrol pump at Kolhapur',
        category: 'Travel',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'm1',
      },
      {
        id: 'exp-2',
        tripId: 'trip-demo-goa',
        title: 'Beach Resort Booking (2 Nights)',
        amount: 18000,
        paidBy: 'm2',
        splitBetween: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
        paymentMode: 'online',
        remarks: '3 Deluxe rooms at Candolim Beach Resort',
        category: 'Stay',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'm2',
      },
      {
        id: 'exp-3',
        tripId: 'trip-demo-goa',
        title: 'Dinner at Thalassa Cafe',
        amount: 5400,
        paidBy: 'm3',
        splitBetween: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
        paymentMode: 'online',
        remarks: 'Greek dinner + cocktails at sunset',
        category: 'Food',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'm3',
      },
      {
        id: 'exp-4',
        tripId: 'trip-demo-goa',
        title: 'Fort Aguada & Lighthouse Entry Tickets',
        amount: 600,
        paidBy: 'm4',
        splitBetween: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
        paymentMode: 'cash',
        remarks: 'Bought tickets at counter in cash for everyone',
        category: 'Entertainment',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'm4',
      },
      {
        id: 'exp-5',
        tripId: 'trip-demo-goa',
        title: 'Water Sports Combo (Scuba + Jetski)',
        amount: 7500,
        paidBy: 'm5',
        splitBetween: ['m1', 'm3', 'm5'], // only 3 people opted for watersports!
        paymentMode: 'online',
        remarks: 'Calangute beach water sports package for 3',
        category: 'Entertainment',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'm5',
      },
    ],
  },
  concerns: {
    'trip-demo-goa': [
      {
        id: 'con-1',
        expenseId: 'exp-5',
        tripId: 'trip-demo-goa',
        raisedBy: 'm4',
        raisedByName: 'Rohan',
        message: 'Double checking to make sure I was not included in watersports split since I stayed at beach shack 👍',
        resolved: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  settlements: {
    'trip-demo-goa': [
      {
        id: 'set-1',
        tripId: 'trip-demo-goa',
        fromUser: 'm4',
        toUser: 'm2',
        amount: 2500,
        paymentMode: 'online',
        notes: 'Sent via UPI for resort advance',
        status: 'approved',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 'm2',
      },
      {
        id: 'set-2',
        tripId: 'trip-demo-goa',
        fromUser: 'm6',
        toUser: 'm1',
        amount: 1000,
        paymentMode: 'cash',
        notes: 'Handed ₹1000 cash for petrol',
        status: 'pending',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
};

function ensureStore(): StoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      return memoryStore!;
    }
  } catch (err) {
    console.warn('Could not read from local db file, falling back to memory/defaults:', err);
  }

  // Clone initial data
  memoryStore = JSON.parse(JSON.stringify(INITIAL_DATA));
  saveStore();
  return memoryStore!;
}

function saveStore() {
  if (!memoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    // In read-only environments (like some serverless containers), file write may fail, memory store continues working
    console.warn('Could not persist to local db file (read-only filesystem or serverless):', err);
  }
}

export const db = {
  // Trips
  getAllTrips(): Trip[] {
    const store = ensureStore();
    return Object.values(store.trips).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getTripById(id: string): Trip | null {
    const store = ensureStore();
    return store.trips[id] || null;
  },

  getTripByCode(code: string): Trip | null {
    const store = ensureStore();
    const upper = code.trim().toUpperCase();
    return Object.values(store.trips).find((t) => t.code.toUpperCase() === upper) || null;
  },

  createTrip(trip: Trip): Trip {
    const store = ensureStore();
    store.trips[trip.id] = trip;
    if (!store.expenses[trip.id]) store.expenses[trip.id] = [];
    if (!store.concerns[trip.id]) store.concerns[trip.id] = [];
    if (!store.settlements[trip.id]) store.settlements[trip.id] = [];
    saveStore();
    return trip;
  },

  addMemberToTrip(tripId: string, member: Member): Trip | null {
    const store = ensureStore();
    const trip = store.trips[tripId];
    if (!trip) return null;

    // Check if member already exists
    const existing = trip.members.find((m) => m.id === member.id || m.name.toLowerCase() === member.name.toLowerCase());
    if (existing) {
      return trip;
    }

    trip.members.push(member);
    saveStore();
    return trip;
  },

  // Expenses
  getExpenses(tripId: string): Expense[] {
    const store = ensureStore();
    return (store.expenses[tripId] || []).sort(
      (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );
  },

  addExpense(tripId: string, expense: Expense): Expense {
    const store = ensureStore();
    if (!store.expenses[tripId]) store.expenses[tripId] = [];
    store.expenses[tripId].unshift(expense);
    saveStore();
    return expense;
  },

  deleteExpense(tripId: string, expenseId: string): boolean {
    const store = ensureStore();
    if (!store.expenses[tripId]) return false;
    const initialLen = store.expenses[tripId].length;
    store.expenses[tripId] = store.expenses[tripId].filter((e) => e.id !== expenseId);
    saveStore();
    return store.expenses[tripId].length < initialLen;
  },

  // Concerns
  getConcerns(tripId: string, expenseId?: string): Concern[] {
    const store = ensureStore();
    const list = store.concerns[tripId] || [];
    if (expenseId) {
      return list.filter((c) => c.expenseId === expenseId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addConcern(tripId: string, concern: Concern): Concern {
    const store = ensureStore();
    if (!store.concerns[tripId]) store.concerns[tripId] = [];
    store.concerns[tripId].unshift(concern);
    saveStore();
    return concern;
  },

  resolveConcern(tripId: string, concernId: string): boolean {
    const store = ensureStore();
    const list = store.concerns[tripId] || [];
    const item = list.find((c) => c.id === concernId);
    if (item) {
      item.resolved = true;
      saveStore();
      return true;
    }
    return false;
  },

  // Settlements
  getSettlements(tripId: string): Settlement[] {
    const store = ensureStore();
    return (store.settlements[tripId] || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addSettlement(tripId: string, settlement: Settlement): Settlement {
    const store = ensureStore();
    if (!store.settlements[tripId]) store.settlements[tripId] = [];
    store.settlements[tripId].unshift(settlement);
    saveStore();
    return settlement;
  },

  updateSettlementStatus(
    tripId: string,
    settlementId: string,
    status: 'approved' | 'rejected',
    resolvedBy: string
  ): Settlement | null {
    const store = ensureStore();
    const list = store.settlements[tripId] || [];
    const item = list.find((s) => s.id === settlementId);
    if (!item) return null;

    item.status = status;
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = resolvedBy;
    saveStore();
    return item;
  },
};
