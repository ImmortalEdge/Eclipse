'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageProvider';

type AuthState = 'idle' | 'login' | 'signup';

interface Account {
  email: string;
  name: string;
}

import { LogOut, Mail, Lock, User, ChevronDown } from 'lucide-react';

export default function AccountPanel() {
  const { t } = useLanguage();
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [account, setAccount] = useState<Account | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const justOpenedRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load account from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('eclipse_account');
    if (saved) {
      try {
        setAccount(JSON.parse(saved));
        setAuthState('idle');
      } catch (e) {
        console.error('Failed to load account', e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Ignore clicks right after opening (using ref)
      if (justOpenedRef.current) return;
      
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setAuthState('idle');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    
    setLoading(true);
    // simulate API call
    setTimeout(() => {
      const newAccount = { email, name };
      setAccount(newAccount);
      localStorage.setItem('eclipse_account', JSON.stringify(newAccount));
      setAuthState('idle');
      setEmail('');
      setPassword('');
      setName('');
      setLoading(false);
    }, 800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    // simulate API call
    setTimeout(() => {
      const newAccount = { email, name: email.split('@')[0] };
      setAccount(newAccount);
      localStorage.setItem('eclipse_account', JSON.stringify(newAccount));
      setAuthState('idle');
      setEmail('');
      setPassword('');
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setAccount(null);
    localStorage.removeItem('eclipse_account');
    setShowDropdown(false);
    setAuthState('idle');
  };

  if (account) {
    // Logged in state
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e08b3a] to-[#d97f2f] border border-[#e08b3a]/30 flex items-center justify-center text-[10px] font-bold text-white shadow-lg transition-all hover:shadow-[0_0_20px_rgba(224,139,58,0.3)]"
          title={`Logged in as ${account.email}`}
        >
          {account.name.charAt(0).toUpperCase()}
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl bg-gradient-to-b from-[#1a1714] to-[#0f0d0a] border border-[#e08b3a]/20 shadow-2xl overflow-hidden min-w-[200px]"
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-zinc-800/50">
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold mb-1">Account</div>
                <div className="text-sm text-white font-medium truncate">{account.name}</div>
                <div className="text-xs text-zinc-500 truncate">{account.email}</div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 flex items-center gap-2 text-sm text-zinc-400 hover:text-white hover:bg-[#e08b3a]/10 transition-all"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Auth forms
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          console.log('Account button clicked');
          setAuthState(authState === 'idle' ? 'login' : 'idle');
        }}
        className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-[10px] font-bold text-zinc-600 shadow-lg transition-all hover:border-[#e08b3a]/30 hover:text-zinc-400 hover:shadow-[0_0_15px_rgba(224,139,58,0.1)] active:scale-95"
        title={t.signIn || 'Sign in or create account'}
        type="button"
      >
        <User size={16} />
      </button>

      <AnimatePresence>
        {authState !== 'idle' && mounted && createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-gradient-to-b from-[#1a1714] to-[#0f0d0a] border border-[#e08b3a]/20 shadow-2xl overflow-hidden w-80"
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, maxWidth: 'calc(100vw - 32px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800/50 bg-black/50">
              <h3 className="text-sm font-bold text-white mb-1">
                {authState === 'login' ? (t.signIn || 'Sign In') : (t.createAccount || 'Create Account')}
              </h3>
              <p className="text-xs text-zinc-500">
                {authState === 'login' ? (t.accessAccount || 'Access your Eclipse account') : (t.joinNetwork || 'Join the intelligence network')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={authState === 'login' ? handleLogin : handleSignUp} className="p-4 space-y-3">
              {authState === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t.name || 'Name'}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#e08b3a] focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t.email || 'Email'}</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#e08b3a] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">{t.password || 'Password'}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#e08b3a] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#e08b3a] to-[#d97f2f] hover:from-[#f0a05a] hover:to-[#e8944f] text-black font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {t.processing || 'Processing...'}
                  </span>
                ) : (authState === 'login' ? (t.signIn || 'Sign In') : (t.createAccount || 'Create Account'))}
              </button>
            </form>

            {/* Toggle */}
            <div className="px-4 py-3 border-t border-zinc-800/50 bg-black/30">
              <button
                onClick={() => setAuthState(authState === 'login' ? 'signup' : 'login')}
                className="text-xs text-[#e08b3a] hover:text-[#f0a05a] transition-colors"
              >
                {authState === 'login' ? (t.noAccount || "Don't have an account? Sign up") : (t.hasAccount || 'Already have an account? Sign in')}
              </button>
            </div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}
