/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { ProductionOrdersView } from './components/productionOrders/ProductionOrdersView';
import { SupplyView } from './components/supply/SupplyView';
import { InventoryView } from './components/inventory/InventoryView';
import { ProductionLogsView } from './components/productionLogs/ProductionLogsView';
import { StoppagesView } from './components/stoppages/StoppagesView';
import { IndicatorsView } from './components/indicators/IndicatorsView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { Menu, X, LayoutDashboard, ClipboardList, Truck, Warehouse, Flame } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'produtos':
        return <ProductsView />;
      case 'ordens':
        return <ProductionOrdersView />;
      case 'abastecimento':
        return <SupplyView />;
      case 'estoque':
        return <InventoryView />;
      case 'apontamento':
        return <ProductionLogsView />;
      case 'paradas':
        return <StoppagesView />;
      case 'indicadores':
        return <IndicatorsView />;
      case 'relatorios':
        return <ReportsView />;
      case 'usuarios':
        return <UsersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header Fixo */}
      <Header />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Corpo com Sidebar e Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar com suporte a desktop e mobile */}
        <Sidebar isMobileOpen={mobileMenuOpen} setIsMobileOpen={setMobileMenuOpen} />

        {/* Conteúdo Principal Scrollável */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
          {/* Botão Hambúrguer Mobile Flutuante / Header Mobile */}
          <div className="lg:hidden mb-4 flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-xs">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1 rounded"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4 text-blue-600" />}
              <span>Menu de Módulos</span>
            </button>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
              {activeTab}
            </span>
          </div>

          {renderActiveView()}
        </main>
      </div>

      {/* Bottom Nav Bar Rápida para Celulares (Mobile Touch Bar) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-20 shadow-lg">
        {[
          { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
          { id: 'ordens', label: 'OPs', icon: ClipboardList },
          { id: 'abastecimento', label: 'Abastecer', icon: Truck },
          { id: 'estoque', label: 'Estoque', icon: Warehouse },
          { id: 'apontamento', label: 'Apontar', icon: Flame },
        ].map(item => {
          const Icon = item.icon;
          const isAct = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isAct ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
