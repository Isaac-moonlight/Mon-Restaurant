export type CurrencyType = 'EUR' | 'USD' | 'GBP' | 'CHF';

export type DietaryType = 'vegetarian' | 'vegan' | 'gluten_free' | 'halal';

export type OrderStatus = 'received' | 'in_kitchen' | 'ready' | 'served' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'split';

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'cash' | 'contactless';

export type CookingPreference = 'Bleu' | 'Saignant' | 'À point' | 'Bien cuit';

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'entrees' | 'plats' | 'burgers_viandes' | 'desserts' | 'cocktails_boissons';
  price: number;
  description: string;
  prepTime: string;
  image: string;
  calories?: string;
  tvaRate: 0.055 | 0.10 | 0.20;
  dietary: DietaryType[];
  allergens: string[];
  requiresCooking: boolean;
  availableExtras: ExtraOption[];
  isAvailable: boolean;
  stockQuantity: number;
  isChefSpecial?: boolean;
}

export interface CartItem {
  id: string; // unique instance in cart
  menuItemId: string;
  name: string;
  basePrice: number;
  cookingPreference?: CookingPreference;
  selectedExtras: ExtraOption[];
  specialNotes?: string;
  quantity: number;
  itemTotal: number;
  tvaRate: 0.055 | 0.10 | 0.20;
  image: string;
}

export interface TVABreakdown {
  rate: number;
  rateLabel: string;
  baseHT: number;
  tvaAmount: number;
  totalTTC: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  totalHT: number;
  totalTTC: number;
  tvaDetails: TVABreakdown[];
  tipAmount: number;
  tipPercentage?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerCompany?: string;
  customerEmail?: string;
  splitDetails?: {
    type: 'equal' | 'by_item';
    totalShares: number;
    paidShares: number;
    amountPerShare: number;
  };
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  reason: 'bill' | 'water_bread' | 'assistance' | 'service';
  reasonLabel: string;
  paymentPreference?: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface RestaurantSettings {
  name: string;
  subtitle: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  siret: string;
  vatNumber: string;
  currency: CurrencyType;
  currencySymbol: string;
  tablesCount: number;
  pinCode: string;
  wifiName: string;
  wifiPassword: string;
}

export interface FloorTable {
  id: number;
  name: string;
  seats: number;
  zone: 'salle' | 'terrasse' | 'mezzanine' | 'bar';
  status: 'free' | 'occupied' | 'ordered' | 'bill_requested';
  currentOrderId?: string;
  currentWaiterCallId?: string;
  posX: number;
  posY: number;
  shape: 'round' | 'rect';
}
