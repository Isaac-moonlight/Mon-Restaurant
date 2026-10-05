import React, { useState } from 'react';
import { MenuItem, CookingPreference, ExtraOption } from '../../types/restaurant';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency } from '../../utils/formatters';
import { ChevronLeft, MoreVertical, Clock, Flame, ShieldAlert, Check, Plus, Minus, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DishDetailModalProps {
  item: MenuItem;
  onClose: () => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ item, onClose }) => {
  const { addToCart, settings, theme } = useRestaurant();
  const isDark = theme === 'dark';

  const [cooking, setCooking] = useState<CookingPreference | undefined>(
    item.requiresCooking ? 'À point' : undefined
  );
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras(prev => {
      const exists = prev.some(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      }
      return [...prev, extra];
    });
  };

  const extrasSum = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = item.price + extrasSum;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    setAddedAnimation(true);
    addToCart({
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      cookingPreference: cooking,
      selectedExtras,
      specialNotes: specialNotes.trim() || undefined,
      quantity,
      itemTotal: totalPrice,
      tvaRate: item.tvaRate,
      image: item.image,
    });

    setTimeout(() => {
      onClose();
    }, 400);
  };

  const cookingOptions: CookingPreference[] = ['Bleu', 'Saignant', 'À point', 'Bien cuit'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md transition-opacity">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full sm:max-w-md h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-[40px] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] relative border transition-colors ${
          isDark 
            ? 'bg-gradient-to-b from-[#141824] via-[#10141f] to-[#0c0f17] border-white/10 text-white' 
            : 'bg-gradient-to-b from-[#fbf8f2] via-[#f5ede1] to-[#eedfcc] border-white/70 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Floating background basil leaves */}
        <div className="pointer-events-none absolute -top-4 -right-4 w-20 h-20 opacity-70 animate-float-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-600/70 drop-shadow-md">
            <path d="M50 10 C20 30 10 70 50 90 C90 70 80 30 50 10 Z" />
            <path d="M50 10 Q50 50 50 90" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="pointer-events-none absolute top-1/2 -left-6 w-16 h-16 opacity-50 animate-float-gentle">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/60 rotate-45">
            <path d="M50 15 C25 35 15 65 50 85 C85 65 75 35 50 15 Z" />
          </svg>
        </div>

        {/* Top App Bar with back button (<) and menu dots (···) */}
        <div className="pt-4 pb-2 px-6 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-all active:scale-90 ${
              isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white/70 text-slate-800 hover:bg-white'
            }`}
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Détails Gourmands
          </div>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm backdrop-blur-md transition-all active:scale-90 ${
              isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white/70 text-slate-800 hover:bg-white'
            }`}
            aria-label="Favoris"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar space-y-5">
          {/* Giant Floating Circular Plate */}
          <div className="relative flex justify-center py-4">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2"
            >
              <div className="w-full h-full rounded-full overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-4 ring-white/60 bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {item.isChefSpecial && (
                <div className="absolute top-2 right-4 bg-[#121418] text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Coup de cœur</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Dish Header Info */}
          <div className="space-y-2 text-left">
            <div className="flex items-start justify-between gap-3">
              <h2 className={`text-2xl font-black tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.name}
              </h2>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 shadow-sm border ${
                isDark ? 'bg-white/10 text-amber-300 border-white/10' : 'bg-white/60 text-slate-700 border-white/80'
              }`}>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{item.prepTime}</span>
              </div>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.description}
            </p>

            {/* Clean unboxed metadata */}
            <div className={`flex flex-wrap items-center gap-2 pt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.calories && (
                <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  {item.calories}
                </span>
              )}
              {item.calories && <span>·</span>}
              {item.dietary.includes('vegetarian') && <span>Végétarien</span>}
              {item.dietary.includes('vegan') && <span>Végan</span>}
              {item.dietary.includes('gluten_free') && <span>Sans Gluten</span>}
              {item.dietary.includes('halal') && <span>Viande Halal</span>}
              <span>·</span>
              <span className="text-emerald-500 font-medium">TVA incluse</span>
            </div>

            {/* EU 14 Allergens alert if present */}
            {item.allergens.length > 0 && (
              <div className={`mt-2 p-2.5 rounded-2xl border flex items-start gap-2 text-xs ${
                isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-500/10 border-amber-500/20 text-amber-900'
              }`}>
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className={`font-semibold ${isDark ? 'text-amber-100' : 'text-amber-950'}`}>Allergènes : </span>
                  {item.allergens.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Cooking choice if meat/burger */}
          {item.requiresCooking && (
            <div className="space-y-2 pt-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Cuisson souhaitée
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cookingOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCooking(option)}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold transition-all ${
                      cooking === option
                        ? isDark ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-[#121418] text-white shadow-md'
                        : isDark
                        ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-white/70 border border-white/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paid Extras */}
          {item.availableExtras.length > 0 && (
            <div className="space-y-2 pt-1">
              <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Suppléments & Accompagnements
              </label>
              <div className="space-y-2">
                {item.availableExtras.map(extra => {
                  const checked = selectedExtras.some(e => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        checked
                          ? isDark ? 'bg-amber-500/20 border-amber-500/50 text-white' : 'bg-amber-500/15 border-amber-500/40 text-slate-900'
                          : isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white/60 border-white/70 text-slate-700 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                            checked
                              ? isDark ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#121418] border-[#121418] text-white'
                              : isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{extra.name}</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                        +{formatCurrency(extra.price, settings.currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Brigade instructions */}
          <div className="space-y-1.5 pt-1">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Instructions spéciales brigade
            </label>
            <input
              type="text"
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              placeholder="Ex: Sauce à part, sans sel ajouté..."
              className={`w-full px-4 py-2.5 rounded-2xl border text-xs placeholder-slate-400 focus:outline-none transition-colors shadow-sm ${
                isDark 
                  ? 'bg-white/10 border-white/15 text-white focus:border-amber-400' 
                  : 'bg-white/70 border-white/80 text-slate-900 focus:border-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Bottom Actions Bar (Matches the uploaded reference mock) */}
        <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#10131d] border-white/10' : 'bg-white/80 border-white/70'
        }`}>
          {/* Total Price */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Price</div>
            <div className={`text-xl sm:text-2xl font-black font-mono-numbers ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
              {formatCurrency(totalPrice, settings.currency)}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quantity Stepper */}
            <div className={`flex items-center border rounded-full p-1 shadow-sm ${
              isDark ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`w-7 text-center font-bold text-xs font-mono-numbers ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Favorite rounded button */}
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-sm transition-all active:scale-90 ${
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : isDark
                  ? 'bg-white/10 border-white/10 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-black'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Asymmetric pill Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center gap-2 active:scale-95 transition-all"
            >
              <span>{addedAnimation ? 'Ajouté ✓' : 'Add to Cart'}</span>
              <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center font-black">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
