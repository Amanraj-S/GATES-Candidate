const mongoose = require('mongoose');



const CandidateSchema = new mongoose.Schema({

  // --- 1. BASIC ACCOUNT (Login Details) ---

  fullName: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true }, // Ensure you hash this before saving!



  // --- 2. CANDIDATE LIFECYCLE STATUS ---

  // Helps frontend decide what to show (e.g., if 'Quiz Passed', show Offline details)

  overallStatus: {

    type: String,

    enum: ['Registered', 'Profile Completed', 'Quiz Failed', 'Quiz Passed', 'Offline Evaluated', 'Certified'],

    default: 'Registered'

  },



  // --- 3. DETAILED PROFILE (Registration Data) ---

  dob: { type: Date },

  gender: { type: String },

  nationality: { type: String, default: 'Indian' },

  maritalStatus: String,

  mobile: { type: String },

  altMobile: String,

  address: {

    street: String,

    city: String,

    state: String,

    zipCode: String,

    country: { type: String, default: 'India' }

  },



  // --- 4. EDUCATION & PROFESSIONAL ---

  education: {

    ug: { degree: String, institution: String, yearOfPassing: String },

    pg: { degree: String, institution: String, yearOfPassing: String }

  },

  profession: {

    rnmNumber: String,

    rnmState: String,

    specialty: String,

    experienceYears: Number,

    currentEmployer: String,

    interestedCountries: [String]

  },

  ielts: {

    taken: { type: Boolean, default: false },

    testType: String,

    score: String,

    validityDate: Date

  },



  // --- 5. DOCUMENTS (Uploaded by Candidate) ---

  documents: {

    photo: String,          

    ugCertificate: String,  

    nursingCertificate: String,

    ieltsCertificate: String    

  },



  // --- 6. BOOKING & PAYMENT ---

  booking: {

    testCenter: String,

    testDate: Date,

    testSlot: String,

    paymentRefId: String,

    paymentAmount: Number,

    paymentStatus: { type: String, default: 'Pending' }

  },



  // --- 7. ONLINE ASSESSMENT (The Quiz) ---

  onlineAssessment: {

    isAttempted: { type: Boolean, default: false },

    score: { type: Number, default: 0 },

    isPassed: { type: Boolean, default: false },

    attemptDate: Date

  },



  // --- 8. OFFLINE ASSESSMENT (Evaluator Section) ---

  // This section is filled by the Evaluator after the physical test

  offlineAssessment: {

    status: { type: String, default: 'Pending' }, // Pending, Completed, Failed

   

    // Skill Scores (IM, IV, ID, SC likely refer to injection types)

    scores: {

      im: { type: Number, default: 0 }, // Intramuscular

      iv: { type: Number, default: 0 }, // Intravenous

      id: { type: Number, default: 0 }, // Intradermal

      sc: { type: Number, default: 0 }, // Subcutaneous

      total: { type: Number, default: 0 },

      percentage: { type: Number, default: 0 }

    },



    // Evaluator Details (Who gave the marks?)

    evaluatorName: String,

    evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: Link to Evaluator's account

    evaluatorFeedback: String, // Remarks to display on candidate page

    evaluationDate: Date

  },



  createdAt: { type: Date, default: Date.now }

}, { timestamps: true });



module.exports = mongoose.model('Candidate', CandidateSchema);