'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, User, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'candidate' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.status === 'ok') {
        alert("Account Created! Please Login.");
        router.push('/login');
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to server.");
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
          Begin Your <br />
          <span className="text-emerald-600">Journey</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Create an account to access world-class clinical assessments and manage your professional certifications.
        </p>
      </div>

      {/* RIGHT PANEL - SIGNUP FORM */}
      <div className="flex w-full md:w-7/12 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md bg-white p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm">
              <UserPlus size={28} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Join INCTC today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  placeholder="John Doe"
                  className="w-full pl-11 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="nurse@example.com"
                  className="w-full pl-11 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full pl-11 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-70 disabled:shadow-none flex justify-center items-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition">Login</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}