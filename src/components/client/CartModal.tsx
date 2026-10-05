import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, calculateTVABreakdown } from '../../utils/formatters';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  Split,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartModalProps {
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({ onClose, onOrderPlaced }) => {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    currentTable,
    settings,
    theme,
  } = useRestaurant();

  const isDark = theme === 'dark';

  // Tips state
  const [tipPercent, setTipPercent] = useState<number | null>(10);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);

  // Split bill
  const [splitGuests, setSplitGuests] = useState<number>(1);
  const [showSplitDrawer, setShowSplitDrawer] = useState<boolean>(false);

  // Payment simulation state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'apple_pay' | 'contactless'>('card');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Customer notes
  const [customerName, setCustomerName] = useState<string>('');

  const { totalHT, totalTTC, tvaDetails } = calculateTVABreakdown(cart);

  let calculatedTip = 0;
  if (isCustomTip) {
    calculatedTip = parseFloat(customTip) || 0;
  } else if (tipPercent !== null) {
    calculatedTip = Math.round((totalTTC * (tipPercent / 100)) * 100) / 100;
  }

  const grandTotal = totalTTC + calculatedTip;
  const splitAmount = splitGuests > 1 ? grandTotal / splitGuests : grandTotal;

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const order = placeOrder({
        tableNumber: currentTable,
        items: cart,
        tipAmount: calculatedTip,
        tipPercentage: isCustomTip ? undefined : (tipPercent || undefined),
        customerName: customerName.trim() || undefined,
      });

      setIsSubmitting(false);
      onOrderPlaced(order.id);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full sm:max-w-lg border rounded-t-[40px] sm:rounded-[40px] max-h-[94vh] flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isDark 
            ? 'bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0c0f17] border-white/10 text-white' 
            : 'bg-gradient-to-b from-[#fdfbf7] via-[#f7f0e5] to-[#f0e4d4] border-white/80 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-white/70'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Mon Panier Gourmand
              </h2>
              <span className="text-xs bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                Table {currentTable}
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {cart.length} {cart.length > 1 ? 'articles sélectionnés' : 'article sélectionné'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-500 flex items-center gap-1 p-2 font-medium"
                title="Vider le panier"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vider</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                isDark 
                  ? 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white' 
                  : 'bg-white/70 hover:bg-white text-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 shadow-sm flex items-center justify-center mx-auto text-2xl">
                🍽️
              </div>
              <p className="font-bold">Votre panier est encore vide</p>
              <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Explorez notre sélection de plats frais, desserts et cocktails gourmands.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-md"
              >
                Découvrir la carte
              </button>
            </div>
          ) : (
            <>
              {/* Aggressive Reward Progress Bar */}
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50/90 border-amber-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-black mb-1.5">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Perk Chef Exclusif</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-500">
                    {grandTotal >= 45 ? '🎉 Débloqué !' : `Encore ${(45 - grandTotal).toFixed(2)}€`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/50 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (grandTotal / 45) * 100)}%` }}
                  />
                </div>
                <p className={`text-[10px] mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {grandTotal >= 45
                    ? '✨ Votre commande inclut l’infusion gourmande ou digestif offert de la brigade !'
                    : 'Atteignez 45€ pour recevoir l’infusion digestive artisanale offerte.'}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cart.map(item => (
                  <motion.div
                    layout
                    key={item.id}
                    className={`p-3.5 rounded-[24px] border shadow-sm flex gap-3.5 items-center ${
                      isDark 
                        ? 'bg-white/5 border-white/5 text-white' 
                        : 'bg-white/90 border-white text-slate-900'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover shadow-sm shrink-0 gourmet-plate-img"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-extrabold truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                          title="Supprimer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-0.5 mt-0.5">
                        {item.cookingPreference && (
                          <div className="text-amber-400 font-semibold">
                            Cuisson : {item.cookingPreference}
                          </div>
                        )}
                        {item.selectedExtras.length > 0 && (
                          <div className="truncate text-slate-400">
                            + {item.selectedExtras.map(e => e.name).join(', ')}
                          </div>
                        )}
                        {item.specialNotes && (
                          <div className="italic text-slate-400 truncate">
                            « {item.specialNotes} »
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center justify-between mt-2 pt-1 border-t ${
                        isDark ? 'border-white/10' : 'border-slate-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, -1)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                              isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center font-bold text-xs font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, 1)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                              isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className={`font-mono font-black text-xs sm:text-sm ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                          {formatCurrency(item.itemTotal, settings.currency)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tips Module */}
              <div className={`p-4 rounded-[28px] border space-y-3 ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <HeartHandshake className="w-4 h-4 text-amber-500" />
                    <span>Pourboire brigade & salle</span>
                  </div>
                  {calculatedTip > 0 && (
                    <span className="font-mono font-bold text-amber-500">
                      +{formatCurrency(calculatedTip, settings.currency)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: 'Non', val: null },
                    { label: '5%', val: 5 },
                    { label: '10%', val: 10 },
                    { label: '15%', val: 15 },
                    { label: '20%', val: 20 },
                  ].map(opt => {
                    const active = !isCustomTip && tipPercent === opt.val;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setIsCustomTip(false);
                          setTipPercent(opt.val);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : isDark
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Financial Recap with TVA */}
              <div className={`p-4 rounded-[28px] border space-y-1.5 text-xs ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-white'
              }`}>
                <div className="flex justify-between text-slate-400">
                  <span>Sous-total HT</span>
                  <span className="font-mono">{formatCurrency(totalHT, settings.currency)}</span>
                </div>

                {tvaDetails.map(t => (
                  <div key={t.rate} className="flex justify-between text-slate-500 pl-2">
                    <span>TVA {t.rateLabel}</span>
                    <span className="font-mono">+{formatCurrency(t.tvaAmount, settings.currency)}</span>
                  </div>
                ))}

                {calculatedTip > 0 && (
                  <div className="flex justify-between text-amber-500 font-semibold">
                    <span>Pourboire service</span>
                    <span className="font-mono">+{formatCurrency(calculatedTip, settings.currency)}</span>
                  </div>
                )}

                <div className={`pt-2 border-t flex justify-between text-sm font-black ${
                  isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'
                }`}>
                  <span>Total TTC</span>
                  <span className={`font-mono text-base ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                    {formatCurrency(grandTotal, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Methods Simulation */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Moyen de règlement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('apple_pay')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedPaymentMethod === 'apple_pay'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                        : isDark
                        ? 'bg-white/5 border-white/5 text-slate-300'
                        : 'bg-white/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">Apple / Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedPaymentMethod === 'card'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                        : isDark
                        ? 'bg-white/5 border-white/5 text-slate-300'
                        : 'bg-white/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">Carte Bancaire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('contactless')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedPaymentMethod === 'contactless'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                        : isDark
                        ? 'bg-white/5 border-white/5 text-slate-300'
                        : 'bg-white/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">À table / Caisse</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aggressive Sticky Bottom CTA */}
        {cart.length > 0 && (
          <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
            isDark ? 'bg-[#10131d] border-white/10' : 'bg-white/95 border-slate-200'
          }`}>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Total TTC</div>
              <div className={`text-xl sm:text-2xl font-black font-mono-numbers ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                {formatCurrency(grandTotal, settings.currency)}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSendOrder}
              disabled={isSubmitting}
              className="flex-1 max-w-[270px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 border border-amber-300 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Envoi brigade...' : 'Commander & Payer'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
