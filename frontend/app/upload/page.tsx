'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, CheckCircle, AlertTriangle, ArrowLeft,
  ShieldCheck, Clock, Award, Download, Lock
} from 'lucide-react';

export default function SkillResult() {
  const router = useRouter();

  // 'loading' | 'denied' | 'pending' | 'graded'
  const [status, setStatus] = useState('loading');
  const [scores, setScores] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    // FETCH DASHBOARD DATA
    fetch('http://localhost:5000/api/dashboard', {
      headers: { 'x-access-token': token }
    })
      .then(res => res.json())
      .then(data => {
        // 1. Check Pre-requisite (Must pass Quiz)
        if (!data.user.quizPassed) {
          setStatus('denied');
          return;
        }

        // 2. Check Grading Status
        // CRITICAL FIX: We check 'offlineStatus' instead of just 'skillScores'
        // because MongoDB defaults 'skillScores' to 0, which makes it look like a fail.
        if (data.user.offlineStatus === 'Approved') {
          setScores(data.user.skillScores);
          setStatus('graded');
        } else {
          // Status is 'Not Started' or 'Pending' -> Show Waiting Screen
          setStatus('pending');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // --- HELPER: Badge Logic ---
  const getBadge = (percentage: number) => {
    if (percentage >= 90) return { label: 'GOLD STANDARD', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🥇' };
    if (percentage >= 75) return { label: 'SILVER STANDARD', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🥈' };
    if (percentage >= 50) return { label: 'BRONZE STANDARD', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🥉' };
    return { label: 'BELOW COMPETENCY', color: 'bg-red-50 text-red-700 border-red-200', icon: '⚠️' };
  };

  // --- RENDER 1: LOADING ---
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-emerald-700 font-bold animate-pulse">
        Retrieving Assessment Records...
      </div>
    );
  }

  // --- RENDER 2: ACCESS DENIED (Quiz Not Passed) ---
  if (status === 'denied') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 max-w-md w-full">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Section Locked</h2>
          <p className="text-gray-600 mb-6 mt-2 text-sm">
            You must pass the <strong>Online Knowledge Quiz</strong> before viewing skill results.
          </p>
          <button onClick={() => router.push('/dashboard')} className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER 3: PENDING (Initial State / Waiting for Assessor) ---
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-10 text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Results</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your practical performance is currently under review by the invigilator.
            Scores will be updated here once the assessment is finalized.
          </p>

          {/* Placeholder Score List as requested */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 inline-block text-left w-full max-w-md">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Skill Assessment Checklist</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-semibold">IM Procedure</span>
                <span className="text-gray-400 font-mono bg-white px-2 py-1 rounded border">-- / 100</span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-semibold">IV Procedure</span>
                <span className="text-gray-400 font-mono bg-white px-2 py-1 rounded border">-- / 100</span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-semibold">ID Procedure</span>
                <span className="text-gray-400 font-mono bg-white px-2 py-1 rounded border">-- / 100</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-semibold">SC Procedure</span>
                <span className="text-gray-400 font-mono bg-white px-2 py-1 rounded border">-- / 100</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition mx-auto font-semibold">
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 4: RESULTS PUBLISHED (Scores Available & Status is 'Approved') ---
  const badge = getBadge(scores.percentage);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-emerald-800">Skill Assessment Report</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Practical Clinical Examination Results</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl">
            <ShieldCheck size={32} className="text-emerald-600" />
          </div>
        </div>

        <div className="p-8">

          {/* AGGREGATE CARD */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Score Circle */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Score</p>
                <p className="text-4xl font-black text-gray-800 mt-2">{scores.total} <span className="text-lg text-gray-400 font-medium">/ 400</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Percentage</p>
                <p className={`text-4xl font-black mt-2 ${scores.percentage >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {scores.percentage}%
                </p>
              </div>
            </div>

            {/* Badge Card */}
            <div className={`flex-1 rounded-2xl p-6 border flex items-center gap-4 ${badge.color}`}>
              <div className="text-5xl">{badge.icon}</div>
              <div>
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Competency Level</p>
                <h2 className="text-xl font-black mt-1 leading-tight">{badge.label}</h2>
              </div>
            </div>
          </div>

          {/* DETAILED SCORES LIST */}
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detailed Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <ScoreItem label="IM Procedure (Intramuscular)" score={scores.im} />
            <ScoreItem label="IV Procedure (Intravenous)" score={scores.iv} />
            <ScoreItem label="ID Procedure (Intradermal)" score={scores.id} />
            <ScoreItem label="SC Procedure (Subcutaneous)" score={scores.sc} />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => alert("Downloading PDF Report...")} // Hook up to PDF generation later
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <Download size={20} /> Download Official Score Report
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 hover:text-gray-800"
            >
              <ArrowLeft size={20} /> Return to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple Sub-component for individual list items
const ScoreItem = ({ label, score }: { label: string, score: number }) => (
  <div className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
    <span className="font-semibold text-gray-700 text-sm">{label}</span>
    <span className={`font-bold text-lg ${score >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
      {score} <span className="text-xs text-gray-400">/100</span>
    </span>
  </div>
);