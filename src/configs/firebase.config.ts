/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';
// const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON as string);

const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: 'netflix-clone-618f2.appspot.com',
});

export const storage = getStorage(firebaseApp);
export const firestore = getFirestore(firebaseApp);
