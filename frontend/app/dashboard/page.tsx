'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck, Video, FileText, CheckCircle, Clock, Award,
    User, MapPin, Phone, Mail, Calendar, BookOpen, Hash,
    LogOut, XCircle, Lock, ArrowUp
} from 'lucide-react';

// --- HELPER: ROBUST DRIVE IMAGE LINK ---
const formatDriveLink = (url: string) => {
    if (!url) return '';
    // Extract File ID from the Drive URL
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

    if (idMatch && idMatch[1]) {
        // FIX: Use the 'thumbnail' endpoint instead of 'uc?export=view'
        // 'sz=w1000' requests a high-quality version (width 1000px)
        // This endpoint bypasses many of the redirect/virus-scan issues
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
    return url;
};

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [canStartExam, setCanStartExam] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        // FETCH FRESH DATA FROM DB
        fetch(`http://localhost:5000/api/dashboard?t=${Date.now()}`, {
            headers: { 'x-access-token': token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    setUser(data.user);
                    setCanStartExam(true);
                } else {
                    localStorage.clear();
                    router.push('/login');
                }
                setLoading(false);
            })
            .catch(() => router.push('/login'));
    }, []);

    const calculateAge = (dobString: string) => {
        if (!dobString) return 'N/A';
        const diff = Date.now() - new Date(dobString).getTime();
        return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    };

    const formatAddress = (addr: any) => {
        if (!addr) return 'N/A';
        return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`;
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-emerald-600 font-bold gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div> Loading Profile...</div>;

    return (
        <div className="flex min-h-screen w-full bg-slate-50 font-sans">

            {/* SIDEBAR */}
            <div className="hidden md:flex w-64 flex-col bg-white text-gray-800 p-6 sticky top-0 h-screen border-r border-gray-200 z-10">
                <div className="text-xl font-extrabold mb-10 flex items-center gap-2 text-emerald-700 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="bg-emerald-100 p-1.5 rounded-lg">
                        <ShieldCheck className="text-emerald-600" size={20} />
                    </div>
                    INCTC
                </div>

                <div className="mb-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Logged In As</p>
                    <p className="font-bold text-lg truncate text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <button className="flex items-center gap-3 w-full p-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 transition-all hover:translate-x-1">
                        <User size={18} /> Profile
                    </button>
                </nav>

                <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="mt-auto flex items-center gap-2 text-gray-400 hover:text-red-500 transition font-bold text-sm p-2 hover:bg-red-50 rounded-lg">
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Candidate Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your certification progress and profile.</p>
                    </div>
                    <div className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${user.isCertified ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-sky-100 text-sky-800 border border-sky-200'}`}>
                        {user.isCertified ? <CheckCircle size={16} /> : <Clock size={16} />}
                        {user.isCertified ? 'Certified Professional' : 'Certification In Progress'}
                    </div>
                </header>

                {/* PROFILE CARD */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                    <div className="bg-gradient-to-r from-emerald-600 to-sky-600 h-28 w-full relative"></div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start -mt-12">

                            {/* --- PASSPORT PHOTO SECTION --- */}
                            <div className="flex-shrink-0">
                                <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden relative group">
                                    {user.documents?.photo ? (
                                        <>
                                            <img
                                                src={formatDriveLink(user.documents.photo)}
                                                alt={user.fullName}
                                                className="w-full h-full object-cover bg-gray-50"

                                                // SECURITY
                                                referrerPolicy="no-referrer"

                                                onError={(e) => {
                                                    console.error("Dashboard Image Load Error for URL:", formatDriveLink(user.documents.photo));
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            {/* Fallback Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 -z-10">
                                                <User size={40} className="text-gray-300" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><User size={40} /></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 w-full pt-14 md:pt-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                                        <p className="text-gray-500 text-sm font-medium">Candidate ID: <span className="font-mono text-emerald-600">{user._id.slice(-6).toUpperCase()}</span></p>
                                    </div>
                                    <div className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-sky-100 flex items-center gap-1.5">
                                        <MapPin size={14} /> {user.booking?.testCenter || 'N/A'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                    <InfoItem icon={<Calendar size={18} />} label="Age / Sex" value={`${calculateAge(user.dob)} Yrs / ${user.gender}`} />
                                    <InfoItem icon={<Phone size={18} />} label="Mobile" value={user.mobile} />
                                    <InfoItem icon={<Mail size={18} />} label="Email" value={user.email} />
                                    <InfoItem icon={<BookOpen size={18} />} label="Qualification" value={`${user.education?.ug?.degree} (${user.education?.ug?.yearOfPassing})`} />
                                    <InfoItem icon={<Hash size={18} />} label="Nursing Reg. No" value={user.profession?.rnmNumber || 'N/A'} />
                                    <InfoItem icon={<Clock size={18} />} label="Assessment Date" value={`${user.booking?.testDate ? new Date(user.booking.testDate).toLocaleDateString() : 'N/A'} (${user.booking?.testSlot || 'N/A'})`} />
                                    <div className="col-span-3">
                                        <InfoItem icon={<MapPin size={18} />} label="Address" value={formatAddress(user.address)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ASSESSMENT STAGES */}
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText className="text-emerald-600" /> Assessment Stages</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 1. KNOWLEDGE ASSESSMENT */}
                    <div className={`relative p-8 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${user.onlineAssessment?.isPassed ? 'border-emerald-100 bg-emerald-50/30' : user.onlineAssessment?.isAttempted ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
                        <div className="absolute top-6 right-6">
                            {user.onlineAssessment?.isPassed ? <CheckCircle className="text-emerald-500" /> : user.onlineAssessment?.isAttempted ? <XCircle className="text-red-500" /> : <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>}
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2 text-lg">Knowledge Assessment</h4>
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed">Multiple choice questions testing theoretical knowledge.</p>

                        {/* --- CORRECTED DATABASE LOGIC --- */}
                        {!user.onlineAssessment?.isAttempted ? (
                            canStartExam ? (
                                <button onClick={() => router.push('/quiz')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-200 mt-auto">
                                    Start Assessment
                                </button>
                            ) : (
                                <button disabled className="w-full py-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl font-bold text-sm cursor-not-allowed mt-auto flex justify-center gap-2">
                                    <Lock size={16} /> Locked (Check Date)
                                </button>
                            )
                        ) : (
                            <div className="space-y-3 mt-auto">
                                <div className="w-full py-2 bg-white border border-gray-100 rounded-xl font-bold text-sm text-center text-gray-600 shadow-sm">
                                    Score: {user.onlineAssessment?.score || 0} / 50
                                </div>
                                {user.onlineAssessment?.isPassed ? (
                                    <div className="w-full py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200">
                                        <CheckCircle size={16} /> PASSED
                                    </div>
                                ) : (
                                    <div className="w-full py-2.5 bg-red-100 text-red-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-200">
                                        <XCircle size={16} /> FAILED
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. SKILL ASSESSMENT */}
                    <div className={`relative p-8 rounded-2xl border shadow-sm transition-all 
                ${user.onlineAssessment?.isAttempted && !user.onlineAssessment?.isPassed
                            ? 'bg-red-50/50 border-red-100'
                            : !user.onlineAssessment?.isPassed
                                ? 'bg-white border-gray-100 opacity-60 grayscale-[0.5]'
                                : 'bg-white border-gray-100 hover:shadow-md'
                        }`}>

                        <div className="absolute top-6 right-6">
                            {user.offlineAssessment?.status === 'Approved' ? <CheckCircle className="text-emerald-500" /> : <Video size={20} className="text-gray-400" />}
                        </div>
                        <h4 className="font-bold mb-2 text-gray-800 text-lg">Skill Assessment</h4>
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                            Upload video evidence of your clinical skills.
                        </p>

                        {/* --- CORRECTED DATABASE LOGIC --- */}
                        {!user.onlineAssessment?.isPassed ? (
                            <button disabled className={`w-full py-3 border rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 mt-auto 
                        ${user.onlineAssessment?.isAttempted
                                    ? 'bg-red-50 text-red-500 border-red-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                {user.onlineAssessment?.isAttempted
                                    ? <><XCircle size={16} /> Not Eligible</>
                                    : <><Lock size={16} /> Locked</>}
                            </button>
                        ) : user.offlineAssessment?.status === 'Pending' ? (
                            <div className="w-full py-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl font-bold text-sm text-center mt-auto">
                                Status: Pending Evaluation
                            </div>
                        ) : user.offlineAssessment?.status === 'Not Started' || user.offlineAssessment?.status === 'Rejected' ? (
                            <button onClick={() => router.push('/upload')} className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition mt-auto shadow-lg shadow-sky-200">
                                {user.offlineAssessment?.status === 'Rejected' ? 'Re-Upload Evidence' : 'Upload Evidence'}
                            </button>
                        ) : (
                            <div className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-sm text-center mt-auto">
                                Status: {user.offlineAssessment?.status}
                            </div>
                        )}
                    </div>

                    {/* 3. CERTIFICATION */}
                    <div className={`relative p-8 rounded-2xl border bg-white shadow-sm transition-all ${!user.isCertified ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md border-emerald-100'}`}>
                        <h4 className="font-bold text-gray-800 mb-2 text-lg">Certification</h4>
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed">Download your verified UV Pro Certificate.</p>
                        {user.isCertified ? (
                            <button className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 mt-auto">
                                <Award size={18} /> Download
                            </button>
                        ) : (
                            <button disabled className="w-full py-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl font-bold text-sm cursor-not-allowed mt-auto flex items-center justify-center gap-2">
                                <Lock size={16} /> Not Yet Certified
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

const InfoItem = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="mt-0.5 text-emerald-500 bg-emerald-50 p-2 rounded-lg">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="font-bold text-gray-900 text-sm break-words">{value}</p>
        </div>
    </div>
);