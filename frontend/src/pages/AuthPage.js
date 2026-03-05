import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8" stroke="white" fill="none" strokeWidth="2"/></svg>
            </div>
            <span className="text-2xl font-bold text-white">CollabNotes</span>
          </div>
          <p className="text-text-muted text-sm">Collaborative note-taking, simplified.</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8">
          {/* Tabs */}
          <div className="flex rounded-lg bg-base-200 p-1 mb-6">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? 'bg-surface-200 text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Full Name</label>
                <input
                  type="text" placeholder="Ishan Perera" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-base-200 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Email</label>
              <input
                type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-base-200 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Password</label>
              <input
                type="password" placeholder="••••••••" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-base-200 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-text-dim focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-dim text-xs mt-4">
          Demo: register with any email & password (min 6 chars)
        </p>
      </div>
    </div>
  );
}
