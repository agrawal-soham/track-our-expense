'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Compass, AtSign, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  // Auto-suggest username when typing full name
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!username || username === fullName.toLowerCase().replace(/[^a-z0-9_]/g, '')) {
      const suggested = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setUsername(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
          setErrorMsg('Please fill in all fields.');
          return;
        }

        const res = await signUp(email, password, fullName, username);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setInfoMsg('Account created successfully! Logging you in...');
        }
      } else {
        if (!email.trim() || !password) {
          setErrorMsg('Please enter your email and password.');
          return;
        }

        const res = await signIn(email, password);
        if (res.error) {
          if (res.error.includes('Email not confirmed')) {
            setErrorMsg(
              'Email not confirmed yet. Please confirm via the email sent to you, or ask admin to turn off "Confirm email" in Supabase.'
            );
          } else {
            setErrorMsg(res.error);
          }
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-4 animate-bounce duration-1000">
            <Compass className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TrackOurExpense</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Group trip expense splitting, debt minimization &amp; peer-verified settlements
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSignUp
                  ? 'Get your unique User ID to join & create trips'
                  : 'Log in with your email & password'}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  !isSignUp ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  isSignUp ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Soham Agrawal"
                      value={fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Unique User ID / Handle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Unique User ID *
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">
                      Friends find you by this ID
                    </span>
                  </div>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="soham"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your handle will be: <strong className="text-slate-700">@{username || 'your_id'}</strong>
                  </p>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-blue-500/25 active:scale-98 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? 'Please wait...' : isSignUp ? 'Create My Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure Cloud Auth powered by Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
