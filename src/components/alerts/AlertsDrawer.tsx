import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, AlertCircle, Info, CheckCheck, ArrowRight } from 'lucide-react';
import { Alerta } from '../../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose }) => {
  const { alertas, marcarAlertaLido, marcarTodosAlertasLidos, setActiveTab } = useApp();

  if (!isOpen) return null;

  const alertasNaoLidos = alertas.filter(a => !a.lido);
  const alertasLidos = alertas.filter(a => a.lido);

  const handleAction = (alerta: Alerta) => {
    marcarAlertaLido(alerta.id);
    if (alerta.linkAcao) {
      setActiveTab(alerta.linkAcao);
      onClose();
    }
  };

  const getIcon = (severidade: Alerta['severidade']) => {
    switch (severidade) {
      case 'CRITICO':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'ATENCAO':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 text-base">Central de Alertas Operacionais</h2>
            {alertasNaoLidos.length > 0 && (
              <span className="font-mono text-xs px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded">
                {alertasNaoLidos.length} pendentes
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total de notificações: <span className="font-mono font-bold text-slate-700">{alertas.length}</span>
          </span>
          {alertasNaoLidos.length > 0 && (
            <button
              onClick={marcarTodosAlertasLidos}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todos como lidos
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alertas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nenhum alerta registrado no momento. Linha de produção operando nominalmente.
            </div>
          ) : (
            <>
              {alertasNaoLidos.map(alerta => (
                <div
                  key={alerta.id}
                  className={`p-3.5 rounded-lg border text-sm transition-all ${
                    alerta.severidade === 'CRITICO'
                      ? 'bg-rose-50/60 border-rose-200'
                      : alerta.severidade === 'ATENCAO'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-blue-50/60 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(alerta.severidade)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-xs truncate">{alerta.titulo}</h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{alerta.dataHora.split(' ')[1]}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alerta.mensagem}</p>
                      
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleAction(alerta)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Verificar agora
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => marcarAlertaLido(alerta.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          Dispensar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {alertasLidos.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Alertas Lidos
                  </span>
                  <div className="space-y-2 opacity-60">
                    {alertasLidos.map(alerta => (
                      <div key={alerta.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700">{alerta.titulo}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{alerta.dataHora}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5 truncate">{alerta.mensagem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
