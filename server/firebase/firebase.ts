import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Read from environment variables
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
};

// Validate environment variables
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`);
}

// Initialize Firebase
const app = initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore(app);

// Collections
export const productsCollection = db.collection('products');
export const categoriesCollection = db.collection('categories');

console.log('Firebase Admin initialized successfully');