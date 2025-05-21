/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Load service account từ file JSON
import serviceAccount from '../../serviceAccountKey.json';

// Khởi tạo Firebase Admin
const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: 'netflix-clone-618f2.appspot.com', // Lấy từ project_id hoặc cấu hình Firebase Storage
});

// Khởi tạo Storage và Firestore
export const storage = getStorage(firebaseApp);
export const firestore = getFirestore(firebaseApp);
