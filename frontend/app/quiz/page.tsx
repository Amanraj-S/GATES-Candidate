'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck, AlertTriangle, Maximize, Clock, CheckCircle,
    Flag, AlertCircle, BookOpen, BrainCircuit, XCircle, Loader2, Lock, Key,
    FileText, CheckSquare, Circle
} from 'lucide-react';

// --- DATA DEFINITIONS ---

// 1. Knowledge Base (5 Unique Questions)
const knowledgeSource = [
    {
        text: "Which bevel type is most appropriate for intramuscular (IM) medication administration?",
        options: ["Short bevel", "Intradermal bevel", "Regular bevel", "Blunt bevel"],
        correct: [2], // c
        type: 'single'
    },
    {
        text: "What is the usual needle gauge range recommended for intramuscular medication administration in adults?",
        options: ["18–25 G", "26–30 G", "28–31 G", "29-32 G"],
        correct: [0], // a
        type: 'single'
    },
    {
        text: "The recommended needle insertion angle for intramuscular (IM) administration is:",
        options: ["5–15°", "15–30°", "45°", "90°"],
        correct: [3], // d
        type: 'single'
    },
    {
        text: "Which needle wall type provides a higher flow rate with finer gauges, useful for viscous IM medications?",
        options: ["Thick wall", "Regular wall", "Thin wall", "Ultra-thin wall"],
        correct: [2], // c
        type: 'single'
    },
    {
        text: "The length of the needle typically used for IM administration in adults is:",
        options: ["4–16 mm", "10–19 mm", "19–32 mm", "25–40 mm"],
        correct: [3], // d
        type: 'single'
    }
];

// 2. Attitude Base (5 Unique Scenarios)
const attitudeSource = [
    {
        text: "Scenario 1: A nurse prepares a patient for ID route medication administration. The patient appears anxious and repeatedly asks about discomfort. Which responses by the nurse are appropriate?",
        options: [
            "Explains the procedure clearly in simple language",
            "Proceeds quickly to finish before anxiety increases",
            "Maintains calm verbal and non-verbal communication",
            "Allows time for the patient to ask questions",
            "Ignores the concern to maintain workflow",
            "Ensures the patient is comfortably positioned"
        ],
        correct: [0, 2, 3, 5], // a, c, d, f
        type: 'multiple'
    },
    {
        text: "Scenario 2: While inspecting the site for ID route administration, the nurse notices mild swelling. Which actions should the nurse take?",
        options: [
            "Applies pressure and continues at the same site",
            "Selects an alternative appropriate site",
            "Explains the reason for changing the site",
            "Documents the site change",
            "Reduces the dose to compensate",
            "Reassesses the new site before proceeding"
        ],
        correct: [1, 2, 3, 5], // b, c, d, f
        type: 'multiple'
    },
    {
        text: "Scenario 3: A nurse cleans the skin for ID route of medication administration using an alcohol swab. The patient asks if the nurse can proceed immediately. Which actions reflect correct decision-making?",
        options: [
            "Wait for the antiseptic to air dry fully",
            "Explain why drying time is important",
            "Blow gently to speed up drying",
            "Proceed once the area feels slightly damp",
            "Maintain asepsis during the waiting period",
            "Observe the patient for discomfort"
        ],
        correct: [0, 1, 4, 5], // a, b, e, f
        type: 'multiple'
    },
    {
        text: "Scenario 4: The nurse observes visible dirt at the intended parenteral medication administration site. Which nursing actions are appropriate?",
        options: [
            "Clean with soap and water first",
            "Apply alcohol directly without washing",
            "Dry the area before antisepsis",
            "Use a fresh antiseptic swab",
            "Skip cleansing to avoid irritation",
            "Follow institutional protocol"
        ],
        correct: [0, 2, 3, 5], // a, c, d, f
        type: 'multiple'
    },
    {
        text: "Scenario 5: After cleaning the site, the nurse accidentally touches the area. What should the nurse do next?",
        options: [
            "Continue since gloves are worn",
            "Clean the site again with a new swab",
            "Allow the site to air dry completely",
            "Explain the reason for re-cleaning to the patient",
            "Cover the site with gauze and proceed",
            "Maintain aseptic technique throughout"
        ],
        correct: [1, 2, 3, 5], // b, c, d, f
        type: 'multiple'
    }
];

// 3. Generate Full Exam Data (30 Knowledge + 20 Attitude)
const questions = [
    // Repeat Knowledge questions 6 times (5 * 6 = 30)
    ...Array.from({ length: 6 }).flatMap((_, loopI) => 
        knowledgeSource.map((q, i) => ({
            ...q,
            id: loopI * 5 + i + 1,
            section: 'Knowledge'
        }))
    ),
    // Repeat Attitude questions 4 times (5 * 4 = 20)
    ...Array.from({ length: 4 }).flatMap((_, loopI) => 
        attitudeSource.map((q, i) => ({
            ...q,
            id: 30 + loopI * 5 + i + 1,
            section: 'Attitude'
        }))
    )
];

export default function SecureQuiz() {
    const router = useRouter();

    // --- REFS ---
    const warningsRef = useRef(0);
    const isSubmittingRef = useRef(false);
    const isFullScreenRef = useRef(false);
    // Answers are now arrays of numbers (to support multiple select)
    const answersRef = useRef<number[][]>(new Array(50).fill([]));
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // --- STATE ---
    const [isMounted, setIsMounted] = useState(false);
    
    // View State: 'AUTH' | 'BLOCKED' | 'INSTRUCTIONS' | 'EXAM' | 'RESULT'
    const [viewState, setViewState] = useState<'AUTH' | 'BLOCKED' | 'INSTRUCTIONS' | 'EXAM' | 'RESULT'>('AUTH');
    
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[][]>(new Array(50).fill([]));
    const [marked, setMarked] = useState<boolean[]>(new Array(50).fill(false));
    const [visited, setVisited] = useState<boolean[]>(new Array(50).fill(false));

    const [timeLeft, setTimeLeft] = useState(3600); // 60 mins total (30 + 30)
    const [warnings, setWarnings] = useState(0);

    // Result UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPassed, setIsPassed] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState(10);
    const [scoreDisplay, setScoreDisplay] = useState(0);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessKey, setAccessKey] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    // --- INITIALIZATION ---
    useEffect(() => {
        setIsMounted(true);
        fetch('http://localhost:5000/api/generate-key', { method: 'POST' })
            .catch(err => console.error("Failed to auto-generate key:", err));
    }, []);

    // --- AUTH HANDLER ---
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsAuthLoading(true);

        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch('http://localhost:5000/api/start-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, accessKey })
            });
            const data = await res.json();

            if (data.status === 'ok') {
                setIsAuthenticated(true);
                setViewState('BLOCKED'); // Next step: Fullscreen check
            } else {
                setAuthError(data.error || 'Authentication Failed');
            }
        } catch (err) {
            setAuthError('Connection Error. Please try again.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    // --- SYNC REFS ---
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // --- VISIT TRACKING ---
    useEffect(() => {
        setVisited(prev => {
            const newV = [...prev];
            if (!newV[currentQ]) {
                newV[currentQ] = true;
                return newV;
            }
            return prev;
        });
    }, [currentQ]);

    // --- SUBMIT LOGIC ---
    const handleSubmit = useCallback(async (auto = false) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        if (timerRef.current) clearInterval(timerRef.current);
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => { });

        // --- SCORING CALCULATION ---
        let totalScore = 0;
        
        questions.forEach((q, i) => {
            const userAns = answersRef.current[i]; // Array of selected indices
            
            if (q.type === 'single') {
                // Exact match (1 mark)
                if (userAns.length > 0 && userAns[0] === q.correct[0]) {
                    totalScore += 1;
                }
            } else {
                // Multiple select (0.25 mark per correct option)
                // No negative marking, so we just count how many selected options are in the correct array
                let qScore = 0;
                userAns.forEach(ansIndex => {
                    if (q.correct.includes(ansIndex)) {
                        qScore += 0.25;
                    }
                });
                totalScore += qScore;
            }
        });

        // 50 Questions. Knowledge(30) + Attitude(20 * 4 options * 0.25) = 30 + 20 = 50 Marks Total.
        // Passing is usually 50% or 70%. Let's keep your previous logic roughly.
        // Let's say Pass mark is 50% (25 marks).
        const passed = totalScore >= 25; 

        setIsPassed(passed);
        setScoreDisplay(totalScore);

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/submit-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-access-token': token || '' },
                body: JSON.stringify({ userId, score: totalScore, passed })
            });
            const data = await response.json();
            setViewState('RESULT');
        } catch (e) {
            console.error("Submit Error", e);
            setViewState('RESULT');
        }
    }, []);

    const submitRef = useRef(handleSubmit);
    useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

    // --- REDIRECT LOGIC (UPDATED) ---
    useEffect(() => {
        if (viewState === 'RESULT') {
            const timerId = setInterval(() => {
                setRedirectTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerId);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [viewState]);

    useEffect(() => {
        if (viewState === 'RESULT' && redirectTimer === 0) {
            router.push('/dashboard');
        }
    }, [viewState, redirectTimer, router]);

    // --- FULLSCREEN LOGIC ---
    const requestFullScreen = () => {
        const el = document.documentElement as any;
        const requestMethod = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;

        if (requestMethod) {
            requestMethod.call(el)
                .then(() => {
                    isFullScreenRef.current = true;
                    // Move to Instructions instead of Exam directly
                    setViewState('INSTRUCTIONS'); 
                })
                .catch((err: any) => alert(`Error: ${err.message}`));
        }
    };

    // --- PROCTORING LISTENERS ---
    useEffect(() => {
        if (!isMounted || viewState === 'RESULT' || viewState === 'AUTH') return;

        const handleFullScreenChange = () => {
            if (isSubmittingRef.current) return;
            const isNowFullScreen = !!document.fullscreenElement;

            if (!isNowFullScreen && isFullScreenRef.current) {
                isFullScreenRef.current = false;
                setViewState('BLOCKED'); // Go back to blocked screen
                warningsRef.current += 1;
                setWarnings(warningsRef.current);

                if (warningsRef.current >= 3) {
                    submitRef.current(true);
                } else {
                    alert(`Warning ${warningsRef.current}/3: You exited Fullscreen mode!`);
                }
            } else if (isNowFullScreen) {
                isFullScreenRef.current = true;
                // If we were blocked, we check where we should go
                if (viewState === 'BLOCKED') setViewState('INSTRUCTIONS'); 
            }
        };

        const handleVisibilityChange = () => {
            if (!isFullScreenRef.current || isSubmittingRef.current) return;
            if (document.hidden) {
                warningsRef.current += 1;
                setWarnings(warningsRef.current);
                if (warningsRef.current >= 3) {
                    submitRef.current(true);
                } else {
                    alert(`Warning ${warningsRef.current}/3: Tab Switching is Prohibited!`);
                }
            }
        };

        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [isMounted, viewState]);

    // --- TIMER ---
    useEffect(() => {
        if (viewState === 'EXAM' && !isSubmitting) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        submitRef.current(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [viewState, isSubmitting]);

    // --- ANSWER HANDLER (Single & Multi Support) ---
    const handleAnswerSelect = (optionIndex: number) => {
        const type = questions[currentQ].type;
        const currentAns = [...answers];
        
        if (type === 'single') {
            currentAns[currentQ] = [optionIndex];
        } else {
            // Toggle Logic for Multi-select
            const existing = currentAns[currentQ];
            if (existing.includes(optionIndex)) {
                currentAns[currentQ] = existing.filter(i => i !== optionIndex);
            } else {
                currentAns[currentQ] = [...existing, optionIndex].sort(); // Keep sorted
            }
        }
        setAnswers(currentAns);
    };

    if (!isMounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#064E3B]" size={40} /></div>;

    // ================= VIEWS =================

    // 1. RESULT VIEW
    if (viewState === 'RESULT') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 text-center relative">
                    <div className={`h-32 w-full flex items-center justify-center ${isPassed ? 'bg-emerald-600' : 'bg-red-600'}`}>
                        <div className="bg-white p-4 rounded-full shadow-lg">
                            {isPassed ? <CheckCircle size={64} className="text-emerald-600" /> : <XCircle size={64} className="text-red-600" />}
                        </div>
                    </div>
                    <div className="p-10">
                        <h1 className={`text-3xl font-black mb-2 ${isPassed ? 'text-emerald-800' : 'text-red-800'}`}>
                            {isPassed ? 'ASSESSMENT PASSED' : 'ASSESSMENT FAILED'}
                        </h1>
                        <p className="text-gray-500 font-medium mb-4">
                            Score: {scoreDisplay} / 50
                        </p>
                        <p className="text-gray-500 font-medium mb-8">
                            {isPassed ? 'Your results have been recorded securely.' : 'You did not meet the required score criteria.'}
                        </p>
                        <div className="animate-pulse flex flex-col items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                            <Loader2 className="animate-spin" size={20} />
                            Redirecting to dashboard in {redirectTimer}s...
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 2. AUTH VIEW
    if (viewState === 'AUTH') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-emerald-600 p-6 text-center">
                        <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Secure Exam Login</h1>
                        <p className="text-emerald-100 text-sm mt-1">Authorized Personnel Only</p>
                    </div>
                    <div className="p-8">
                        {authError && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {authError}
                            </div>
                        )}
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Access Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input type="text" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-mono text-lg tracking-widest" placeholder="Enter 6-digit Key" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="Enter your password" required />
                                </div>
                            </div>
                            <button type="submit" disabled={isAuthLoading} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
                                {isAuthLoading ? <Loader2 className="animate-spin" /> : 'Start Web Protected Exam'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 3. BLOCKED/FULLSCREEN PROMPT VIEW
    if (viewState === 'BLOCKED') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white font-sans">
                <div className="text-center p-10 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-lg mx-4">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Secure Exam Environment</h1>
                    <p className="text-gray-400 mb-8">Fullscreen Mode is Required. <br /> <span className="text-red-400 font-bold">3 Warnings = Automatic Fail.</span></p>
                    <button onClick={requestFullScreen} className="w-full bg-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                        <Maximize size={20} /> Enter Fullscreen to Start
                    </button>
                </div>
            </div>
        );
    }

    // 4. INSTRUCTIONS VIEW (New!)
    if (viewState === 'INSTRUCTIONS') {
        return (
            <div className="h-screen bg-white font-sans overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Examination Instructions</h1>
                        <p className="text-gray-500">Please read carefully before proceeding.</p>
                    </div>

                    <div className="space-y-8">
                        {/* KNOWLEDGE INSTRUCTIONS */}
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-4">
                                <BookOpen className="text-blue-600" /> KNOWLEDGE TESTING
                            </h2>
                            <ul className="space-y-2 text-blue-800 text-sm font-medium">
                                <li><strong>Objective:</strong> To assess theoretical understanding of safe parenteral medication practices, principles of asepsis, medication rights, and patient safety.</li>
                                <li><strong>Format:</strong> 30 Multiple Choice Questions (MCQs).</li>
                                <li><strong>Scoring:</strong> Each question carries 1 mark. No negative marking.</li>
                                <li><strong>Type:</strong> Single-best answer type.</li>
                                <li><strong>Instructions:</strong> Read carefully, select the most appropriate answer (a, b, c, or d). Once submitted, answers cannot be changed.</li>
                            </ul>
                        </div>

                        {/* ATTITUDE INSTRUCTIONS */}
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                            <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2 mb-4">
                                <BrainCircuit className="text-purple-600" /> ATTITUDE TESTING
                            </h2>
                            <ul className="space-y-2 text-purple-800 text-sm font-medium">
                                <li><strong>Objective:</strong> To assess situational judgement and behavioral application of safety protocols.</li>
                                <li><strong>Format:</strong> 20 Multiple Choice Questions.</li>
                                <li><strong>Scoring:</strong> Each question carries 1 mark (0.25 mark for each correct selection). No negative marking.</li>
                                <li><strong>Type:</strong> Multiple-select answers.</li>
                                <li><strong>Instructions:</strong> Choose the most <strong>FOUR</strong> appropriate answers from the given options.</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-sm text-center font-bold">
                            ⚠️ Warning: Do not refresh or close the screen. 3 violations of fullscreen mode will result in automatic termination.
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button 
                            onClick={() => setViewState('EXAM')}
                            className="bg-gray-900 text-white text-lg font-bold px-12 py-4 rounded-xl hover:bg-black shadow-xl transform transition-all hover:-translate-y-1 flex items-center gap-2"
                        >
                            <FileText size={20} /> I Understand, Start Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 5. EXAM INTERFACE (viewState === 'EXAM')
    const q = questions[currentQ];
    const isMulti = q.type === 'multiple';

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] font-sans overflow-hidden select-none">
            {/* SIDEBAR */}
            <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        <Clock size={16} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                    <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
                        <AlertCircle size={14} className={warnings > 0 ? "text-red-500" : "text-gray-300"} />
                        <span className={warnings > 0 ? "text-red-500" : ""}>{warnings}/3 Warnings</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* PORTION 1: KNOWLEDGE */}
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1">
                            <BookOpen size={10} /> Knowledge Assessment (1-30)
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.slice(0, 30).map((q, i) => {
                                let color = "bg-white border-gray-200 text-gray-600 hover:border-emerald-400";
                                if (marked[i]) color = "bg-blue-100 border-blue-300 text-blue-700";
                                else if (answers[i].length > 0) color = "bg-emerald-600 border-emerald-600 text-white";
                                else if (visited[i] && answers[i].length === 0 && i !== currentQ) color = "bg-red-50 border-red-200 text-red-500 hover:bg-red-100";

                                return (
                                    <button key={q.id} onClick={() => setCurrentQ(i)} className={`h-9 w-full rounded border font-bold text-xs transition-all flex items-center justify-center ${color} ${currentQ === i ? 'ring-2 ring-emerald-500 ring-offset-1 z-10' : ''}`}>{i + 1}</button>
                                )
                            })}
                        </div>
                    </div>

                    {/* PORTION 2: ATTITUDE */}
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1">
                            <BrainCircuit size={10} /> Attitude Assessment (31-50)
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.slice(30, 50).map((q, idx) => {
                                const i = idx + 30;
                                let color = "bg-white border-gray-200 text-gray-600 hover:border-emerald-400";
                                if (marked[i]) color = "bg-blue-100 border-blue-300 text-blue-700";
                                else if (answers[i].length > 0) color = "bg-purple-600 border-purple-600 text-white";
                                else if (visited[i] && answers[i].length === 0 && i !== currentQ) color = "bg-red-50 border-red-200 text-red-500 hover:bg-red-100";

                                return (
                                    <button key={q.id} onClick={() => setCurrentQ(i)} className={`h-9 w-full rounded border font-bold text-xs transition-all flex items-center justify-center ${color} ${currentQ === i ? 'ring-2 ring-emerald-500 ring-offset-1 z-10' : ''}`}>{i + 1}</button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Submit Assessment</>}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f1f5f9]">
                <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32">
                    <div className="max-w-4xl mx-auto">
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mb-8 overflow-hidden">
                            <div className={`h-full transition-all duration-500 ease-out ${currentQ < 30 ? 'bg-emerald-600' : 'bg-purple-600'}`} style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex flex-col">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 w-fit ${currentQ < 30 ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                                        {q.section} Section
                                    </span>
                                    <span className="text-gray-400 font-bold text-sm">Question {currentQ + 1} / 50</span>
                                </div>
                                <button onClick={() => { const m = [...marked]; m[currentQ] = !m[currentQ]; setMarked(m) }} className={`flex gap-2 items-center text-xs font-bold px-4 py-2 rounded-full transition-colors ${marked[currentQ] ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    <Flag size={14} /> {marked[currentQ] ? 'Marked for Review' : 'Mark for Review'}
                                </button>
                            </div>

                            <h2 className="text-xl md:text-2xl font-medium text-gray-800 leading-tight mb-4">{q.text}</h2>
                            
                            {isMulti && <p className="text-sm text-purple-600 font-bold mb-6 flex items-center gap-1"><CheckSquare size={16}/> Select ALL that apply (Choose 4)</p>}

                            <div className="space-y-4">
                                {q.options.map((opt, idx) => {
                                    const isSelected = answers[currentQ].includes(idx);
                                    let activeClass = isMulti 
                                        ? (isSelected ? 'border-purple-600 bg-purple-50 shadow-inner' : 'border-gray-100 hover:border-gray-300')
                                        : (isSelected ? 'border-emerald-600 bg-emerald-50 shadow-inner' : 'border-gray-100 hover:border-gray-300');

                                    return (
                                        <label key={idx} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all group ${activeClass}`}>
                                            <input 
                                                type={isMulti ? "checkbox" : "radio"} 
                                                name={`q-${currentQ}`} 
                                                className="hidden" 
                                                checked={isSelected}
                                                onChange={() => handleAnswerSelect(idx)}
                                            />
                                            <div className={`w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? (isMulti ? 'border-purple-600 bg-purple-600' : 'border-emerald-600 bg-emerald-600') : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                            <span className={`text-lg ${isSelected ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{opt}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-200 p-6 absolute bottom-0 w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <button disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)} className="px-8 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all">Previous</button>
                        {currentQ < questions.length - 1 ? (
                            <button onClick={() => setCurrentQ(p => p + 1)} className="px-10 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5">Next Question</button>
                        ) : (
                            <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="px-10 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Finish Test</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}