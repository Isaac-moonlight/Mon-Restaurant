import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MenuItem, DietaryType } from '../../types/restaurant';
import { formatCurrency, getElapsedMinutes } from '../../utils/formatters';
import { DishDetailModal } from './DishDetailModal';
import { CartModal } from './CartModal';
import { OrderStatusModal } from './OrderStatusModal';
import { WaiterCallModal } from './WaiterCallModal';
import { TableWelcomeModal } from './TableWelcomeModal';
import { FloatingLeaves } from '../common/FloatingLeaves';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  BellRing,
  Clock,
  Sparkles,
  Flame,
  ChefHat,
  Filter,
  Check,
  MapPin,
  Utensils,
  Wine,
  Coffee,
  X,
  Heart,
  Home,
  Receipt,
  User,
  Menu,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { RestaurantLogo } from '../common/RestaurantLogo';

interface ClientMobileMenuProps {
  onOpenStaffPortal: () => void;
}

export const ClientMobileMenu: React.FC<ClientMobileMenuProps> = ({ onOpenStaffPortal }) => {
  const {
    settings,
    menu,
    currentTable,
    setCurrentTable,
    cart,
    cartTotal,
    activeCustomerOrder,
    theme,
    toggleTheme,
  } = useRestaurant();

  // Mandatory Table Welcome selection
  const [hasConfirmedTable, setHasConfirmedTable] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('table') || params.get('t')) return true;
      return Boolean(localStorage.getItem('mon_resto_table_confirmed'));
    }
    return false;
  });

  // Modals
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showOrderStatus, setShowOrderStatus] = useState<boolean>(false);
  const [showWaiterCall, setShowWaiterCall] = useState<boolean>(false);
  const [showTablePicker, setShowTablePicker] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Categories with clear, unambiguous labels
  const categories = [
    { id: 'all', label: 'Tout le menu', sub: 'Tous nos plats', icon: Sparkles },
    { id: 'plats', label: 'Poulet & Plats', sub: 'Spécialités maison', icon: Utensils },
    { id: 'burgers_viandes', label: 'Viandes & Grill', sub: 'Aubrac & Wagyu', icon: Flame },
    { id: 'entrees', label: 'Entrées & Salades', sub: 'Bowls fraîcheur', icon: ChefHat },
    { id: 'cocktails_boissons', label: 'Boissons & Cocktails', sub: 'Vins & créations', icon: Wine },
    { id: 'desserts', label: 'Desserts & Sucré', sub: 'Gourmandises', icon: Coffee },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDietary, setActiveDietary] = useState<DietaryType[]>([]);

  // Secret triple click on logo
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 3) {
      setLogoClicks(0);
      onOpenStaffPortal();
    } else {
      setLogoClicks(next);
      setTimeout(() => setLogoClicks(0), 1200);
    }
  };

  const toggleDietaryFilter = (diet: DietaryType) => {
    setActiveDietary(prev =>
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      if (activeDietary.length > 0) {
        const matchesAll = activeDietary.every(d => item.dietary.includes(d));
        if (!matchesAll) return false;
      }
      return true;
    });
  }, [menu, selectedCategory, searchQuery, activeDietary]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const heroDish = useMemo(() => {
    return menu.find(m => m.id === 'plat-bbq-chicken') || menu[0];
  }, [menu]);

  const specialsDish = useMemo(() => {
    return menu.find(m => m.id === 'entree-eggs-curry') || menu[1];
  }, [menu]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-900 relative overflow-x-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-b from-[#0f1118] via-[#141722] to-[#0c0e14] text-slate-100' 
        : 'bg-gradient-to-b from-[#faf6f0] via-[#f3ebe1] to-[#e8decb] text-slate-800'
    }`}>
      {/* Floating leaves */}
      <FloatingLeaves />

      {/* Mandatory Table Selection Gate at startup */}
      {!hasConfirmedTable && (
        <TableWelcomeModal
          onConfirmed={() => {
            setHasConfirmedTable(true);
            try {
              localStorage.setItem('mon_resto_table_confirmed', 'true');
            } catch {
              // ignore
            }
          }}
        />
      )}

      {/* Top Mobile Bar */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-4 sm:px-6 py-3.5 transition-all shadow-sm ${
        isDark 
          ? 'bg-[#10131b]/85 border-white/10' 
          : 'bg-[#faf6f0]/85 border-white/60'
      }`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Left Table Selector Pill */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowTablePicker(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-black shadow-sm transition-all ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                  : 'bg-white/80 hover:bg-white border-white/90 text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Table {currentTable}</span>
            </motion.button>

            {/* Dark / Light Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                isDark 
                  ? 'bg-white/10 border-white/10 text-amber-300 hover:bg-white/15' 
                  : 'bg-white/80 border-white/90 text-slate-700 hover:bg-white'
              }`}
              title={isDark ? 'Passer en mode lumineux' : 'Passer en mode sombre'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Brand Wordmark with Real Logo (Triple-click secret trigger) */}
          <div
            onClick={handleLogoClick}
            className="cursor-pointer select-none flex items-center gap-2.5 group"
            title="Mon Restaurant"
          >
            <RestaurantLogo size="sm" isDark={isDark} />
            <div className="text-left">
              <motion.h1 
                whileHover={{ scale: 1.02 }}
                className={`font-serif-luxury text-base font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                {settings.name}
              </motion.h1>
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                {settings.subtitle}
              </div>
            </div>
          </div>

          {/* Right Floating Cart with animated badge */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowCart(true)}
            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
              totalCartCount > 0 
                ? 'bg-amber-500 text-slate-950 font-bold ring-4 ring-amber-500/25' 
                : isDark ? 'bg-white/15 text-white' : 'bg-[#14171d] text-white'
            }`}
            aria-label="Panier"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                {totalCartCount}
              </span>
            )}
          </motion.button>
        </div>
      </header>

      {/* 
        AGGRESSIVE LIVE ORDER TRACKING BANNER
        Pulsing and animated at the top when active order exists
      */}
      {activeCustomerOrder && (
        <div className="max-w-2xl mx-auto w-full px-4 pt-3 z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowOrderStatus(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/20 flex items-center justify-between gap-3 cursor-pointer group hover:scale-[1.01] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
                <ChefHat className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                  <span>Commande {activeCustomerOrder.id}</span>
                  <span>·</span>
                  <span className="bg-slate-950 text-white px-2 py-0.2 rounded-md text-[10px]">
                    {activeCustomerOrder.status === 'in_kitchen' ? 'En cuisson' : activeCustomerOrder.status === 'ready' ? 'Prête au passe !' : 'Enregistrée'}
                  </span>
                </div>
                <div className="text-[11px] font-medium opacity-90 mt-0.5">
                  Table {currentTable} · Il y a {getElapsedMinutes(activeCustomerOrder.createdAt)} min
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 font-black text-xs bg-slate-950/15 px-3 py-1.5 rounded-xl group-hover:bg-slate-950/25 transition-colors">
              <span>Suivre en direct</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-5 pb-44 space-y-8 relative z-10">
        {/* CLAUDE-STYLE HERO SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 240 }}
          className={`relative rounded-[36px] p-6 sm:p-8 border shadow-xl backdrop-blur-xl overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-br from-[#161a25]/90 via-[#131620]/80 to-[#10121b]/85 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
              : 'bg-gradient-to-br from-white/90 via-white/80 to-[#f6ecde]/85 border-white shadow-[0_20px_50px_rgba(180,150,130,0.18)]'
          }`}
        >
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14171d] text-amber-300 text-[11px] font-bold shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chef Signature · Fait Maison</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                Delicious & Healthy Food
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`text-xs sm:text-sm leading-relaxed font-normal ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                Découvrez notre carte gourmande cuisinée à la minute avec des produits frais, locaux et labellisés.
              </motion.p>

              {heroDish && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3"
                >
                  <button
                    onClick={() => setSelectedDish(heroDish)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <span>Découvrir le {heroDish.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className={`font-mono font-black text-sm ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                    {formatCurrency(heroDish.price, settings.currency)}
                  </span>
                </motion.div>
              )}

              {/* Quick section shortcuts inside intro hero (Axwevi / modern style) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="pt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap"
              >
                {[
                  { id: 'plats', label: 'Spécialités' },
                  { id: 'burgers_viandes', label: 'Grillades' },
                  { id: 'cocktails_boissons', label: 'Cocktails' },
                  { id: 'desserts', label: 'Desserts' },
                ].map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => {
                      setSelectedCategory(badge.id);
                      const el = document.getElementById('carte-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all active:scale-90 ${
                      selectedCategory === badge.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : isDark
                        ? 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
                        : 'bg-white/80 text-slate-700 border-white hover:bg-white'
                    }`}
                  >
                    {badge.label}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Rotating Hero Plate with softened filter */}
            {heroDish && (
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                onClick={() => setSelectedDish(heroDish)}
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full cursor-pointer shrink-0"
              >
                <div className="w-full h-full rounded-full overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.28)] ring-4 ring-white/90 bg-white">
                  <img
                    src={heroDish.image}
                    alt={heroDish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover gourmet-plate-img hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-2 right-4 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Plat Vedette
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un plat, ingrédient ou saveur..."
            className={`w-full pl-11 pr-10 py-3.5 rounded-2xl border text-sm placeholder-slate-400 focus:outline-none transition-colors shadow-sm ${
              isDark
                ? 'bg-white/5 border-white/10 text-white focus:border-amber-400'
                : 'bg-white/80 border-white text-slate-900 focus:border-slate-800'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Carousel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Explorer par Catégorie
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {filteredMenu.length} plats disponibles
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const CatIcon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-xl shadow-amber-500/20 scale-105'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white border-white/80 shadow-sm'
                  }`}
                >
                  <CatIcon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-500'}`} />
                  <span className="text-xs font-bold">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dietary Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">
            Régimes :
          </span>
          {[
            { id: 'vegetarian', label: 'Végétarien' },
            { id: 'vegan', label: 'Végan' },
            { id: 'gluten_free', label: 'Sans Gluten' },
            { id: 'halal', label: 'Halal' },
          ].map(diet => {
            const active = activeDietary.includes(diet.id as DietaryType);
            return (
              <button
                key={diet.id}
                onClick={() => toggleDietaryFilter(diet.id as DietaryType)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border shrink-0 ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    : 'bg-white/70 border-white text-slate-600 hover:bg-white'
                }`}
              >
                {active && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                {diet.label}
              </button>
            );
          })}
        </div>

        {/* Spacious Dishes Grid */}
        <div id="carte-section" className="space-y-6 pt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {categories.find(c => c.id === selectedCategory)?.label || 'Notre Carte'}
            </h3>
            <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              {filteredMenu.length} créations
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-14 sm:gap-16 pt-16 sm:pt-20"
            >
              {filteredMenu.length === 0 ? (
                <div className={`col-span-full text-center py-16 rounded-[32px] border p-6 space-y-2 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'
                }`}>
                  <p className="font-bold">Aucun plat ne correspond à vos filtres</p>
                  <p className="text-xs text-slate-500">Essayez de réinitialiser vos critères de recherche.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setActiveDietary([]);
                    }}
                    className="mt-3 px-5 py-2 rounded-full bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                filteredMenu.map((dish, idx) => {
                  const is86 = !dish.isAvailable;
                  const isFav = favorites[dish.id];

                  return (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => !is86 && setSelectedDish(dish)}
                      className={`group relative rounded-[40px] border p-6 sm:p-7 pt-24 sm:pt-28 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-2 active:scale-[0.98] ${
                        isDark 
                          ? 'bg-[#151922]/90 border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.6)]' 
                          : 'bg-white/90 backdrop-blur-xl border-white shadow-[0_15px_35px_rgba(180,150,130,0.12)] hover:shadow-[0_25px_50px_rgba(180,150,130,0.22)]'
                      } ${is86 ? 'opacity-55 cursor-not-allowed filter grayscale-[40%]' : ''}`}
                    >
                      {/* Floating Plate with softened image filter and generous breathing room */}
                      <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 w-32 h-32 sm:w-36 sm:h-36 rounded-full pointer-events-none">
                        <motion.div
                          whileHover={{ scale: 1.08, rotate: 2 }}
                          className="w-full h-full rounded-full overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_32px_rgba(0,0,0,0.45)] ring-4 ring-white/95 dark:ring-white/20 bg-white"
                        >
                          <img
                            src={dish.image}
                            alt={dish.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover gourmet-plate-img"
                          />
                        </motion.div>

                        {dish.isChefSpecial && !is86 && (
                          <div className="absolute -top-1 right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                            Chef
                          </div>
                        )}

                        {is86 && (
                          <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] font-black text-rose-300 uppercase">
                              86 Épuisé
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dish Information */}
                      <div className="space-y-2 mt-2">
                        <h4 className={`text-base font-black leading-snug transition-colors ${
                          isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-amber-800'
                        }`}>
                          {dish.name}
                        </h4>

                        <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {dish.description}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{dish.prepTime}</span>
                          {dish.calories && <span>·</span>}
                          {dish.calories && <span>{dish.calories}</span>}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className={`flex items-center justify-between pt-4 mt-4 border-t ${
                        isDark ? 'border-white/10' : 'border-slate-100'
                      }`}>
                        <span className={`text-lg font-black font-mono-numbers ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(dish.price, settings.currency)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(dish.id, e)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 border shadow-sm ${
                              isFav
                                ? 'bg-rose-50 border-rose-200 text-rose-500'
                                : isDark
                                ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-black'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                          </button>

                          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center transition-colors shadow-md">
                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Suggestion de la Brigade Banner */}
        {specialsDish && (
          <div className="space-y-3 pt-6">
            <div className="flex items-center justify-between px-1">
              <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Suggestion de la Brigade
              </h3>
              <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                Assiette Recommandée
              </span>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDish(specialsDish)}
              className={`relative p-6 rounded-[36px] border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer overflow-hidden ${
                isDark 
                  ? 'bg-[#151922]/90 border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.5)]' 
                  : 'bg-white/85 backdrop-blur-xl border-white shadow-[0_20px_45px_rgba(180,150,130,0.15)]'
              }`}
            >
              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <div className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Spécialité du jour
                </div>
                <h4 className={`text-xl font-black leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {specialsDish.name}
                </h4>
                <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {specialsDish.description}
                </p>
                <div className={`text-xl font-black font-mono-numbers pt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatCurrency(specialsDish.price, settings.currency)}
                </div>
              </div>

              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.25)] ring-4 ring-white/80 bg-white">
                  <img
                    src={specialsDish.image}
                    alt={specialsDish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover gourmet-plate-img"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer with stealthy staff trigger */}
        <footer className="pt-10 pb-4 text-center text-xs text-slate-500 select-none space-y-1">
          <div>© 2026 {settings.name} · Tous droits réservés</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>Bistronomie & Circuits Courts</span>
            <button
              onClick={onOpenStaffPortal}
              className="w-1.5 h-1.5 rounded-full bg-slate-400/30 hover:bg-slate-400 cursor-pointer inline-block ml-1 transition-colors"
              title="·"
              aria-label="·"
            />
          </div>
        </footer>
      </main>

      {/* 
        AGGRESSIVE FLOATING BOTTOM BAR (When Cart has items)
        Sticky bar positioned right above the navigation dock!
      */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCart(true)}
              className="pointer-events-auto w-full max-w-md py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-2xl shadow-amber-500/30 border border-amber-300 flex items-center justify-between gap-3 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center text-xs">
                  {totalCartCount}
                </span>
                <span>Voir mon panier</span>
              </div>

              <div className="flex items-center gap-2 font-mono-numbers">
                <span className="font-extrabold text-sm sm:text-base">
                  {formatCurrency(cartTotal, settings.currency)}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Dock */}
      <nav className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-[#14171d] text-white rounded-full py-3.5 px-6 sm:px-8 shadow-[0_20px_45px_rgba(0,0,0,0.35)] flex items-center justify-around gap-8 border border-white/10"
        >
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="p-1 text-amber-300 hover:text-white transition-colors"
            title="Menu"
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            onClick={() => setShowOrderStatus(true)}
            className="relative p-1 text-slate-300 hover:text-white transition-colors"
            title="Suivi de commande"
          >
            <Receipt className="w-5 h-5 stroke-[2]" />
            {activeCustomerOrder && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setShowWaiterCall(true)}
            className="p-1 text-slate-300 hover:text-amber-300 transition-colors"
            title="Appel Serveur"
          >
            <BellRing className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            onClick={() => setShowTablePicker(true)}
            className="p-1 text-slate-300 hover:text-white transition-colors"
            title="Changer de Table"
          >
            <User className="w-5 h-5 stroke-[2]" />
          </button>
        </motion.div>
      </nav>

      {/* Modals */}
      {selectedDish && (
        <DishDetailModal
          item={selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}

      {showCart && (
        <CartModal
          onClose={() => setShowCart(false)}
          onOrderPlaced={() => {
            setShowCart(false);
            setShowOrderStatus(true);
          }}
        />
      )}

      {showOrderStatus && (
        <OrderStatusModal
          onClose={() => setShowOrderStatus(false)}
          onOpenWaiterCall={() => setShowWaiterCall(true)}
          onOrderDessert={() => {
            setShowOrderStatus(false);
            setSelectedCategory('desserts');
            const el = document.getElementById('carte-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onResetTable={() => {
            setShowOrderStatus(false);
            setHasConfirmedTable(false);
            try {
              localStorage.removeItem('mon_resto_table_confirmed');
            } catch {
              // ignore
            }
          }}
        />
      )}

      {showWaiterCall && (
        <WaiterCallModal
          onClose={() => setShowWaiterCall(false)}
        />
      )}

      {/* Table Picker Modal */}
      {showTablePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-xs bg-white rounded-[32px] p-6 space-y-4 shadow-2xl border border-slate-100 text-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">Numéro de Table</h3>
              <button
                onClick={() => setShowTablePicker(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Changez de numéro de table si vous vous êtes déplacé :
            </p>

            <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto no-scrollbar py-1">
              {Array.from({ length: settings.tablesCount }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setCurrentTable(num);
                    setShowTablePicker(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold font-mono-numbers transition-colors ${
                    currentTable === num
                      ? 'bg-[#14171d] text-white font-extrabold shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  T{num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
