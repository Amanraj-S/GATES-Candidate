'use client';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ArrowRight, Target, Globe, Heart,
  Users, Calendar, Award, Lock, MapPin, Briefcase, CheckCircle
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  // --- MOCK DATA FOR UI ---
  const teamMembers = [
    { name: "Dr. Sarah Johnson", role: "Chief Medical Officer", initials: "SJ" },
    { name: "Prof. Alan Smith", role: "Assessment Director", initials: "AS" },
    { name: "Emily Davis", role: "Operations Head", initials: "ED" },
    { name: "Michael Chen", role: "Technical Lead", initials: "MC" }
  ];

  const partners = [
    "Global Health Initiative", "MediCorp Funding", "EduTech Ventures", "Nursing Council Alliance"
  ];

  const placements = [
    { name: "Anitha R.", country: "United Kingdom", hospital: "NHS Trust", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Rahul V.", country: "Canada", hospital: "Toronto General", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Priya S.", country: "Australia", hospital: "Royal Melbourne", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "John D.", country: "Ireland", hospital: "St. James Hospital", img: "https://randomuser.me/api/portraits/men/85.jpg" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">

      {/* ================= 1. NAVBAR ================= */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md text-gray-800 shadow-sm border-b border-emerald-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="bg-emerald-100 p-2 rounded-xl group-hover:bg-emerald-200 transition">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-emerald-900">INCTC</span>
          </div>
          <div className="flex items-center gap-4">
            {/* LOGIN BUTTON */}
            <button
              onClick={() => router.push('/login')}
              className="text-gray-600 hover:text-emerald-600 font-bold transition px-4 py-2 hover:bg-emerald-50 rounded-lg"
            >
              Log In
            </button>
            <button
              onClick={() => router.push('/hub')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-200 transition transform hover:scale-105 flex items-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= 2. HERO SECTION ================= */}
      <div className="pt-32 pb-24 bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fadeIn">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase mb-2">
              International Nursing Competency Testing Centre(INCTC)
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-gray-900">
              Excellence in <br /> <span className="text-emerald-600">Clinical Nursing.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Setting the global benchmark for healthcare competency. Verified skills, trusted professionals, safer patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/hub')}
                className="bg-emerald-600 text-white text-lg px-8 py-4 rounded-full font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                Explore Certification <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl"></div>

            <div className="relative w-96 h-96 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-100 animate-float border border-emerald-50">
              <ShieldCheck size={120} className="text-emerald-500 drop-shadow-lg" />

              {/* Floating badges */}
              <div className="absolute top-10 right-0 bg-white p-3 rounded-xl shadow-lg border border-gray-50 flex items-center gap-2 animate-bounce-slow">
                <CheckCircle className="text-sky-500" size={20} />
                <span className="text-xs font-bold text-gray-700">Verified Skills</span>
              </div>
              <div className="absolute bottom-10 left-0 bg-white p-3 rounded-xl shadow-lg border border-gray-50 flex items-center gap-2 animate-bounce-slow delay-700">
                <Globe className="text-emerald-500" size={20} />
                <span className="text-xs font-bold text-gray-700">Global Standard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. MISSION, VISION, MOTTO ================= */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Our Core Foundation</h2>
            <p className="text-gray-500 text-lg">Driven by a commitment to healthcare excellence and patient safety.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vision */}
            <div className="bg-sky-50 text-center p-10 rounded-3xl border border-sky-100 hover:shadow-xl hover:shadow-sky-100 transition-all group hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-sky-500 shadow-sm mx-auto group-hover:scale-110 transition">
                <Globe size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                To become the world's most trusted verification body for clinical nursing procedures, ensuring every patient receives care from a certified expert.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-emerald-50 text-center p-10 rounded-3xl border border-emerald-100 hover:shadow-xl hover:shadow-emerald-100 transition-all group hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-emerald-500 shadow-sm mx-auto group-hover:scale-110 transition">
                <Target size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                To empower healthcare professionals through rigorous, technology-driven assessment protocols that validate skills in IM, IV, ID, and SC injections.
              </p>
            </div>

            {/* Motto */}
            <div className="bg-red-50 text-center p-10 rounded-3xl border border-red-100 hover:shadow-xl hover:shadow-red-100 transition-all group hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-red-500 shadow-sm mx-auto group-hover:scale-110 transition">
                <Heart size={36} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Motto</h3>
              <p className="text-gray-600 leading-relaxed font-serif italic text-lg px-4">
                "Precision in Practice, Safety in Care."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. TEAM SECTION ================= */}
      <div className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group bg-white p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                  {member.initials}
                </div>
                <h4 className="font-bold text-lg text-gray-800">{member.name}</h4>
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 5. FUNDING PARTNERS ================= */}
      <div className="py-16 bg-sky-50 border-y border-sky-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-xs font-bold text-sky-800 uppercase tracking-widest mb-8">Supported By Our Funding Partners</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {partners.map((partner, i) => (
              <span key={i} className="text-lg font-bold text-slate-400 hover:text-sky-700 cursor-default">{partner}</span>
            ))}
          </div>
        </div>
      </div>



      {/* ================= 8. PLACEMENT COMPLETED SECTION ================= */}
      <div className="py-24 bg-white relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4 text-gray-900">Global Placements</h2>
            <p className="text-gray-500">Our certified professionals are making an impact worldwide.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {placements.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all group">
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img src={p.img} alt={p.name} className="w-full h-48 object-cover group-hover:scale-110 transition duration-500 grayscale group-hover:grayscale-0" />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">HIRED</div>
                </div>
                <h4 className="font-bold text-lg text-gray-800">{p.name}</h4>
                <p className="text-emerald-600 text-sm font-bold">{p.country}</p>
                <p className="text-gray-400 text-xs flex items-center gap-1 mt-1"><Briefcase size={12} /> {p.hospital}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 7. CANDIDATE PLACEMENT STATUS ================= */}
      <div className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidate Placement Status</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              This section contains sensitive placement data. Access is strictly restricted to authorized Employers and the respective Candidates.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                Login to View Status <ArrowRight size={18} />
              </button>
            </div>
            <p className="mt-4 text-xs text-emerald-600/60 font-medium flex justify-center items-center gap-1">
              <ShieldCheck size={12} /> Secure HTTPS Access Required
            </p>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center border-t border-gray-800">
        <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
          <ShieldCheck size={20} />
          <span className="font-bold text-lg">INCTC</span>
        </div>
        <p className="text-sm">&copy; 2026 INCTC. All rights reserved.</p>
      </footer>
    </div>
  );
}