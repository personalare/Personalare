import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, setLogLevel, type Firestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Configure log level to silent so non-fatal transient network/offline status notices are suppressed
setLogLevel('silent');

// In browser environments, safely route Firestore offline/handshake notices to console.warn
// so that transient sandbox network timeouts do not trigger fatal error boundaries
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args
      .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : ''))
      .join(' ');
    if (
      msg.includes('Could not reach Cloud Firestore backend') ||
      msg.includes("Backend didn't respond within") ||
      msg.includes('operate in offline mode until')
    ) {
      console.warn('Firestore offline status:', msg);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const app = !getApps().length ? initializeApp(config) : getApp();

export const db: Firestore = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const isPermissionDenied =
    errMessage.includes('permission-denied') ||
    errMessage.includes('Missing or insufficient permissions');

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  if (isPermissionDenied) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn(`Firestore [${operationType} on ${path || 'unknown'}]:`, errMessage);
  }
}

export default app;

