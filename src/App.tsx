import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { ClientMobileMenu } from './components/client/ClientMobileMenu';
import { KitchenDisplaySystem } from './components/kds/KitchenDisplaySystem';
import { PointOfSale } from './components/pos/PointOfSale';
import { FloorPlan2D } from './components/floor/FloorPlan2D';
import { BillingAndERP } from './components/billing/BillingAndERP';
import { RestaurantSettingsModal } from './components/settings/RestaurantSettingsModal';
import { PinModal } from './components/common/PinModal';
import { RestaurantLogo } from './components/common/RestaurantLogo';
import {
  UtensilsCrossed,
  ChefHat,
  MapPin,
  FileSpreadsheet,
  Settings,
  ArrowLeft,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

type StaffView = 'pos' | 'kds' | 'floor' | 'billing';

const MainAppContent: React.FC = () => {
  const { settings, theme, toggleTheme } = useRestaurant();

  const [appMode, setAppMode] = useState<'client' | 'staff'>('client');
  const [staffTab, setStaffTab] = useState<StaffView>('pos');

  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const [posInitialTable, setPosInitialTable] = useState<number>(1);
  const [billingInitialOrderId, setBillingInitialOrderId] = useState<string | undefined>(undefined);

  const isDark = theme === 'dark';

  const handleOpenStaffPortal = () => {
    if (isStaffAuthenticated) {
      setAppMode('staff');
    } else {
      setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    setIsStaffAuthenticated(true);
    setShowPinModal(false);
    setAppMode('staff');
  };

  const handleExitStaffMode = () => {
    setAppMode('client');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-900 transition-colors duration-300 ${
      isDark ? 'bg-[#0a0c10] text-slate-100' : 'bg-[#faf6f0] text-slate-800'
    }`}>
      {/* 
        CLIENT EXPERIENCE (DEFAULT FOR ALL DINERS)
        Completely free of staff tabs or admin buttons.
      */}
      {appMode === 'client' && (
        <ClientMobileMenu onOpenStaffPortal={handleOpenStaffPortal} />
      )}

      {/*
        STAFF & KITCHEN MANAGEMENT PORTAL
        Styled with the same warm gourmet palette and high-end finish.
      */}
      {appMode === 'staff' && (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-b from-[#0b0e14] via-[#10141f] to-[#080a0e] text-slate-100' 
            : 'bg-gradient-to-b from-[#faf6f0] via-[#f3ebe1] to-[#e8decb] text-slate-800'
        }`}>
          {/* Staff Dedicated Header Bar */}
          <header className={`backdrop-blur-xl border-b px-4 py-3 z-40 sticky top-0 shadow-sm transition-colors ${
            isDark 
              ? 'bg-[#10141f]/90 border-white/10 text-white' 
              : 'bg-white/90 border-slate-200 text-slate-800'
          }`}>
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              {/* Left: Exit Staff button & Restaurant Name */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExitStaffMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#14171d] hover:bg-black text-white font-bold text-xs shadow-md transition-all active:scale-95 border border-white/10"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
                  <span>Retour Menu Client</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <RestaurantLogo size="sm" isDark={isDark} />
                  <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {settings.name}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-amber-900 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Espace Privé
                  </span>
                </div>
              </div>

              {/* Center: Module View Tabs */}
              <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto no-scrollbar shadow-inner ${
                isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100/90 border-slate-200'
              }`}>
                <button
                  onClick={() => setStaffTab('pos')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    staffTab === 'pos'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-black hover:bg-white/50'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>POS Caisse</span>
                </button>

                <button
                  onClick={() => setStaffTab('kds')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    staffTab === 'kds'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-black hover:bg-white/50'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>KDS Cuisine</span>
                </button>

                <button
                  onClick={() => setStaffTab('floor')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    staffTab === 'floor'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-black hover:bg-white/50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Plan 2D</span>
                </button>

                <button
                  onClick={() => setStaffTab('billing')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    staffTab === 'billing'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-black hover:bg-white/50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Facturation & ERP</span>
                </button>
              </div>

              {/* Right: Theme Toggle, Settings & Lock */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-2xl border transition-colors shadow-sm ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/15 text-amber-300 border-white/10' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-black border-slate-200'
                  }`}
                  title={isDark ? 'Passer en mode lumineux' : 'Passer en mode sombre'}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className={`p-2.5 rounded-2xl border transition-colors shadow-sm ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/10' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-black border-slate-200'
                  }`}
                  title="Paramètres de l'établissement"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsStaffAuthenticated(false);
                    setAppMode('client');
                  }}
                  className="p-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors shadow-sm"
                  title="Verrouiller la session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Staff Content */}
          <div className="flex-1 flex flex-col">
            {staffTab === 'pos' && (
              <PointOfSale
                initialTable={posInitialTable}
                onOpenReceipt={(orderId) => {
                  setBillingInitialOrderId(orderId);
                  setStaffTab('billing');
                }}
              />
            )}

            {staffTab === 'kds' && (
              <KitchenDisplaySystem />
            )}

            {staffTab === 'floor' && (
              <FloorPlan2D
                onSelectTableForPOS={(tableNum) => {
                  setPosInitialTable(tableNum);
                  setStaffTab('pos');
                }}
                onOpenBillForTable={(tableNum) => {
                  setStaffTab('billing');
                }}
              />
            )}

            {staffTab === 'billing' && (
              <BillingAndERP
                initialOrderId={billingInitialOrderId}
                onOpenSettings={() => setShowSettingsModal(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Staff Authentication PIN Modal */}
      {showPinModal && (
        <PinModal
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <RestaurantSettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainAppContent />
    </RestaurantProvider>
  );
}
