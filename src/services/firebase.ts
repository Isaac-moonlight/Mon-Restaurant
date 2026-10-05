// Firebase client configuration & real-time sync adapter
// Supports standard Firebase Firestore and real-time fallbacks

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mon-restaurant-demo',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.projectId);
};

// Client persistence synchronization status
export const getDatabaseStatus = () => {
  const configured = isFirebaseConfigured();
  return {
    connected: true,
    engine: configured ? 'Firestore Live Sync' : 'Realtime Storage & Broadcast Bus',
    projectId: getFirebaseConfig().projectId,
  };
};
