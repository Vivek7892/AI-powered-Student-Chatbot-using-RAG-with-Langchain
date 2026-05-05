const admin = require('firebase-admin');

const normalizePrivateKey = (value) => {
  if (!value) {
    return '';
  }

  const trimmed = String(value).trim().replace(/^"(.*)"$/, '$1');
  return trimmed.replace(/\\n/g, '\n');
};

const hasFirebaseServiceAccount =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasFirebaseServiceAccount && admin.apps.length === 0) {
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const looksLikePemKey =
    privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
    privateKey.includes('-----END PRIVATE KEY-----') &&
    !privateKey.includes('REPLACE_WITH_YOUR_PRIVATE_KEY');

  if (!looksLikePemKey) {
    console.warn('Firebase Admin disabled: FIREBASE_PRIVATE_KEY is missing or still a placeholder.');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey
        })
      });
    } catch (error) {
      console.warn(`Firebase Admin disabled: ${error.message}`);
    }
  }
}

const isFirebaseAdminReady = admin.apps.length > 0;

module.exports = {
  admin,
  isFirebaseAdminReady
};
