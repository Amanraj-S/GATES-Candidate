'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Calendar, CreditCard, Upload, CheckCircle, Download, User, Briefcase, File, AlertTriangle, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- HELPER: Deep Value Access ---
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, i) => (o ? o[i] : ''), obj);
};

// --- HELPER: Generate Valid 3-Day Slots (1st & 3rd Weeks) ---
const getValidExamSlots = () => {
  const options = [];
  const today = new Date();
  const monthsToGenerate = 6; // Look ahead 6 months

  // Start from current month
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  for (let i = 0; i < monthsToGenerate; i++) {
    // 1. Find the 1st Monday of the month
    let firstMonday = new Date(currentMonth);
    while (firstMonday.getDay() !== 1) { // 0=Sun, 1=Mon
      firstMonday.setDate(firstMonday.getDate() + 1);
    }

    // 2. Find the 3rd Monday (1st Monday + 14 days)
    let thirdMonday = new Date(firstMonday);
    thirdMonday.setDate(firstMonday.getDate() + 14);

    // Format Helper
    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const getWed = (d: Date) => {
      const w = new Date(d);
      w.setDate(d.getDate() + 2); // Mon + 2 = Wed
      return w;
    };

    // Add 1st Week Option if it's in the future
    if (firstMonday >= today) {
      options.push({
        value: firstMonday.toISOString().split('T')[0],
        label: `${formatDate(firstMonday)} - ${formatDate(getWed(firstMonday))} ${firstMonday.getFullYear()} (1st Week Block)`,
        weekType: '1st Week'
      });
    }

    // Add 3rd Week Option if it's in the future
    if (thirdMonday >= today) {
      options.push({
        value: thirdMonday.toISOString().split('T')[0],
        label: `${formatDate(thirdMonday)} - ${formatDate(getWed(thirdMonday))} ${thirdMonday.getFullYear()} (3rd Week Block)`,
        weekType: '3rd Week'
      });
    }

    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  return options;
};

// --- COMPONENT 1: INPUT FIELD ---
const Input = ({ label, path, type = "text", required = false, options = null, disabled = false, min, form, updateForm }: any) => {
  const value = getNestedValue(form, path);
  return (
    <div>
      <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          disabled={disabled}
          className="w-full p-3 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          value={value}
          onChange={e => updateForm(path, e.target.value)}
        >
          {/* Placeholder for Select */}
          <option value="" disabled>-- Select Option --</option>
          {options.map((opt: any) => (
            typeof opt === 'string' ?
              <option key={opt} value={opt}>{opt}</option> :
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          disabled={disabled}
          type={type}
          min={min}
          className={`w-full p-3 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
          value={value}
          onChange={e => updateForm(path, e.target.value)}
          required={required}
        />
      )}
    </div>
  );
};

// --- COMPONENT 2: FILE UPLOAD ---
const FileUpload = ({ label, fieldKey, required = false, form, previews, handleFileChange }: any) => {
  const preview = previews[fieldKey as keyof typeof previews];
  const hasFile = !!form.documents[fieldKey as keyof typeof form.documents];

  return (
    <div className="border p-5 rounded-xl bg-white hover:bg-gray-50 transition-colors border-dashed border-gray-300 hover:border-emerald-400 group">
      <label className="text-sm font-bold text-gray-700 mb-3 block group-hover:text-emerald-700 transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-emerald-50 border border-emerald-100 rounded-lg py-2.5 px-4 flex items-center gap-2 hover:bg-emerald-100 text-emerald-700 font-bold transition-all shadow-sm">
          <Upload size={16} />
          <span className="text-xs uppercase tracking-wide">Select File</span>
          <input type="file" className="hidden" accept=".jpg,.png,.pdf" onChange={e => e.target.files && handleFileChange(e.target.files[0], fieldKey)} />
        </label>

        {hasFile ? (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 animate-fadeIn">
            <CheckCircle size={12} /> {preview === 'PDF Icon' ? 'PDF Ready' : 'Image Ready'}
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Max 2MB</span>
        )}
      </div>

      {preview && preview !== 'PDF Icon' && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="h-24 w-auto rounded-lg border border-gray-200 shadow-sm object-cover" />
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Register() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // NEW: To handle initial fetch
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false); // NEW: Track status
  const [validDates, setValidDates] = useState<any[]>([]);

  // Initial Form State
  const [form, setForm] = useState({
    userId: '',
    email: '', password: '', confirmPassword: '',
    fullName: '', dob: '', gender: 'Female', nationality: 'Indian', maritalStatus: 'Single',
    mobile: '', altMobile: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    education: {
      ug: { degree: '', institution: '', yearOfPassing: '' },
      pg: { degree: '', institution: '', yearOfPassing: '' }
    },
    profession: { rnmNumber: '', rnmState: '', specialty: 'General', experienceYears: 0, interestedCountries: [] as string[] },
    ielts: { taken: false, testType: 'IELTS', score: '', validityDate: '' },
    documents: { photo: null as File | null, ugCertificate: null as File | null, nursingCertificate: null as File | null, ieltsCertificate: null as File | null },
    booking: { center: 'INCTC Nodal Centre, Chennai, Tamilnadu', date: '', slot: '09:00 AM - 04:00 PM' }, 
    payment: { mode: 'UPI', amount: 20000 }, 
    finalData: null as any
  });

  const [previews, setPreviews] = useState({ photo: '', ugCertificate: '', nursingCertificate: '', ieltsCertificate: '' });

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Generate Valid Dates (1st & 3rd Weeks)
    setValidDates(getValidExamSlots());

    // 2. Check Token & Fetch User
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch(`http://localhost:5000/api/dashboard?t=${Date.now()}`, {
      headers: { 'x-access-token': token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          // NEW ROUTING LOGIC: Check if user has already completed registration
          const status = data.user.overallStatus;
          const isFullyEnrolled = ['Profile Completed', 'Quiz Failed', 'Quiz Passed', 'Offline Evaluated', 'Certified'].includes(status);

          if (isFullyEnrolled) {
            setAlreadyEnrolled(true);
          } else {
            setForm(prev => ({
              ...prev,
              userId: data.user._id,
              fullName: data.user.fullName,
              email: data.user.email
            }));
          }
        } else {
          localStorage.clear();
          router.push('/login');
        }
        setPageLoading(false);
      })
      .catch(() => router.push('/login'));
  }, []);

  const updateForm = (path: string, value: any) => {
    setForm(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleFileChange = (file: File, fieldKey: string) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) return alert("Invalid format. Only JPG, PNG, PDF allowed.");
    if (file.size > 2 * 1024 * 1024) return alert("File too large. Max 2MB allowed.");

    let previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : 'PDF Icon';
    updateForm(`documents.${fieldKey}`, file);
    setPreviews(prev => ({ ...prev, [fieldKey]: previewUrl }));
  };

  const uploadFilesToDrive = async () => {
    setUploading(true);
    const driveLinks: any = {};
    for (const [key, file] of Object.entries(form.documents)) {
      if (file) {
        const formData = new FormData();
        formData.append('file', file as File);
        try {
          const res = await fetch('http://localhost:5000/api/upload-drive', {
            method: 'POST', body: formData,
          });
          const data = await res.json();
          if (data.status === 'ok') {
            driveLinks[key] = data.url;
          } else {
            throw new Error('Upload Failed');
          }
        } catch (error) {
          alert(`Failed to upload ${key}. Please check connection.`);
          setUploading(false);
          return null;
        }
      }
    }
    setUploading(false);
    return driveLinks;
  };

  const handleFinalSubmit = async () => {
    if (!form.booking.date) return alert("Please select an exam date block.");

    const uploadedUrls = await uploadFilesToDrive();
    if (!uploadedUrls) return;

    setLoading(true);

    const payload = {
      userId: form.userId,
      dob: form.dob,
      gender: form.gender,
      nationality: form.nationality,
      maritalStatus: form.maritalStatus,
      mobile: form.mobile,
      altMobile: form.altMobile,
      address: form.address,
      education: form.education,
      profession: form.profession,
      ielts: form.ielts,
      documents: uploadedUrls,
      testCenter: form.booking.center,
      testDate: form.booking.date,
      testSlot: form.booking.slot,
      paymentMode: form.payment.mode,
      paymentAmount: 20000, 
      accommodationRequired: true, 
    };

    try {
      const res = await fetch('http://localhost:5000/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === 'ok') {
        setForm(prev => ({
          ...prev,
          finalData: { ...payload, paymentRefId: data.paymentRefId, fullName: form.fullName, email: form.email, userId: form.userId }
        }));
        setStep(5);
      } else {
        alert("Enrollment Failed: " + data.error);
      }
    } catch (err) { alert('Server Error.'); }
    finally { setLoading(false); }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const data = form.finalData;
    const primaryColor: [number, number, number] = [5, 150, 105];

    doc.setFontSize(18); doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Sathyabama Institute of Science and Technology', 105, 20, { align: 'center' });
    doc.setFontSize(14); doc.setTextColor(0);
    doc.text('INCTC Certification - Acknowledgement Receipt', 105, 30, { align: 'center' });

    autoTable(doc, {
      startY: 45,
      head: [['Candidate Details', '']],
      body: [
        ['Full Name', data.fullName],
        ['Candidate ID', data.userId.slice(-8).toUpperCase()],
        ['Email', data.email],
        ['Mobile', data.mobile],
        ['Address', `${data.address.city}, ${data.address.state}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Booking & Payment Information', '']],
      body: [
        ['Test Center', data.testCenter],
        ['Selected 3-Day Block', `${data.testDate} (Starts Mon)`],
        ['Total Paid', `Rs. 20,000`],
        ['Payment Breakdown', 'IM (5k) + IV (5k) + ID (5k) + SC (5k)'],
        ['Accommodation', 'Provided (Included)'],
        ['Payment Ref ID', data.paymentRefId],
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    doc.save(`Receipt_${data.userId}.pdf`);
  };

  // --- NEW: Loading State ---
  if (pageLoading) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-bold text-emerald-600">Loading Configuration...</div>;
  }

  // --- NEW: Already Enrolled Screen ---
  if (alreadyEnrolled) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center font-sans">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg w-full border border-gray-100">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="text-emerald-600 w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Already Enrolled</h2>
          <p className="text-gray-500 mb-8">You have already completed your registration and enrollment process. You can proceed directly to your dashboard.</p>
          <button onClick={() => router.push('/dashboard')} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center py-12 font-sans">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">

        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 p-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3 text-emerald-700">
              <div className="bg-emerald-100 p-2 rounded-lg"><ShieldCheck size={28} className="text-emerald-600" /></div>
              INCTC
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-2 ml-1">Complete Your Enrollment Profile</p>
          </div>
          {step < 5 && (
            <div className="flex flex-col items-end gap-2">
              <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">Step {step} of 4</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-2.5 w-8 rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 md:p-12">

          {/* ================= STEP 1: PERSONAL DETAILS ================= */}
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><User className="text-emerald-600" /> Account & Personal Details</h3>

              <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 grid grid-cols-2 gap-6">
                <Input label="Email Address (Locked)" path="email" type="email" disabled form={form} updateForm={updateForm} />
                <Input label="Full Name (Locked)" path="fullName" disabled form={form} updateForm={updateForm} />
              </div>

              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2"><Input label="Date of Birth" path="dob" type="date" required form={form} updateForm={updateForm} /></div>
                <Input label="Gender" path="gender" options={['Female', 'Male', 'Other']} form={form} updateForm={updateForm} />
                <Input label="Nationality" path="nationality" form={form} updateForm={updateForm} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Input label="Mobile Number" path="mobile" required form={form} updateForm={updateForm} />
                <Input label="Alternate Mobile" path="altMobile" form={form} updateForm={updateForm} />
                <Input label="Marital Status" path="maritalStatus" options={['Single', 'Married']} form={form} updateForm={updateForm} />
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid grid-cols-3 gap-6">
                <div className="col-span-3"><Input label="Permanent Address (Street / House No)" path="address.street" required form={form} updateForm={updateForm} /></div>
                <Input label="City" path="address.city" required form={form} updateForm={updateForm} />
                <Input label="State" path="address.state" required form={form} updateForm={updateForm} />
                <Input label="Zip Code" path="address.zipCode" required form={form} updateForm={updateForm} />
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button className="bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300" onClick={() => setStep(2)}>Next: Education</button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: EDUCATION & PROFESSION ================= */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Briefcase className="text-emerald-600" /> Education & Professional Background</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-400 mb-6 uppercase text-xs tracking-wider">Undergraduate Details (Mandatory)</h4>
                <div className="grid grid-cols-3 gap-6">
                  <Input label="Degree (e.g., B.Sc Nursing)" path="education.ug.degree" required form={form} updateForm={updateForm} />
                  <Input label="Institution / University" path="education.ug.institution" required form={form} updateForm={updateForm} />
                  <Input label="Year of Passing" path="education.ug.yearOfPassing" type="number" required form={form} updateForm={updateForm} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <Input label="RNM / Registration Number" path="profession.rnmNumber" form={form} updateForm={updateForm} />
                <Input label="Specialty" path="profession.specialty" options={['General', 'Surgical', 'Critical Care', 'Emergency', 'Pediatrics']} form={form} updateForm={updateForm} />
                <Input label="Experience (Years)" path="profession.experienceYears" type="number" form={form} updateForm={updateForm} />
                <Input label="State Nursing Council" path="profession.rnmState" form={form} updateForm={updateForm} />
              </div>
              <div className="border border-indigo-100 p-6 rounded-xl bg-indigo-50/50">
                <div className="flex items-center gap-3 mb-6">
                  <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring- emerald-500"
                    checked={form.ielts.taken} onChange={e => updateForm('ielts.taken', e.target.checked)} />
                  <label className="font-bold text-gray-800">I have valid IELTS / OET Scores</label>
                </div>
                {form.ielts.taken && (
                  <div className="grid grid-cols-3 gap-6 animate-fadeIn">
                    <Input label="Test Type" path="ielts.testType" options={['IELTS', 'OET']} form={form} updateForm={updateForm} />
                    <Input label="Overall Score" path="ielts.score" form={form} updateForm={updateForm} />
                    <Input label="Score Validity Date" path="ielts.validityDate" type="date" form={form} updateForm={updateForm} />
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-8 border-t border-gray-100">
                <button className="text-gray-500 font-bold hover:text-gray-800 px-6" onClick={() => setStep(1)}>Back</button>
                <button className="bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300" onClick={() => setStep(3)}>Next: Documents</button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DOCUMENTS ================= */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><File className="text-emerald-600" /> Document Uploads</h3>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl mb-4 flex gap-4 items-start">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><AlertTriangle size={20} /></div>
                <div>
                  <p className="text-sm text-amber-900 font-bold mb-1">Important Instructions</p>
                  <p className="text-xs text-amber-700 leading-relaxed">Please upload clear scanned copies. Allowed formats: JPG, PNG, PDF. Max size 2MB per file. These will be securely stored in Google Drive.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <FileUpload label="Passport Size Photo" fieldKey="photo" required form={form} previews={previews} handleFileChange={handleFileChange} />
                <FileUpload label="UG Degree Certificate" fieldKey="ugCertificate" required form={form} previews={previews} handleFileChange={handleFileChange} />
                <FileUpload label="Nursing Registration (RNM)" fieldKey="nursingCertificate" form={form} previews={previews} handleFileChange={handleFileChange} />
                {form.ielts.taken && <FileUpload label="IELTS/OET Score Card" fieldKey="ieltsCertificate" required form={form} previews={previews} handleFileChange={handleFileChange} />}
              </div>
              <div className="flex justify-between pt-8 border-t border-gray-100">
                <button className="text-gray-500 font-bold hover:text-gray-800 px-6" onClick={() => setStep(2)}>Back</button>
                <button disabled={!form.documents.photo || !form.documents.ugCertificate}
                  className="bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                  onClick={() => setStep(4)}
                >
                  Next: Booking & Payment
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: BOOKING & PAYMENT (UPDATED) ================= */}
          {step === 4 && (
            <div className="space-y-8 animate-fadeIn grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-8">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Calendar className="text-emerald-600" /> Slot Booking & Center</h3>

                <div className="space-y-6">
                  {/* Center Selection */}
                  <Input
                    label="Test Center"
                    path="booking.center"
                    options={[
                      { label: 'INCTC New Delhi', value: 'INCTC New Delhi', disabled: true },
                      { label: 'INCTC Cochin, Kerala', value: 'INCTC Cochin, Kerala', disabled: true },
                      { label: 'INCTC, Mumbai Maharashtra', value: 'INCTC, Mumbai Maharashtra', disabled: true },
                      { label: 'INCTC Nodal Centre, Chennai, Tamilnadu', value: 'INCTC Nodal Centre, Chennai, Tamilnadu', disabled: false },
                      { label: 'INCTC, Dimapur Nagaland', value: 'INCTC, Dimapur Nagaland', disabled: true },
                      { label: 'INCTC, Bangalore Karnataka', value: 'INCTC, Bangalore Karnataka', disabled: true },
                    ]}
                    form={form}
                    updateForm={updateForm}
                  />

                  {/* SMART DATE DROPDOWN */}
                  <Input
                    label="Select 3-Day Exam Block (Mon-Tue-Wed Only)"
                    path="booking.date"
                    options={validDates} 
                    form={form}
                    updateForm={updateForm}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4">Payment Method</h4>
                  <div className="flex gap-4">
                    {['UPI', 'Credit/Debit Card', 'NetBanking'].map(m => (
                      <button key={m} onClick={() => updateForm('payment.mode', m)}
                        className={`px-6 py-3 border-2 rounded-xl font-bold text-sm transition-all ${form.payment.mode === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PAYMENT SUMMARY BOX */}
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl h-fit sticky top-6">
                <h4 className="font-bold text-lg mb-6 border-b pb-4 flex items-center gap-2 text-gray-800"><CreditCard size={20} className="text-emerald-600" /> Payment Summary</h4>

                {/* BREAKDOWN BOX */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Fee Breakdown</p>
                  <ul className="space-y-2 text-sm text-gray-600 font-medium">
                    <li className="flex justify-between"><span>IM Injection</span> <span>₹5,000</span></li>
                    <li className="flex justify-between"><span>IV Cannulation</span> <span>₹5,000</span></li>
                    <li className="flex justify-between"><span>ID Injection</span> <span>₹5,000</span></li>
                    <li className="flex justify-between"><span>SC Injection</span> <span>₹5,000</span></li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                      <CheckCircle size={12} /> Accommodation Provided (Free)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-2xl font-black text-emerald-700 border-t border-gray-100 pt-6">
                  <span>Total</span>
                  <span>₹20,000</span>
                </div>

                <button onClick={handleFinalSubmit} disabled={loading || uploading || !form.booking.date}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg mt-8 hover:bg-emerald-700 flex justify-center items-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-70 disabled:shadow-none disabled:cursor-not-allowed transition"
                >
                  {uploading ? <span className="animate-pulse">Uploading Documents...</span> : loading ? <span className="animate-pulse">Processing...</span> : <>Pay ₹20,000 & Submit</>}
                </button>
                <button onClick={() => setStep(3)} className="w-full text-center text-gray-400 font-bold text-xs mt-6 hover:text-gray-600 hover:underline">Back to Documents</button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: SUCCESS / ACKNOWLEDGEMENT ================= */}
          {step === 5 && form.finalData && (
            <div className="text-center p-12 animate-fadeIn max-w-2xl mx-auto">
              <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle className="text-emerald-600 w-14 h-14" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Registration Successful!</h1>
              <p className="text-gray-500 mb-10 text-lg">Welcome, <b>{form.finalData.fullName}</b>. Your slot has been confirmed.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-10 text-left grid grid-cols-2 gap-y-6 shadow-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Candidate ID</span>
                  <span className="font-mono font-bold text-xl text-gray-800">{form.finalData.userId.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ref Number</span>
                  <span className="font-mono font-bold text-xl text-blue-600">{form.finalData.paymentRefId}</span>
                </div>
                <div className="col-span-2 border-t border-gray-200 pt-6">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Exam Block</span>
                  <span className="font-bold text-gray-800 text-lg">{form.finalData.testDate} (3 Days)</span>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={generatePDF} className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition">
                  <Download size={18} /> Download Receipt
                </button>
                <button onClick={() => router.push('/dashboard')} className="bg-white border-2 border-emerald-100 text-emerald-700 px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-50 transition">
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}