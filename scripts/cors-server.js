import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the service account file
const serviceAccountPath = join(__dirname, '../madinia-dashboard-firebase-adminsdk-fbsvc-783c853b81.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'madinia-dashboard.appspot.com'
});

const app = express();
app.use(cors());

// Route to proxy storage requests
app.get('/storage-proxy', async (req, res) => {
  try {
    const fileUrl = req.query.url;
    if (!fileUrl) {
      return res.status(400).send('Missing URL parameter');
    }

    // Extract the file path from the URL
    // Example URL: https://firebasestorage.googleapis.com/v0/b/madinia-admin.appspot.com/o/events%2F...
    const urlObj = new URL(fileUrl);
    const bucket = urlObj.hostname.split('.')[0].replace('firebasestorage', '');
    const filePath = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);

    console.log(`Proxying request for bucket: ${bucket}, file: ${filePath}`);

    // Get the file using admin SDK
    const file = admin.storage().bucket(bucket + '.appspot.com').file(filePath);
    const [exists] = await file.exists();

    if (!exists) {
      return res.status(404).send('File not found');
    }

    // Stream the file to the response
    const readStream = file.createReadStream();
    readStream.pipe(res);
  } catch (error) {
    console.error('Error proxying file:', error);
    res.status(500).send('Error retrieving file');
  }
});

const PORT = process.env.PORT || 3031;
app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
});
