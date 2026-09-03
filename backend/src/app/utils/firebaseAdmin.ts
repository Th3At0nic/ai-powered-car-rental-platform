import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import config from '../config';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: config.firebaseProjectId as string,
      clientEmail: config.firebaseClientEmail as string,
      privateKey: (config.firebasePrivateKey as string)?.replace(/\\n/g, '\n'),
    }),
  });
}

export const firebaseAuth = getAuth();
