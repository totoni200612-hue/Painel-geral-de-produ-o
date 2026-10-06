import React from 'react';
import { StatusOP, StatusProduto, StatusAbastecimento, Prioridade, CategoriaParada } from '../../types';

interface StatusBadgeProps {
  status: StatusOP | StatusProduto | StatusAbastecimento | Prioridade | CategoriaParada | string;
  type?: 'op' | 'produto' | 'abastecimento' | 'prioridade' | 'parada';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'op' }) => {
  // Configurações semânticas profissionais com borda e fundo sutis
  const getStyle = () => {
    switch (status) {
      // OPs
      case 'PLANEJADA':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'LIBERADA':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'EM_PRODUCAO':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'PAUSADA':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'CONCLUIDA':
        return 'text-slate-800 bg-slate-100 border-slate-200';
      case 'CANCELADA':
        return 'text-rose-700 bg-rose-50 border-rose-200';

      // Abastecimento
      case 'ABASTECIDO':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'PARCIAL':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'PENDENTE':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'ESTOQUE_INSUFICIENTE':
        return 'text-rose-700 bg-rose-50 border-rose-200';

      // Prioridade
      case 'URGENTE':
        return 'text-rose-700 bg-rose-50 border-rose-300 font-semibold';
      case 'ALTA':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'MEDIA':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'BAIXA':
        return 'text-slate-600 bg-slate-100 border-slate-200';

      // Produto
      case 'ATIVO':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'INATIVO':
        return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'HOMOLOGACAO':
        return 'text-purple-700 bg-purple-50 border-purple-200';

      // Parada
      case 'FALTA_MATERIAL':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'MANUTENCAO':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'SETUP':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PROBLEMA_MAQUINA':
        return 'text-rose-800 bg-rose-100 border-rose-300';
      case 'QUALIDADE':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PLANEJADA': return 'Planejada';
      case 'LIBERADA': return 'Liberada';
      case 'EM_PRODUCAO': return 'Em Produção';
      case 'PAUSADA': return 'Pausada';
      case 'CONCLUIDA': return 'Concluída';
      case 'CANCELADA': return 'Cancelada';
      case 'ABASTECIDO': return 'Abastecido';
      case 'PARCIAL': return 'Parcial';
      case 'PENDENTE': return 'Pendente';
      case 'ESTOQUE_INSUFICIENTE': return 'Falta Estoque';
      case 'URGENTE': return 'Urgente';
      case 'ALTA': return 'Alta';
      case 'MEDIA': return 'Média';
      case 'BAIXA': return 'Baixa';
      case 'ATIVO': return 'Ativo';
      case 'INATIVO': return 'Inativo';
      case 'HOMOLOGACAO': return 'Homologação';
      case 'FALTA_MATERIAL': return 'Falta Material';
      case 'MANUTENCAO': return 'Manutenção';
      case 'SETUP': return 'Setup';
      case 'FALTA_OPERADOR': return 'Falta Operador';
      case 'QUALIDADE': return 'Qualidade';
      case 'PROBLEMA_MAQUINA': return 'Defeito Máquina';
      case 'OUTROS': return 'Outros';
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded ${getStyle()}`}>
      {getLabel()}
    </span>
  );
};
