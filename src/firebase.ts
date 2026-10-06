import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Order, WaiterCall, RestaurantSettings, MenuItem } from './types/restaurant';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with ignoreUndefinedProperties to prevent Firebase errors on optional fields
export const db = initializeFirestore(
  app,
  {
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Deep sanitization helper that guarantees no undefined value reaches Firestore
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Test Firestore connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'restaurantSettings', 'current'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is connecting or client is offline.');
    }
  }
})();

// Collections
export const COLLECTIONS = {
  ORDERS: 'orders',
  WAITER_CALLS: 'waiterCalls',
  INVENTORY: 'inventory',
  SETTINGS: 'restaurantSettings',
} as const;

export const ordersCollection = collection(db, COLLECTIONS.ORDERS);
export const waiterCallsCollection = collection(db, COLLECTIONS.WAITER_CALLS);
export const inventoryCollection = collection(db, COLLECTIONS.INVENTORY);
export const settingsCollection = collection(db, COLLECTIONS.SETTINGS);

// Realtime synchronizers
export const subscribeToOrders = (
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    ordersCollection,
    snapshot => {
      const orders = snapshot.docs
        .map(docSnap => docSnap.data() as Order)
        .filter(o => o && o.id && o.tableNumber);

      // Sort newest first
      orders.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(orders);
    },
    error => {
      console.error('Firestore Orders error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToWaiterCalls = (
  onUpdate: (calls: WaiterCall[]) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    waiterCallsCollection,
    snapshot => {
      const calls = snapshot.docs
        .map(docSnap => docSnap.data() as WaiterCall)
        .filter(c => c && c.id && c.status === 'active');

      calls.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(calls);
    },
    error => {
      console.error('Firestore WaiterCalls error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToSettings = (
  onUpdate: (settings: RestaurantSettings) => void,
  onError?: (err: Error) => void
) => {
  const settingsDoc = doc(db, COLLECTIONS.SETTINGS, 'current');
  return onSnapshot(
    settingsDoc,
    docSnap => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as RestaurantSettings);
      }
    },
    error => {
      console.error('Firestore Settings error:', error);
      onError?.(error);
    }
  );
};

export const subscribeToInventory = (
  onUpdate: (stockMap: Record<string, { stock: number; isAvailable: boolean }>) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    inventoryCollection,
    snapshot => {
      const stockMap: Record<string, { stock: number; isAvailable: boolean }> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        stockMap[docSnap.id] = {
          stock: data.stock ?? 10,
          isAvailable: data.isAvailable ?? true,
        };
      });
      onUpdate(stockMap);
    },
    error => {
      console.error('Firestore Inventory error:', error);
      onError?.(error);
    }
  );
};

// Write helpers
export const syncOrderToFirestore = async (order: Order) => {
  try {
    const payload = cleanForFirestore(order);
    await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), payload, { merge: true });
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
  }
};

export const updateOrderStatusInFirestore = async (orderId: string, status: Order['status'], extra?: Partial<Order>) => {
  try {
    const updatePayload = cleanForFirestore({
      status,
      ...extra,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), updatePayload);
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
  }
};

export const syncWaiterCallToFirestore = async (call: WaiterCall) => {
  try {
    const payload = cleanForFirestore(call);
    await setDoc(doc(db, COLLECTIONS.WAITER_CALLS, call.id), payload, { merge: true });
  } catch (err) {
    console.error('Error saving waiter call to Firestore:', err);
  }
};

export const resolveWaiterCallInFirestore = async (callId: string) => {
  try {
    // Permanently remove the call from active Firestore list so it never reappears
    await deleteDoc(doc(db, COLLECTIONS.WAITER_CALLS, callId));
  } catch (err) {
    console.error('Error resolving waiter call in Firestore:', err);
  }
};

export const syncSettingsToFirestore = async (settings: RestaurantSettings) => {
  try {
    const payload = cleanForFirestore(settings);
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'current'), payload, { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
};

export const updateInventoryItemInFirestore = async (itemId: string, stock: number, isAvailable: boolean) => {
  try {
    await setDoc(
      doc(db, COLLECTIONS.INVENTORY, itemId),
      cleanForFirestore({
        itemId,
        stock,
        isAvailable,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving inventory item to Firestore:', err);
  }
};
