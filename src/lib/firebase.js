import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

import { CONFIG } from 'src/global-config';

// Configuration Firebase depuis l'environnement ou le fichier de configuration
const firebaseConfig = {
    apiKey: CONFIG.firebase.apiKey,
    authDomain: CONFIG.firebase.authDomain,
    projectId: CONFIG.firebase.projectId,
    storageBucket: CONFIG.firebase.storageBucket,
    messagingSenderId: CONFIG.firebase.messagingSenderId,
    appId: CONFIG.firebase.appId,
    measurementId: CONFIG.firebase.measurementId,
};

// Initialiser Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

// Exportation des instances Firebase
export const AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
export const FIREBASE_FUNCTIONS = getFunctions(FIREBASE_APP);

export default FIREBASE_APP;
