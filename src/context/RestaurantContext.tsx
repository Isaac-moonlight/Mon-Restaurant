import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  MenuItem,
  Order,
  WaiterCall,
  RestaurantSettings,
  FloorTable,
  CartItem,
  OrderStatus,
  PaymentMethod,
} from '../types/restaurant';
import { INITIAL_MENU, INITIAL_SETTINGS, INITIAL_FLOOR_TABLES } from '../data/initialData';
import { calculateTVABreakdown } from '../utils/formatters';
import { soundFx } from '../utils/audio';
import {
  subscribeToOrders,
  subscribeToWaiterCalls,
  subscribeToSettings,
  subscribeToInventory,
  syncOrderToFirestore,
  updateOrderStatusInFirestore,
  syncWaiterCallToFirestore,
  resolveWaiterCallInFirestore,
  syncSettingsToFirestore,
  updateInventoryItemInFirestore,
} from '../firebase';

interface RestaurantContextType {
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  menu: MenuItem[];
  toggleItemAvailability: (itemId: string) => void;
  updateItemStock: (itemId: string, qty: number) => void;
  currentTable: number;
  setCurrentTable: (table: number) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  orders: Order[];
  placeOrder: (options: {
    tableNumber: number;
    items: CartItem[];
    tipAmount: number;
    tipPercentage?: number;
    customerName?: string;
    customerCompany?: string;
    customerEmail?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string, method: PaymentMethod, splitDetails?: Order['splitDetails']) => void;
  activeCustomerOrder: Order | null;
  waiterCalls: WaiterCall[];
  callWaiter: (reason: WaiterCall['reason'], reasonLabel: string, paymentPreference?: string) => void;
  resolveWaiterCall: (callId: string) => void;
  floorTables: FloorTable[];
  updateTableStatus: (tableId: number, status: FloorTable['status']) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

const STORAGE_KEYS = {
  SETTINGS: 'mon_resto_settings_v1',
  MENU: 'mon_resto_menu_v1',
  ORDERS: 'mon_resto_orders_v1',
  CALLS: 'mon_resto_calls_v1',
  TABLES: 'mon_resto_tables_v1',
  TABLE_NUM: 'mon_resto_current_table_v1',
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Menu items with 86-stock state
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : INITIAL_MENU;
    } catch {
      return INITIAL_MENU;
    }
  });

  // Current Table detection from URL ?table= or ?t=
  const [currentTable, setCurrentTableState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table') || params.get('t');
      if (urlTable && !isNaN(parseInt(urlTable, 10))) {
        return parseInt(urlTable, 10);
      }
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.TABLE_NUM);
        if (saved) return parseInt(saved, 10);
      } catch {
        // default
      }
    }
    return 12; // Default demo table
  });

  const setCurrentTable = (num: number) => {
    setCurrentTableState(num);
    try {
      localStorage.setItem(STORAGE_KEYS.TABLE_NUM, num.toString());
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('table', num.toString());
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // ignore
    }
  };

  // Sound enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Theme: light (warm champagne) or dark (luxury obsidian)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mon_resto_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('mon_resto_theme', theme);
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Floor Tables
  const [floorTables, setFloorTables] = useState<FloorTable[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      return saved ? JSON.parse(saved) : INITIAL_FLOOR_TABLES;
    } catch {
      return INITIAL_FLOOR_TABLES;
    }
  });

  // Seed initial realistic orders if empty
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    // Default seeded orders for rich KDS & POS experience
    const now = Date.now();
    const seeded: Order[] = [
      {
        id: 'CMD-1080',
        tableNumber: 6,
        items: [
          {
            id: 'c-1',
            menuItemId: 'plat-1',
            name: 'Filet Mignon de Bœuf Aubrac & Jus Réduit',
            basePrice: 34.00,
            cookingPreference: 'Saignant',
            selectedExtras: [{ id: 'ex-7', name: 'Lamelles de truffe noire fraîche', price: 7.50 }],
            specialNotes: 'Sans sel ajouté sur les asperges',
            quantity: 2,
            itemTotal: 83.00,
            tvaRate: 0.10,
            image: INITIAL_MENU[2].image,
          },
          {
            id: 'c-2',
            menuItemId: 'boisson-1',
            name: 'Cocktail Signature « L\'Or Fumé »',
            basePrice: 15.50,
            selectedExtras: [],
            quantity: 2,
            itemTotal: 31.00,
            tvaRate: 0.20,
            image: INITIAL_MENU[8].image,
          },
        ],
        totalHT: 99.42,
        totalTTC: 114.00,
        tvaDetails: [
          { rate: 0.10, rateLabel: '10,0% (Restauration)', baseHT: 75.45, tvaAmount: 7.55, totalTTC: 83.00 },
          { rate: 0.20, rateLabel: '20,0% (Alcool)', baseHT: 25.83, tvaAmount: 5.17, totalTTC: 31.00 },
        ],
        tipAmount: 10.00,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        status: 'served',
        createdAt: new Date(now - 45 * 60000).toISOString(),
        updatedAt: new Date(now - 10 * 60000).toISOString(),
      },
      {
        id: 'CMD-1081',
        tableNumber: 2,
        items: [
          {
            id: 'c-3',
            menuItemId: 'plat-4',
            name: 'Le Grand Burger Wagyu & Confit d\'Échalotes',
            basePrice: 24.00,
            cookingPreference: 'À point',
            selectedExtras: [{ id: 'ex-15', name: 'Portion généreuse de frites maison', price: 4.50 }],
            quantity: 2,
            itemTotal: 57.00,
            tvaRate: 0.10,
            image: INITIAL_MENU[5].image,
          },
          {
            id: 'c-4',
            menuItemId: 'dessert-1',
            name: 'Cœur Coulant Chocolat Valrhona & Glace Vanille',
            basePrice: 12.50,
            selectedExtras: [],
            quantity: 2,
            itemTotal: 25.00,
            tvaRate: 0.10,
            image: INITIAL_MENU[6].image,
          },
        ],
        totalHT: 74.55,
        totalTTC: 82.00,
        tvaDetails: [
          { rate: 0.10, rateLabel: '10,0% (Restauration)', baseHT: 74.55, tvaAmount: 7.45, totalTTC: 82.00 },
        ],
        tipAmount: 5.00,
        paymentStatus: 'pending',
        status: 'in_kitchen',
        createdAt: new Date(now - 12 * 60000).toISOString(),
        updatedAt: new Date(now - 8 * 60000).toISOString(),
      },
      {
        id: 'CMD-1082',
        tableNumber: 4,
        items: [
          {
            id: 'c-5',
            menuItemId: 'entree-1',
            name: 'Burrata Di Puglia & Tomates Anciennes',
            basePrice: 16.50,
            selectedExtras: [{ id: 'ex-1', name: 'Jambon de Parme AOP 24 mois', price: 4.50 }],
            quantity: 1,
            itemTotal: 21.00,
            tvaRate: 0.10,
            image: INITIAL_MENU[0].image,
          },
          {
            id: 'c-6',
            menuItemId: 'plat-2',
            name: 'Tagliatelles Fraîches à la Truffe Noire & Parmesan',
            basePrice: 26.50,
            selectedExtras: [],
            quantity: 1,
            itemTotal: 26.50,
            tvaRate: 0.10,
            image: INITIAL_MENU[3].image,
          },
        ],
        totalHT: 43.18,
        totalTTC: 47.50,
        tvaDetails: [
          { rate: 0.10, rateLabel: '10,0% (Restauration)', baseHT: 43.18, tvaAmount: 4.32, totalTTC: 47.50 },
        ],
        tipAmount: 0,
        paymentStatus: 'pending',
        status: 'received',
        createdAt: new Date(now - 4 * 60000).toISOString(),
        updatedAt: new Date(now - 4 * 60000).toISOString(),
      },
    ];

    return seeded;
  });

  // Seeded waiter calls
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALLS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'call-1',
        tableNumber: 6,
        reason: 'bill',
        reasonLabel: 'Demande d\'addition (Paiement CB)',
        paymentPreference: 'Carte bancaire',
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      },
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    } catch {
      // ignore
    }
  }, [menu]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(waiterCalls));
    } catch {
      // ignore
    }
  }, [waiterCalls]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(floorTables));
    } catch {
      // ignore
    }
  }, [floorTables]);

  // Live Firestore Real-Time Subscriptions
  useEffect(() => {
    // 1. Orders live sync
    const unsubOrders = subscribeToOrders(remoteOrders => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(prev => {
          const map = new Map<string, Order>();
          remoteOrders.forEach(o => map.set(o.id, o));
          prev.forEach(o => {
            if (!map.has(o.id)) map.set(o.id, o);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    });

    // 2. Waiter Calls live sync
    const unsubCalls = subscribeToWaiterCalls(remoteCalls => {
      if (remoteCalls && remoteCalls.length > 0) {
        setWaiterCalls(remoteCalls);
      }
    });

    // 3. Settings live sync
    const unsubSettings = subscribeToSettings(remoteSettings => {
      if (remoteSettings) {
        setSettings(prev => ({ ...prev, ...remoteSettings }));
      }
    });

    // 4. Inventory live sync
    const unsubInventory = subscribeToInventory(stockMap => {
      if (stockMap && Object.keys(stockMap).length > 0) {
        setMenu(prev =>
          prev.map(item => {
            if (stockMap[item.id]) {
              return {
                ...item,
                stockQuantity: stockMap[item.id].stock,
                isAvailable: stockMap[item.id].isAvailable,
              };
            }
            return item;
          })
        );
      }
    });

    return () => {
      unsubOrders();
      unsubCalls();
      unsubSettings();
      unsubInventory();
    };
  }, []);

  // BroadcastChannel for cross-tab multi-screen real-time synchronization!
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('mon_restaurant_sync');

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'NEW_ORDER') {
        setOrders(prev => [data.order, ...prev.filter(o => o.id !== data.order.id)]);
        if (soundEnabled) soundFx.playKitchenOrderBell();
      } else if (data.type === 'ORDER_UPDATED') {
        setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
      } else if (data.type === 'WAITER_CALL') {
        setWaiterCalls(prev => [data.call, ...prev.filter(c => c.id !== data.call.id)]);
        if (soundEnabled) soundFx.playWaiterCallAlert();
      } else if (data.type === 'CALL_RESOLVED') {
        setWaiterCalls(prev => prev.filter(c => c.id !== data.callId));
      } else if (data.type === 'STOCK_UPDATED') {
        setMenu(prev => prev.map(m => m.id === data.itemId ? { ...m, isAvailable: data.isAvailable, stockQuantity: data.stockQuantity } : m));
      }
    };

    return () => {
      channel.close();
    };
  }, [soundEnabled]);

  const broadcastEvent = (payload: unknown) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('mon_restaurant_sync');
        channel.postMessage(payload);
        channel.close();
      }
    } catch {
      // ignore
    }
  };

  const updateSettings = useCallback((newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      syncSettingsToFirestore(merged);
      return merged;
    });
  }, []);

  const toggleItemAvailability = useCallback((itemId: string) => {
    setMenu(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const nextState = !item.isAvailable;
          updateInventoryItemInFirestore(itemId, item.stockQuantity, nextState);
          broadcastEvent({
            type: 'STOCK_UPDATED',
            itemId,
            isAvailable: nextState,
            stockQuantity: item.stockQuantity,
          });
          return { ...item, isAvailable: nextState };
        }
        return item;
      });
      return updated;
    });
  }, []);

  const updateItemStock = useCallback((itemId: string, qty: number) => {
    setMenu(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(0, qty);
          const isAvail = newQty > 0;
          updateInventoryItemInFirestore(itemId, newQty, isAvail);
          broadcastEvent({
            type: 'STOCK_UPDATED',
            itemId,
            isAvailable: isAvail,
            stockQuantity: newQty,
          });
          return { ...item, stockQuantity: newQty, isAvailable: isAvail };
        }
        return item;
      });
      return updated;
    });
  }, []);

  // Cart operations
  const addToCart = useCallback((item: CartItem) => {
    soundFx.playTactileClick();
    setCart(prev => {
      // Look for identical item with same cooking preference, extras and notes
      const existingIndex = prev.findIndex(ci => 
        ci.menuItemId === item.menuItemId &&
        ci.cookingPreference === item.cookingPreference &&
        ci.specialNotes === item.specialNotes &&
        JSON.stringify(ci.selectedExtras.map(e => e.id).sort()) === JSON.stringify(item.selectedExtras.map(e => e.id).sort())
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const updated = { ...next[existingIndex] };
        updated.quantity += item.quantity;
        const extrasCost = updated.selectedExtras.reduce((acc, e) => acc + e.price, 0);
        updated.itemTotal = (updated.basePrice + extrasCost) * updated.quantity;
        next[existingIndex] = updated;
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const updateCartItemQuantity = useCallback((id: string, delta: number) => {
    soundFx.playTactileClick();
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          const extrasCost = item.selectedExtras.reduce((acc, e) => acc + e.price, 0);
          return {
            ...item,
            quantity: newQty,
            itemTotal: (item.basePrice + extrasCost) * newQty,
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    soundFx.playTactileClick();
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.itemTotal, 0);
  }, [cart]);

  // Order Placement
  const placeOrder = useCallback(({
    tableNumber,
    items,
    tipAmount,
    tipPercentage,
    customerName,
    customerCompany,
    customerEmail,
  }: {
    tableNumber: number;
    items: CartItem[];
    tipAmount: number;
    tipPercentage?: number;
    customerName?: string;
    customerCompany?: string;
    customerEmail?: string;
  }): Order => {
    const { totalHT, totalTTC, tvaDetails } = calculateTVABreakdown(items);
    const newOrderId = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: newOrderId,
      tableNumber,
      items: [...items],
      totalHT,
      totalTTC,
      tvaDetails,
      tipAmount,
      tipPercentage,
      paymentStatus: 'pending',
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: customerName || `Client Table ${tableNumber}`,
      customerCompany,
      customerEmail,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Decrement stock for items
    items.forEach(cartItem => {
      setMenu(prev => prev.map(m => {
        if (m.id === cartItem.menuItemId) {
          const nextStock = Math.max(0, m.stockQuantity - cartItem.quantity);
          return { ...m, stockQuantity: nextStock, isAvailable: nextStock > 0 };
        }
        return m;
      }));
    });

    // Update floor table status
    setFloorTables(prev => prev.map(tbl => {
      if (tbl.id === tableNumber) {
        return { ...tbl, status: 'ordered', currentOrderId: newOrderId };
      }
      return tbl;
    }));

    clearCart();

    // Sound chime, multi-screen sync, and live Firestore sync
    if (soundEnabled) {
      soundFx.playKitchenOrderBell();
    }
    broadcastEvent({ type: 'NEW_ORDER', order: newOrder });
    syncOrderToFirestore(newOrder);

    return newOrder;
  }, [clearCart, soundEnabled]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        };

        if (status === 'ready') {
          if (soundEnabled) soundFx.playKitchenOrderBell();
        } else if (status === 'served') {
          // If table order is completed and paid, mark table free
          if (order.paymentStatus === 'paid') {
            setFloorTables(tables => tables.map(t => t.id === order.tableNumber ? { ...t, status: 'free', currentOrderId: undefined } : t));
          }
        }

        broadcastEvent({ type: 'ORDER_UPDATED', order: updated });
        updateOrderStatusInFirestore(orderId, status);
        return updated;
      }
      return order;
    }));
  }, [soundEnabled]);

  const markOrderPaid = useCallback((orderId: string, method: PaymentMethod, splitDetails?: Order['splitDetails']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const isFullyPaid = !splitDetails || splitDetails.paidShares >= splitDetails.totalShares;
        const updated: Order = {
          ...order,
          paymentStatus: isFullyPaid ? 'paid' : 'split',
          paymentMethod: method,
          splitDetails,
          updatedAt: new Date().toISOString(),
        };

        if (isFullyPaid) {
          if (soundEnabled) soundFx.playSuccessChime();
          // Update table status if served
          setFloorTables(tables => tables.map(t => {
            if (t.id === order.tableNumber) {
              return { ...t, status: order.status === 'served' ? 'free' : 'ordered' };
            }
            return t;
          }));
        }

        broadcastEvent({ type: 'ORDER_UPDATED', order: updated });
        updateOrderStatusInFirestore(orderId, order.status, {
          paymentStatus: updated.paymentStatus,
          paymentMethod: updated.paymentMethod,
          splitDetails: updated.splitDetails,
        });
        return updated;
      }
      return order;
    }));
  }, [soundEnabled]);

  // Find active customer order for current table (non-served or latest)
  const activeCustomerOrder = useMemo(() => {
    const tableOrders = orders.filter(o => o.tableNumber === currentTable);
    if (!tableOrders.length) return null;
    // Prefer pending active orders
    const active = tableOrders.find(o => o.status !== 'served' && o.status !== 'cancelled');
    return active || tableOrders[0];
  }, [orders, currentTable]);

  // Waiter Calls
  const callWaiter = useCallback((reason: WaiterCall['reason'], reasonLabel: string, paymentPreference?: string) => {
    const newCall: WaiterCall = {
      id: `call-${Date.now()}`,
      tableNumber: currentTable,
      reason,
      reasonLabel,
      paymentPreference,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setWaiterCalls(prev => [newCall, ...prev.filter(c => !(c.tableNumber === currentTable && c.reason === reason))]);

    // Update floor table
    setFloorTables(prev => prev.map(tbl => {
      if (tbl.id === currentTable) {
        return { ...tbl, status: reason === 'bill' ? 'bill_requested' : tbl.status, currentWaiterCallId: newCall.id };
      }
      return tbl;
    }));

    if (soundEnabled) soundFx.playWaiterCallAlert();
    broadcastEvent({ type: 'WAITER_CALL', call: newCall });
    syncWaiterCallToFirestore(newCall);
  }, [currentTable, soundEnabled]);

  const resolveWaiterCall = useCallback((callId: string) => {
    setWaiterCalls(prev => {
      const target = prev.find(c => c.id === callId);
      if (target) {
        setFloorTables(tables => tables.map(tbl => {
          if (tbl.id === target.tableNumber) {
            return {
              ...tbl,
              status: tbl.status === 'bill_requested' ? 'occupied' : tbl.status,
              currentWaiterCallId: undefined,
            };
          }
          return tbl;
        }));
      }
      return prev.filter(c => c.id !== callId);
    });

    broadcastEvent({ type: 'CALL_RESOLVED', callId });
    resolveWaiterCallInFirestore(callId);
  }, []);

  const updateTableStatus = useCallback((tableId: number, status: FloorTable['status']) => {
    setFloorTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  }, []);

  return (
    <RestaurantContext.Provider
      value={{
        settings,
        updateSettings,
        menu,
        toggleItemAvailability,
        updateItemStock,
        currentTable,
        setCurrentTable,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        orders,
        placeOrder,
        updateOrderStatus,
        markOrderPaid,
        activeCustomerOrder,
        waiterCalls,
        callWaiter,
        resolveWaiterCall,
        floorTables,
        updateTableStatus,
        soundEnabled,
        setSoundEnabled,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
