require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const multer = require('multer');

const { google } = require('googleapis');

const stream = require('stream');

const path = require('path');

const Candidate = require('./models/Candidate');



const app = express();

app.use(express.json());

app.use(cors());



const PORT = process.env.PORT || 5000;

let CURRENT_ACCESS_KEY = null; // Store the current access key in memory

const DRIVE_FOLDER_ID = '1bKLZZsly5wTjHasBbHCbncwwbHLb3n7i';



mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB Connected"))

  .catch(err => console.log("DB Connection Error:", err));



// --- GOOGLE DRIVE CONFIG ---

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const oauth2Client = new google.auth.OAuth2(

  process.env.GOOGLE_CLIENT_ID,

  process.env.GOOGLE_CLIENT_SECRET,

  "https://developers.google.com/oauthplayground"

);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });



const uploadFileToDrive = async (fileObject) => {

  const bufferStream = new stream.PassThrough();

  bufferStream.end(fileObject.buffer);



  // 1. Upload the file

  const response = await drive.files.create({

    media: { mimeType: fileObject.mimetype, body: bufferStream },

    requestBody: { name: `${Date.now()}_${fileObject.originalname}`, parents: [DRIVE_FOLDER_ID] },

    fields: 'id, webViewLink',

  });



  // 2. Set Public Permissions (Anyone with link can view)

  await drive.permissions.create({

    fileId: response.data.id,

    requestBody: { role: 'reader', type: 'anyone' },

  });



  // 3. Return the webViewLink

  return response.data.webViewLink;

};



// --- ROUTES ---



// 1. Upload (Public Access)

app.post('/api/upload-drive', upload.single('file'), async (req, res) => {

  try {

    if (!req.file) return res.status(400).json({ error: 'No file' });

    const publicUrl = await uploadFileToDrive(req.file);

    res.json({ status: 'ok', url: publicUrl });

  } catch (error) {

    console.error("Drive Upload Error:", error);

    res.status(500).json({ error: 'Drive Error' });

  }

});



// 2. Check Slots

app.post('/api/check-slots', async (req, res) => {

  // Mock logic - in production, query DB for booked slots

  res.json({ status: 'ok', slots: [{ time: "09:00 AM", seats: 15 }, { time: "02:00 PM", seats: 20 }] });

});



// 3. Simple Signup (General User Creation)

app.post('/api/signup', async (req, res) => {

  try {

    const { fullName, email, password } = req.body;



    // Check if user exists

    const existing = await Candidate.findOne({ email });

    if (existing) return res.json({ status: 'error', error: 'Email already exists' });



    const hashedPassword = await bcrypt.hash(password, 10);



    // Create Basic User (profileCompleted: false)

    const newUser = await Candidate.create({

      fullName,

      email,

      password: hashedPassword,

      profileCompleted: false,
      overallStatus: 'Registered' // <-- ADDED: Explicitly set status to Registered on creation

    });



    res.json({ status: 'ok', message: 'Account created' });

  } catch (error) {

    res.json({ status: 'error', error: error.message });

  }

});



// 4. Enroll / Complete Registration (Upgrade to Candidate)

app.post('/api/enroll', async (req, res) => {

  try {

    const { userId, ...updateData } = req.body;



    // Generate a dummy payment ref ID

    const paymentRefId = 'PAY' + Date.now().toString().slice(-6);



    // Update the existing user record with full details

    const updatedUser = await Candidate.findByIdAndUpdate(userId, {

      ...updateData,

      paymentRefId,

      paymentStatus: 'Completed',

      profileCompleted: true, // Mark as Full Candidate
      overallStatus: 'Profile Completed' // <-- ADDED: Updates DB so dashboard button changes

    }, { new: true });



    if (!updatedUser) return res.json({ status: 'error', error: 'User not found' });



    res.json({ status: 'ok', paymentRefId });

  } catch (error) {

    res.json({ status: 'error', error: error.message });

  }

});



// 5. Login

app.post('/api/login', async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await Candidate.findOne({ email });

    if (!user || !await bcrypt.compare(password, user.password)) {

      return res.json({ status: 'error', error: 'Invalid Credentials' });

    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ status: 'ok', token, user });

  } catch (error) {

    res.json({ status: 'error', error: 'Server Error' });

  }

});



// 6. Dashboard Data

app.get('/api/dashboard', async (req, res) => {

  const token = req.headers['x-access-token'];

  if (!token) return res.json({ status: 'error' });

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Candidate.findById(decoded.id).select('-password');

    res.json({ status: 'ok', user });

  } catch (error) {

    res.json({ status: 'error' });

  }

});



// 7. Secure Quiz Access
// 7.1 Generate Access Key (Admin/Terminal Only)
app.post('/api/generate-key', (req, res) => {
  // Generate a 6-digit random key
  const key = Math.floor(100000 + Math.random() * 900000).toString();
  CURRENT_ACCESS_KEY = key;

  console.log('\n==================================================');
  console.log(`[ACCESS KEY] Generated New Key: ${key}`);
  console.log('==================================================\n');

  res.json({ status: 'ok', message: 'Key generated and logged to terminal' });
});

// 7.2 Start Quiz (Verify Password + Access Key)
app.post('/api/start-quiz', async (req, res) => {
  const { userId, accessKey, password } = req.body;

  try {
    const user = await Candidate.findById(userId);
    if (!user) return res.json({ status: 'error', error: 'User not found' });

    // 1. Verify Access Key
    if (!CURRENT_ACCESS_KEY || accessKey !== CURRENT_ACCESS_KEY) {
      return res.json({ status: 'error', error: 'Invalid Access Key' });
    }

    // 2. Verify Password
    if (!await bcrypt.compare(password, user.password)) {
      return res.json({ status: 'error', error: 'Invalid Password' });
    }

    // 3. Verify Attempt Status
    if (user.onlineAssessment && user.onlineAssessment.isAttempted) {
      return res.json({ status: 'error', error: 'ALREADY_ATTEMPTED' });
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error("Start Quiz Error:", error);
    res.json({ status: 'error', error: 'Server Error' });
  }
});

// 7.3 Secure Quiz Submission (One Time Only)
app.post('/api/submit-quiz', async (req, res) => {
  const { userId, score, passed } = req.body;

  try {
    const candidate = await Candidate.findById(userId);
    if (!candidate) return res.json({ status: 'error', error: 'User not found' });

    // 1. Check the correct nested field for security
    if (candidate.onlineAssessment && candidate.onlineAssessment.isAttempted) {
      return res.json({ status: 'error', error: 'ALREADY_ATTEMPTED' });
    }

    // 2. UPDATE: Map the data exactly to your onlineAssessment Schema!
    candidate.onlineAssessment = {
      isAttempted: true,
      score: score,
      isPassed: passed,
      attemptDate: new Date()
    };

    // 3. Update overallStatus so the Dashboard unlocks the next steps
    candidate.overallStatus = passed ? 'Quiz Passed' : 'Quiz Failed';

    await candidate.save();
    console.log(`User ${userId} Result Saved: Score ${score}, Passed: ${passed}`);

    res.json({ status: 'ok' });
  } catch (error) {
    console.error("Quiz Save Error:", error);
    res.json({ status: 'error', error: 'Database Error' });
  }
});



// 8. Update Offline Status (Invigilator or System)

app.post('/api/upload-offline', async (req, res) => {

  const { userId, videos } = req.body;

  try {

    await Candidate.findByIdAndUpdate(userId, { offlineSubmissions: videos, offlineStatus: 'Pending' });

    res.json({ status: 'ok', message: "Submitted" });

  } catch (error) {

    res.json({ status: 'error' });

  }

});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));