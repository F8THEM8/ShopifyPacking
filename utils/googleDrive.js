const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Drive API Authentication
async function authenticateGoogleDrive() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://shopify-packing.vercel.app/oauth2callback' // Redirect URI
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Upload file to Google Drive
async function uploadToGoogleDrive(filePath, fileName) {
  const drive = await authenticateGoogleDrive();
  const fileMetadata = {
    name: fileName,
    parents: ['1hS7Po6apyNQwW1G0nT8IaOs-VCSsQ9ca'], // Folder ID
  };

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log(`File uploaded successfully: ${file.data.id}`);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

module.exports = { uploadToGoogleDrive };
