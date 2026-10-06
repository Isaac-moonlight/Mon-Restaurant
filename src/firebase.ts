import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Order, WaiterCall, RestaurantSettings, MenuItem } from './types/restaurant';

// Initialize Firebase App & Firestore with the provisioned database ID
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  const q = query(ordersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const orders = snapshot.docs.map(docSnap => docSnap.data() as Order);
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
  const q = query(waiterCallsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const calls = snapshot.docs.map(docSnap => docSnap.data() as WaiterCall);
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
    await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order, { merge: true });
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
  }
};

export const updateOrderStatusInFirestore = async (orderId: string, status: Order['status'], extra?: Partial<Order>) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
      status,
      ...extra,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
  }
};

export const syncWaiterCallToFirestore = async (call: WaiterCall) => {
  try {
    await setDoc(doc(db, COLLECTIONS.WAITER_CALLS, call.id), call, { merge: true });
  } catch (err) {
    console.error('Error saving waiter call to Firestore:', err);
  }
};

export const resolveWaiterCallInFirestore = async (callId: string) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.WAITER_CALLS, callId), {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error resolving waiter call in Firestore:', err);
  }
};

export const syncSettingsToFirestore = async (settings: RestaurantSettings) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'current'), settings, { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
};

export const updateInventoryItemInFirestore = async (itemId: string, stock: number, isAvailable: boolean) => {
  try {
    await setDoc(
      doc(db, COLLECTIONS.INVENTORY, itemId),
      {
        itemId,
        stock,
        isAvailable,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving inventory item to Firestore:', err);
  }
};
