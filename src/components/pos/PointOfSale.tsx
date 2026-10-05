import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, CartItem, PaymentMethod } from '../../types/restaurant';
import { formatCurrency, calculateTVABreakdown } from '../../utils/formatters';
import { motion } from 'motion/react';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Split,
  ChefHat,
  Search,
} from 'lucide-react';

interface PointOfSaleProps {
  initialTable?: number;
  onOpenReceipt: (orderId: string) => void;
}

export const PointOfSale: React.FC<PointOfSaleProps> = ({
  initialTable = 1,
  onOpenReceipt,
}) => {
  const { menu, settings, placeOrder, markOrderPaid, theme } = useRestaurant();
  const isDark = theme === 'dark';

  const [selectedTable, setSelectedTable] = useState<number>(initialTable);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [posSearch, setPosSearch] = useState<string>('');

  const [posTicket, setPosTicket] = useState<CartItem[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [splitGuests, setSplitGuests] = useState<number>(1);
  const [cashGiven, setCashGiven] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Tout' },
    { id: 'plats', label: 'Plats' },
    { id: 'burgers_viandes', label: 'Viandes' },
    { id: 'entrees', label: 'Entrées' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'cocktails_boissons', label: 'Boissons' },
  ];

  const filteredDishes = menu.filter(d => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (posSearch.trim() && !d.name.toLowerCase().includes(posSearch.toLowerCase())) return false;
    return true;
  });

  const addItemToTicket = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setPosTicket(prev => {
      const idx = prev.findIndex(p => p.menuItemId === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + 1,
          itemTotal: (next[idx].quantity + 1) * next[idx].basePrice,
        };
        return next;
      }
      const newItem: CartItem = {
        id: `pos-${Date.now()}-${Math.random()}`,
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        selectedExtras: [],
        quantity: 1,
        itemTotal: item.price,
        tvaRate: item.tvaRate,
        image: item.image,
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setPosTicket(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.basePrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const { totalHT, totalTTC, tvaDetails } = calculateTVABreakdown(posTicket);
  const grandTotal = totalTTC + tipAmount;
  const splitAmount = splitGuests > 1 ? grandTotal / splitGuests : grandTotal;

  const cashAmountNum = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashAmountNum - grandTotal);

  const handleSendToKitchen = () => {
    if (posTicket.length === 0) return;
    placeOrder({
      tableNumber: selectedTable,
      items: posTicket,
      tipAmount,
      customerName: `Table ${selectedTable} (Caisse)`,
    });
    setPosTicket([]);
  };

  const handleQuickPay = (method: PaymentMethod) => {
    if (posTicket.length === 0) return;
    const order = placeOrder({
      tableNumber: selectedTable,
      items: posTicket,
      tipAmount,
      customerName: `Table ${selectedTable} (Caisse)`,
    });
    markOrderPaid(order.id, method, splitGuests > 1 ? {
      type: 'equal',
      totalShares: splitGuests,
      paidShares: splitGuests,
      amountPerShare: splitAmount,
    } : undefined);

    setPosTicket([]);
    onOpenReceipt(order.id);
  };

  return (
    <div className={`min-h-screen flex flex-col p-4 sm:p-6 space-y-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-b from-[#0b0e14] via-[#10141f] to-[#080a0e] text-slate-100' 
        : 'bg-gradient-to-b from-[#faf6f0] via-[#f3ebe1] to-[#e8decb] text-slate-800'
    }`}>
      {/* POS Top Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
            <Utensils className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Terminal de Caisse (POS)
            </h2>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Saisie directe en salle, encaissement multi-moyens et ventilation fiscale.
            </p>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className={`text-xs font-bold uppercase tracking-wider pr-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Table active :
          </span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 15].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTable(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono-numbers transition-all ${
                selectedTable === t
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isDark
                  ? 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              T{t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Menu Catalog (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={posSearch}
                onChange={e => setPosSearch(e.target.value)}
                placeholder="Rechercher un plat..."
                className={`w-full pl-10 pr-3 py-2.5 rounded-2xl border text-xs focus:outline-none shadow-sm transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-amber-400'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : isDark
                      ? 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dish Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[600px] overflow-y-auto no-scrollbar p-1">
            {filteredDishes.map(dish => {
              const is86 = !dish.isAvailable;
              return (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  key={dish.id}
                  disabled={is86}
                  onClick={() => addItemToTicket(dish)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all group relative overflow-hidden shadow-sm ${
                    is86
                      ? 'opacity-40 cursor-not-allowed bg-slate-800/20 border-slate-700'
                      : isDark
                      ? 'bg-[#141824] border-white/10 hover:border-amber-400/50 hover:shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-900 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                    />
                    <span className={`text-xs font-mono font-black ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                      {formatCurrency(dish.price, settings.currency)}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-xs font-black transition-colors line-clamp-2 leading-tight ${
                      isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-800'
                    }`}>
                      {dish.name}
                    </h4>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{dish.category}</span>
                      {is86 && <span className="text-rose-400 font-bold">86 Épuisé</span>}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket & Checkout (Cols 8-12) */}
        <div className={`lg:col-span-5 p-5 rounded-[32px] border backdrop-blur-xl shadow-xl space-y-5 ${
          isDark ? 'bg-[#121622]/90 border-white/10' : 'bg-white/85 border-white'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-white/10' : 'border-slate-100'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Table {selectedTable}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  Ticket Caisse
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {posTicket.length} article(s) sur le bon
              </p>
            </div>

            {posTicket.length > 0 && (
              <button
                onClick={() => setPosTicket([])}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                title="Vider la note"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            )}
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
            {posTicket.length === 0 ? (
              <div className={`text-center py-10 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Touchez un plat à gauche pour l'ajouter au bon de commande.
              </div>
            ) : (
              posTicket.map(item => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isDark 
                      ? 'bg-white/5 border-white/5 text-slate-200' 
                      : 'bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      TVA {(item.tvaRate * 100).toFixed(0)}% · {formatCurrency(item.basePrice, settings.currency)}/u
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                        isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`w-4 text-center font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                        isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className={`font-mono font-bold w-16 text-right ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                    {formatCurrency(item.itemTotal, settings.currency)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Split Bill Option */}
          {posTicket.length > 0 && (
            <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className={`flex items-center gap-2 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Split className="w-4 h-4 text-cyan-400" />
                <span>Partage de note :</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSplitGuests(g => Math.max(1, g - 1))}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                    isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{splitGuests}p</span>
                <button
                  onClick={() => setSplitGuests(g => Math.min(10, g + 1))}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                    isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Financial Breakdown */}
          {posTicket.length > 0 && (
            <div className={`p-3.5 rounded-2xl border space-y-1.5 text-xs ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex justify-between text-slate-400">
                <span>Total HT</span>
                <span className="font-mono">{formatCurrency(totalHT, settings.currency)}</span>
              </div>
              {tvaDetails.map(t => (
                <div key={t.rate} className="flex justify-between text-slate-500 pl-2">
                  <span>TVA {t.rateLabel}</span>
                  <span className="font-mono">+{formatCurrency(t.tvaAmount, settings.currency)}</span>
                </div>
              ))}
              <div className={`pt-2 border-t flex justify-between text-sm font-black ${
                isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'
              }`}>
                <span>Total TTC</span>
                <span className={`font-mono text-base ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                  {formatCurrency(grandTotal, settings.currency)}
                </span>
              </div>
              {splitGuests > 1 && (
                <div className="flex justify-between text-cyan-400 font-bold pt-1">
                  <span>Par convive ({splitGuests} pers.)</span>
                  <span className="font-mono">{formatCurrency(splitAmount, settings.currency)}</span>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={posTicket.length === 0}
              onClick={handleSendToKitchen}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <ChefHat className="w-4 h-4 stroke-[2.5]" />
              <span>Envoyer en Cuisine (KDS)</span>
            </motion.button>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={posTicket.length === 0}
                onClick={() => handleQuickPay('card')}
                className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Paiement CB</span>
              </button>

              <button
                disabled={posTicket.length === 0}
                onClick={() => handleQuickPay('cash')}
                className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Espèces & Facture</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
