import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Box,
  ClipboardList,
  Truck,
  Warehouse,
  Flame,
  PauseCircle,
  BarChart3,
  FileSpreadsheet,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { activeTab, setActiveTab, alertas, necessidadesAbastecimento, ordens } = useApp();

  const opsAtrasadas = ordens.filter(
    o => o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA' && o.dataPrevisaoTermino < '2026-10-06'
  ).length;

  const abastecimentosPendentes = necessidadesAbastecimento.filter(
    n => n.status === 'PENDENTE' || n.status === 'ESTOQUE_INSUFICIENTE'
  ).length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'produtos',
      label: 'Produtos & BOM',
      icon: Box,
      badge: undefined,
    },
    {
      id: 'ordens',
      label: 'Ordens de Produção',
      icon: ClipboardList,
      badge: opsAtrasadas > 0 ? `${opsAtrasadas} atrasadas` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'abastecimento',
      label: 'Abastecimento',
      icon: Truck,
      badge: abastecimentosPendentes > 0 ? `${abastecimentosPendentes}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'estoque',
      label: 'Controle de Estoque',
      icon: Warehouse,
      badge: undefined,
    },
    {
      id: 'apontamento',
      label: 'Apontamento',
      icon: Flame,
      badge: undefined,
    },
    {
      id: 'paradas',
      label: 'Controle de Paradas',
      icon: PauseCircle,
      badge: undefined,
    },
    {
      id: 'indicadores',
      label: 'Indicadores & KPIs',
      icon: BarChart3,
      badge: undefined,
    },
    {
      id: 'relatorios',
      label: 'Relatórios & Exportação',
      icon: FileSpreadsheet,
      badge: undefined,
    },
    {
      id: 'usuarios',
      label: 'Usuários & Permissões',
      icon: Users,
      badge: undefined,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand logo top in sidebar */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-medium">
            Módulo Industrial
          </span>
          <h2 className="text-white text-base font-bold tracking-tight">PCP & Manufatura</h2>
        </div>
        <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50">
          v2.4
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Módulos do Sistema
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-300">Auditoria Ativa</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">ISO 9001</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Sincronizado com PCP e Almoxarifado
        </p>
      </div>
    </aside>
  );
};
