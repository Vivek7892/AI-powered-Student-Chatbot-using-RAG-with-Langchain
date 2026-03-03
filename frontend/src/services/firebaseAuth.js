import { initializeApp, getApps } from 'firebase/app';
import { GoogleAuthProvider, getAuth, sendPasswordResetEmail, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const getFirebaseAuth = () => {
  if (!hasFirebaseConfig) {
    throw new Error('Firebase is not configured');
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
};

export const sendForgotPasswordFirebaseEmail = async (email) => {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
};

export const signInWithGoogleForVerification = async () => {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  const email = result.user.email || '';

  // Keep this flow stateless for verification-only usage.
  await signOut(auth);

  return {
    idToken,
    email
  };
};

export const isFirebaseConfigured = () => hasFirebaseConfig;
