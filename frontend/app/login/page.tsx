'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'candidate' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connect to your Node.js Backend
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.status === 'ok') {
        // Save Token & Redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);

        // REDIRECT TO HUB (General Dashboard)
        // The Hub will decide if they are a "General User" (Enroll) or "Candidate" (Dashboard)
        router.push('/hub');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to server. Is Backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-white">

      {/* LEFT PANEL - BRANDING (Light Green/Sky) */}
      <div className="hidden md:flex w-5/12 flex-col justify-center bg-gradient-to-br from-emerald-50 to-sky-50 px-12 relative border-r border-emerald-100">
        <div
          className="absolute top-10 left-10 text-xl font-bold flex items-center gap-2 cursor-pointer text-gray-800"
          onClick={() => router.push('/')}
        >
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <ShieldCheck className="text-emerald-600" />
          </div>
          INCTC
        </div>
        <h1 className="text-4xl font-extrabold leading-tight mb-6 text-gray-800">
          Welcome Back, <br />
          <span className="text-emerald-600">Professional</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Log in to access your student hub, enroll in new certifications, or continue your learning journey.
        </p>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="flex w-full md:w-7/12 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md bg-white p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm">
              <LogIn size={28} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Account Login</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Role</label>
              <div className="relative">
                <select
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 bg-white appearance-none contrast-more:border-gray-400"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="candidate">Candidate</option>
                  <option value="admin">Admin</option>
                  <option value="invigilator">Invigilator</option>
                  <option value="assessor">Assessor</option>
                  <option value="employee">Employee</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <a href="#" className="text-xs text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition">Forgot Password?</a>
              </div>
              <input
                type="password"
                required
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-70 disabled:shadow-none flex justify-center items-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Login to Hub'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">New to INCTC?</p>
            <Link
              href="/signup"
              className="block w-full py-3 bg-white border-2 border-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 hover:border-emerald-200 transition text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}