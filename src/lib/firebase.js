import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const isFirebase = CONFIG.auth.method === 'firebase';

// ----------------------------------------------------------------------

export const firebaseApp = isFirebase ? initializeApp(CONFIG.firebase) : {};

// ----------------------------------------------------------------------

export const AUTH = isFirebase ? getAuth(firebaseApp) : {};

// ----------------------------------------------------------------------

export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};

// ----------------------------------------------------------------------

export const FIREBASE_STORAGE = isFirebase ? getStorage(firebaseApp) : {};

// ----------------------------------------------------------------------

export const FIREBASE_FUNCTIONS = isFirebase ? getFunctions(firebaseApp) : {};
