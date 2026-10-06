import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, UserCheck, ChevronDown, RotateCcw, Factory } from 'lucide-react';
import { AlertsDrawer } from '../alerts/AlertsDrawer';
import { PerfilUsuario } from '../../types';

export const Header: React.FC = () => {
  const { 
    usuarioAtivo, 
    usuarios, 
    setUsuarioAtivo, 
    alertas, 
    activeTab, 
    resetarDados 
  } = useApp();

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const alertasPendentes = alertas.filter(a => !a.lido);

  const tabTitles: Record<string, string> = {
    dashboard: 'Painel Geral de Produção',
    produtos: 'Catálogo de Produtos & Engenharia de Materiais (BOM)',
    ordens: 'Ordens de Produção (OPs)',
    abastecimento: 'Sistema de Abastecimento de Linha',
    estoque: 'Controle & Movimentação de Estoque',
    apontamento: 'Apontamento de Chão de Fábrica',
    paradas: 'Controle de Paradas de Máquina',
    indicadores: 'Indicadores Industriais & OEE',
    relatorios: 'Relatórios Gerenciais & Exportação',
    usuarios: 'Controle de Usuários & Níveis de Acesso',
  };

  const getPerfilBadgeColor = (perfil: PerfilUsuario) => {
    switch (perfil) {
      case 'ADMINISTRADOR': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'PCP': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PRODUCAO': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ESTOQUE': return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'GESTOR': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'VISUALIZACAO': return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
        {/* Zone 1: Brand title & Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Factory className="w-4 h-4" />
            </div>
            <a href="#" className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              APP Produção
            </a>
          </div>

          <span className="hidden md:inline-block text-slate-300">/</span>

          <span className="hidden md:inline-block text-xs font-medium text-slate-600 truncate max-w-xs">
            {tabTitles[activeTab] || 'Visão Geral'}
          </span>
        </div>

        {/* Zone 2: Navigation Links or Industrial Date/Plant Status */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">Planta Operacional 01</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono tabular-nums text-slate-600">Turno A / 2026-10-06</span>
          </div>
        </div>

        {/* Zone 3: Actions (Notifications, Reset Demo, User Switcher) */}
        <div className="flex items-center gap-2.5">
          {/* Botão de Redefinir Dados */}
          <button
            onClick={() => {
              if (window.confirm('Deseja restaurar todos os dados de demonstração da fábrica?')) {
                resetarDados();
              }
            }}
            title="Restaurar dados originais de demonstração"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notificações / Alertas */}
          <button
            onClick={() => setAlertsOpen(true)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Ver alertas do sistema"
          >
            <Bell className="w-4 h-4" />
            {alertasPendentes.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Seletor de Perfil do Usuário */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold font-mono">
                {usuarioAtivo.nome.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                  {usuarioAtivo.nome}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-none">
                  {usuarioAtivo.perfil}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Menu Dropdown de Troca de Papel para Teste de Permissões */}
            {profileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Alternar Perfil para Testar
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permite validar o sistema conforme o nível de cada operador.
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {usuarios.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setUsuarioAtivo(u);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                        u.id === usuarioAtivo.id ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${u.id === usuarioAtivo.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 truncate">{u.nome}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 border rounded font-mono ${getPerfilBadgeColor(u.perfil)}`}>
                            {u.perfil}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{u.departamento}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer de Alertas */}
      <AlertsDrawer isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </>
  );
};
