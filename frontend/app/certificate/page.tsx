'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from "react-qr-code";
import { Download, ArrowLeft, FileText, Award, User, ShieldCheck } from 'lucide-react';

// --- HELPER: ROBUST DRIVE IMAGE LINK ---
const formatDriveLink = (url: string) => {
    if (!url) return '';
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
    return url;
};

// --- MOCK PACKAGES DATA ---
const MOCK_PACKAGES = [
    { id: 1, name: "Parenteral Medication (IM, IV, ID, SC)", quiz: 42, skill: 88, max: 150 },
    { id: 2, name: "IV Infusion Therapy", quiz: 40, skill: 90, max: 150 },
    { id: 3, name: "Urinary Catheterization", quiz: 45, skill: 92, max: 150 },
    { id: 4, name: "Health Assessment", quiz: 38, skill: 85, max: 150 },
    { id: 5, name: "Oral Medication Administration", quiz: 48, skill: 95, max: 150 },
    { id: 6, name: "NG Tube Placement", quiz: 41, skill: 89, max: 150 },
    { id: 7, name: "Wound Dressing & Care", quiz: 44, skill: 91, max: 150 },
];

const INITIAL_USER_STATE = {
    fullName: "Loading...",
    gender: "N/A",
    dob: null,
    paymentRefId: "PENDING",
    photo: "",
};

export default function CertificatePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(INITIAL_USER_STATE);
    const [baseUrl, setBaseUrl] = useState("https://inctc.org");
    const [packages, setPackages] = useState<any[]>([]);
    const [cgpa, setCgpa] = useState("0.0");

    // --- FETCH DATA ---
useEffect(() => {
    if (typeof window !== 'undefined') {
        setBaseUrl(window.location.origin);
    }

    const token = localStorage.getItem('token');
    if (token) {
        fetch('http://localhost:5000/api/dashboard', {
            headers: { 'x-access-token': token }
        })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                const u = data.user;
                setUser((prev: any) => ({
                    ...prev,
                    fullName: u.fullName || prev.fullName,
                    gender: u.gender || prev.gender,
                    dob: u.dob || prev.dob,
                    paymentRefId: u.booking?.paymentRefId || prev.paymentRefId,
                    photo: formatDriveLink(u.documents?.photo) || prev.photo,
                    // ADD THIS LINE TO FETCH RNM NUMBER
                    rnmNumber: u.profession?.rnmNumber || "N/A" 
                }));

                let totalPoints = 0;
                const processedPackages = MOCK_PACKAGES.map(pkg => {
                    const total = pkg.quiz + pkg.skill;
                    const gpa = ((total / pkg.max) * 10).toFixed(1);
                    totalPoints += parseFloat(gpa);
                    return { ...pkg, gpa };
                });
                
                setPackages(processedPackages);
                setCgpa((totalPoints / 7).toFixed(1));
            }
        })
        .catch(err => console.error("Data fetch error"));
    }
}, []);

    // --- FORMAT DOB ---
    const formatDOB = (dobString: any) => {
        if (!dobString) return "N/A";
        return new Date(dobString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* =====================================================================================
                VIEW 1: SCREEN ONLY (Report Card Dashboard)
            ===================================================================================== */}
            <div className="print:hidden max-w-6xl mx-auto p-8">

                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    <div className="bg-[#064E3B] p-8 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black flex items-center gap-3 uppercase tracking-wide">
                                <FileText /> Nursing Competency Testing Score Card
                            </h1>
                            <p className="text-emerald-100 mt-1 opacity-80">Official Candidate Performance Record</p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="bg-white text-[#064E3B] px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg transform hover:scale-105"
                        >
                            <Download size={20} /> Download Certificate
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Profile Section */}
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10 pb-10 border-b border-gray-100 relative">
                            
                            {/* Photo */}
                            <div className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-sm overflow-hidden shrink-0 bg-gray-50 relative">
                                {user.photo ? (
                                    <img src={user.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (<div className="w-full h-full flex items-center justify-center text-gray-300"><User size={40} /></div>)}
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate Name</p>
                                    <p className="text-xl font-bold text-gray-800">{user.fullName}</p>
                                </div>
                            <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nursing Reg. No</p>
                                    <p className="text-xl font-mono font-bold text-gray-800">{user.rnmNumber}</p>
                            </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date of Birth</p>
                                    <p className="text-xl font-bold text-gray-800">{formatDOB(user.dob)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</p>
                                    <p className="text-xl font-bold text-gray-800">{user.gender}</p>
                                </div>
                            </div>

                            {/* DASHBOARD QR */}
                            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                <QRCode value={`${baseUrl}/verify/${user.paymentRefId}`} size={70} fgColor="#000000" />
                                <span className="text-[9px] uppercase font-bold text-gray-400 mt-1">Verify</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Award className="text-[#064E3B]" size={20} /> Detailed Package Scorecard
                        </h3>

                        {/* SCREEN TABLE */}
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4 border-b border-gray-200 w-1/3">Package / Module Name</th>
                                        <th className="p-4 border-b border-gray-200 text-center">Knowledge & Attitude</th>
                                        <th className="p-4 border-b border-gray-200 text-center">Skill Testing</th>
                                        <th className="p-4 border-b border-gray-200 text-center">Package GPA (10.0)</th>
                                        <th className="p-4 border-b border-gray-200 text-center">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 font-medium divide-y divide-gray-100">
                                    {packages.map((pkg, idx) => (
                                        <tr key={idx}>
                                            <td className="p-4 font-bold text-gray-800">{pkg.name}</td>
                                            <td className="p-4 text-center">{pkg.quiz}</td>
                                            <td className="p-4 text-center">{pkg.skill}</td>
                                            <td className="p-4 text-center font-bold text-[#064E3B]">{pkg.gpa}</td>
                                            <td className="p-4 text-center text-emerald-600 font-bold">PASS</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[#064E3B] text-white">
                                        <td colSpan={3} className="p-4 font-bold text-right uppercase tracking-wider">Cumulative GPA (CGPA)</td>
                                        <td className="p-4 text-center font-black text-xl bg-[#043E2F]">{cgpa}</td>
                                        <td className="p-4 bg-[#043E2F]"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            {/* =====================================================================================
                VIEW 2: PRINT ONLY (Formal Certificate)
            ===================================================================================== */}
            <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:w-full print:h-screen bg-white text-gray-800">

                {/* A4 Landscape Fixed Container */}
                <div className="relative w-[297mm] h-[210mm] border-[20px] border-double border-[#064E3B] p-8 box-border overflow-hidden bg-white shadow-2xl flex flex-col justify-between">

                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                        style={{ backgroundImage: 'radial-gradient(circle, #064E3B 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>

                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-[40px] border-l-[40px] border-[#C5A059] z-10"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[40px] border-r-[40px] border-[#C5A059] z-10"></div>

                    {/* --- 1. HEADER SECTION --- */}
                    <div className="text-center mt-2 relative z-20">
                        
                        <div className="flex justify-center mb-1">
                            <ShieldCheck size={40} className="text-[#064E3B]" />
                        </div>
                        <h1 className="text-3xl font-black text-[#064E3B] uppercase tracking-widest leading-none mb-1">
                            International Nursing Competency<br />Testing Center
                        </h1>
                        <div className="inline-block border-t border-b border-[#C5A059] py-1 px-4 mt-1">
                            <p className="text-[10px] font-bold text-[#C5A059] tracking-[0.3em] uppercase">Global Standards in Nursing Excellence</p>
                        </div>

                        <div className="mt-4 mb-2">
                            <h2 className="text-5xl font-serif font-bold text-[#064E3B] uppercase tracking-wide">
                                CERTIFICATE OF COMPETENCY TESTING
                            </h2>
                        </div>

                        {/* TOP RIGHT QR CODE */}
                        <div className="absolute top-0 right-0 flex flex-col items-center z-50">
                            <div className="border border-black p-1 bg-white">
                                <QRCode value={`${baseUrl}/verify/${user.paymentRefId}`} size={60} fgColor="#000000" />
                            </div>
                            <p className="text-[8px] font-bold text-black mt-0.5 uppercase tracking-wide">View Test Details</p>
                        </div>
                    </div>

                    {/* --- 2. CANDIDATE INFO SECTION --- */}
                    <div className="flex-1 flex flex-col items-center justify-start relative z-20 mt-2 px-8">

                        <div className="flex items-center gap-6 w-full max-w-5xl mb-3">
                            {/* Photo */}
                            <div className="w-24 h-24 border-[3px] border-[#C5A059] shadow-lg shrink-0 bg-gray-100 relative">
                                {user.photo ? (
                                    <img src={user.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={40} /></div>}
                            </div>

                            <div className="text-left flex-1">
                                <p className="text-lg text-gray-500 mb-0 font-serif italic">This is to certify that</p>
                                <h3 className="text-4xl font-serif font-bold text-gray-900 mb-1">{user.fullName}</h3>

                                {/* MOVED DATE OF ISSUE HERE */}
                                <div className="flex gap-6 text-[11px] font-bold text-gray-600 mb-2 uppercase tracking-wide border-b border-gray-200 pb-2">
                                    <span><span className="text-[#C5A059]">Reg No:</span> {user.paymentRefId}</span>
                                    <span><span className="text-[#C5A059]">Sex:</span> {user.gender}</span>
                                    <span><span className="text-[#C5A059]">DOB:</span> {formatDOB(user.dob)}</span>
                                    <span><span className="text-[#C5A059]">Date of Issue:</span> {new Date().toLocaleDateString('en-GB')}</span>
                                </div>

                                <p className="text-sm text-gray-700 leading-tight font-medium">
                                    Has successfully completed the <strong>nursing competency testing on selected packages</strong> listed below<br />
                                    and secured a cumulative <strong className="text-[#064E3B]">CGPA of {cgpa}</strong> on a 10.0 scale.
                                </p>
                            </div>
                        </div>

                        {/* --- 3. TABLE --- */}
                        <div className="w-full max-w-5xl border border-[#064E3B] text-[10px]">
                            <table className="w-full text-left">
                                <thead className="bg-[#064E3B] text-white uppercase font-bold text-[9px]">
                                    <tr>
                                        <th className="p-1 pl-2 w-[40%]">Package Name</th>
                                        <th className="p-1 text-center">Knowledge/Attitude</th>
                                        <th className="p-1 text-center">Skill Testing</th>
                                        <th className="p-1 text-center">GPA</th>
                                        <th className="p-1 text-center">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-900 font-bold">
                                    {packages.map((pkg, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="p-1 pl-2 border-r border-gray-200 truncate">{pkg.name}</td>
                                            <td className="p-1 text-center border-r border-gray-200">{pkg.quiz}</td>
                                            <td className="p-1 text-center border-r border-gray-200">{pkg.skill}</td>
                                            <td className="p-1 text-center text-[#064E3B] border-r border-gray-200">{pkg.gpa}</td>
                                            <td className="p-1 text-center text-emerald-700">PASS</td>
                                        </tr>
                                    ))}
                                    {/* CGPA ROW with GREEN BACKGROUND */}
                                    <tr className="bg-[#064E3B] text-white border-t-2 border-[#064E3B]">
                                        <td colSpan={3} className="p-1 text-right font-black pr-4 tracking-wider">CUMULATIVE GPA (CGPA)</td>
                                        <td className="p-1 text-center font-black text-sm">{cgpa}</td>
                                        <td className="p-1"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- 4. FOOTER SECTION (Signatures + Logos) --- */}
                    <div className="flex justify-between items-end px-8 pb-6 w-full relative z-50 mt-1">

                        {/* LEFT: ADMINISTRATOR SIGNATURE */}
                        <div className="text-center relative z-50 pb-2">
                            <p className="font-serif text-2xl text-[#064E3B] font-bold leading-none mb-1">Dr. Ponnambily</p>
                            <div className="w-48 h-px bg-gray-800 mx-auto mb-1"></div>
                            <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">Administrator</p>
                        </div>

                        {/* RIGHT: 3 LOGOS NEATLY ALIGNED */}
                        <div className="flex items-center gap-10 relative z-50">
                            
                            {/* Logo 1: INCTC */}
                            <div className="flex flex-col items-center">
                                <div className="h-10 w-10 bg-[#064E3B] rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">INCTC</div>
                                <span className="text-[8px] font-bold text-gray-500">INCTC</span>
                            </div>

                            {/* Logo 2: INC */}
                            <div className="flex flex-col items-center">
                                <img src="https://upload.wikimedia.org/wikipedia/en/b/b0/Indian_Nursing_Council_Logo.png" alt="INC" className="h-12 w-auto object-contain mb-1" />
                                <span className="text-[8px] font-bold text-gray-500">INC</span>
                            </div>

                            {/* Logo 3: Jhpiego */}
                            <div className="flex flex-col items-center mr-16">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Jhpiego_Logo_Digital_Copy.jpg" alt="Jhpiego" className="h-10 w-auto object-contain mb-1" />
                                <span className="text-[8px] font-bold text-gray-500">Jhpiego</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { background: white; -webkit-print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}