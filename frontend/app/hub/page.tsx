'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck, BookOpen, CheckCircle, Clock, Award,
    ArrowRight, User, LogOut, Loader2, Star, Lock, Target, Globe, Heart
} from 'lucide-react';

export default function StudentHub() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        // IF NO TOKEN: User is a guest. Stop loading immediately.
        if (!token) {
            setLoading(false);
            return;
        }

        // IF TOKEN EXISTS: Fetch User Data.
        fetch(`http://localhost:5000/api/dashboard?t=${Date.now()}`, {
            headers: { 'x-access-token': token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    setUser(data.user);
                } else {
                    localStorage.clear();
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-emerald-600 gap-2 font-bold">
                <Loader2 className="animate-spin" /> Loading Hub...
            </div>
        );
    }

    // --- LOGIC VARIABLES ---
    const isLoggedIn = !!user;
    
    // --- CORRECTED LOGIC: Check overallStatus instead of profileCompleted ---
    // If the status is anything OTHER than 'Registered' (e.g., 'Profile Completed' after payment), they are enrolled.
    const isEnrolled = user && user.overallStatus !== 'Registered';
    
    // Helper to check if they passed the certification completely
    const isCertified = user && user.overallStatus === 'Certified';

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">

            {/* --- NAVBAR --- */}
            <nav className="bg-white border-b border-emerald-100 p-4 sticky top-0 z-50 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
                        <div className="bg-emerald-100 p-2 rounded-xl group-hover:bg-emerald-200 transition">
                            <ShieldCheck className="text-emerald-600" size={24} />
                        </div>
                        <span className="font-bold text-xl text-emerald-900">INCTC</span>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-6">
                        {isLoggedIn ? (
                            <>
                                <div className="hidden md:flex flex-col text-right">
                                    <span className="text-sm font-bold text-gray-700">{user.fullName}</span>
                                    <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold">
                                        {isEnrolled ? 'Candidate' : 'General User'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                    className="text-gray-400 hover:text-red-500 transition p-2"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 transition shadow-md hover:shadow-lg"
                            >
                                Log In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">

                {/* Header Section */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        {isLoggedIn ? `Welcome, ${user.fullName.split(' ')[0]}` : 'Professional Certification Hub'}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {isLoggedIn
                            ? 'Manage your progress, access modules, and view your professional credentials.'
                            : 'Elevate your healthcare career with our ISO-certified verification protocols.'}
                    </p>
                </div>

                {/* --- TWO COLUMN LAYOUT FOR TOP SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 animate-fadeIn">
                    
                    {/* --- BENEFITS (Left) --- */}
                    <div className="bg-sky-50/50 p-8 rounded-3xl border border-sky-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                                <Award size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Why Get Certified?</h2>
                        </div>
                        <ul className="grid grid-cols-1 gap-4">
                            {[
                                "Global Recognition & Verification",
                                "Hands-on Skill Validation",
                                "ISO Certified Protocols",
                                "Direct Employer Networking"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium bg-white p-3 rounded-xl shadow-sm border border-sky-50">
                                    <CheckCircle className="text-sky-500 shrink-0" size={20} /> {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* --- PROCEDURE (Right) --- */}
                    <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-center relative overflow-hidden">
                         {/* Background Pattern */}
                         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <ShieldCheck size={200} />
                         </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <BookOpen size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Start Your Journey</h2>
                            </div>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Follow our simple, standardized procedure to get certified. Enroll today to unlock access to all assessment modules.
                            </p>
                            <button
                                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-fit bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition transform hover:scale-[1.02] flex items-center gap-2"
                            >
                                View Courses <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                        Available Certifications
                    </h2>
                </div>

                <div id="courses" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* --- COURSE CARD --- */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all group flex flex-col h-full transform hover:-translate-y-1 duration-300">

                        {/* Banner */}
                        <div className="h-48 bg-emerald-50 relative p-6 flex flex-col justify-between group-hover:bg-emerald-100/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="bg-white/80 backdrop-blur text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                                    Core Module
                                </span>
                                {isEnrolled ? (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${isCertified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                        {isCertified ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {isCertified ? 'Certified' : 'In Progress'}
                                    </span>
                                ) : (
                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                                       Admission Open
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">Clinical Injection Techniques</h3>
                                <p className="text-gray-500 text-sm font-medium">Advanced IM / IV / ID / SC Module</p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-8">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Clock size={14} className="text-emerald-500" /> <span>Self-Paced</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Award size={14} className="text-emerald-500" /> <span>ISO Certified</span>
                                </div>
                            </div>

                            {isEnrolled ? (
                                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="text-emerald-600">
                                            {isCertified ? '100%' : user.onlineAssessment?.isPassed ? '60%' : user.onlineAssessment?.isAttempted ? '40%' : '5%'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-1000 ${isCertified ? 'bg-green-500' : 'bg-emerald-500'}`}
                                            style={{ width: isCertified ? '100%' : user.onlineAssessment?.isPassed ? '60%' : user.onlineAssessment?.isAttempted ? '40%' : '5%' }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                                        {isCertified ? 'Certification Issued' : 'Keep going! You are doing great.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-8 text-sm text-gray-600 flex-1 space-y-3">
                                    <p className="leading-relaxed">A comprehensive training program designed for healthcare professionals to master key injection routes.</p>
                                </div>
                            )}

                            <div className="mt-auto">
                                {!isLoggedIn ? (
                                    <button
                                        onClick={() => router.push('/signup')}
                                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2 hover:translate-y-[-2px]"
                                    >
                                        <Lock size={16} /> Login to Enroll
                                    </button>
                                ) : !isEnrolled ? (
                                    <button
                                        onClick={() => router.push('/register')}
                                        className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2 hover:translate-y-[-2px]"
                                    >
                                        Enroll Now (₹5,000) <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition hover:translate-y-[-2px] shadow-md ${isCertified
                                            ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                            }`}
                                    >
                                        {isCertified ? (
                                            <>View Certificate <CheckCircle size={18} /></>
                                        ) : (
                                            <>Go to Dashboard <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- COMING SOON --- */}
                    {isLoggedIn && (
                        <div className="border-3 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center p-10 text-center hover:bg-gray-50/50 transition group cursor-default">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 group-hover:text-emerald-300 group-hover:scale-110 transition duration-300">
                                <Star size={32} />
                            </div>
                            <h3 className="font-bold text-gray-400 group-hover:text-gray-600 transition">Advanced Cardiac Life Support</h3>
                            <span className="mt-4 px-4 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full tracking-wider">Coming In 2026</span>
                        </div>
                    )}
                </div>

                {/* --- VISION & MISSION (Footer Section) --- */}
                <div className="mt-24 pt-16 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition duration-500">
                        <div className="text-center p-6 rounded-2xl hover:bg-sky-50 transition duration-300">
                            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-sky-600 rotate-3 hover:rotate-6 transition">
                                <Globe size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Our Vision</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                To become the world's trusted body for nursing skill verification.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-2xl hover:bg-emerald-50 transition duration-300">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600 -rotate-3 hover:-rotate-6 transition">
                                <Target size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Our Mission</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Validating practical skills objectively through rigorous tech.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-2xl hover:bg-red-50 transition duration-300">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-500">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Our Motto</h3>
                            <p className="text-sm text-gray-500 leading-relaxed italic">
                                "Precision in Practice, Safety in Care."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}