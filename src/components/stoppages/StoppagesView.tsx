import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoriaParada, ParadaMaquina } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  PauseCircle, 
  Play, 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

export const StoppagesView: React.FC = () => {
  const { paradas, registrarParada, finalizarParada, usuarioAtivo, temPermissao } = useApp();

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  
  // Modal Nova Parada
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [maquina, setMaquina] = useState('Centro Usinagem Haas VF-3');
  const [setor, setSetor] = useState('Centro de Usinagem');
  const [data, setData] = useState('2026-10-06');
  const [horarioInicio, setHorarioInicio] = useState('10:00');
  const [horarioTermino, setHorarioTermino] = useState('');
  const [emAndamento, setEmAndamento] = useState(true);
  const [motivo, setMotivo] = useState<CategoriaParada>('FALTA_MATERIAL');
  const [descricaoMotivo, setDescricaoMotivo] = useState('');
  const [responsavel, setResponsavel] = useState(usuarioAtivo.nome || 'Operador de Linha');
  const [observacao, setObservacao] = useState('');

  // Modal Finalizar Parada
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [paradaParaFinalizar, setParadaParaFinalizar] = useState<ParadaMaquina | null>(null);
  const [horarioFimFinalizar, setHorarioFimFinalizar] = useState('12:00');
  const [obsFinalizar, setObsFinalizar] = useState('');

  const abrirModalNova = () => {
    setMaquina('Centro Usinagem Haas VF-3');
    setSetor('Centro de Usinagem');
    setData('2026-10-06');
    setHorarioInicio('11:00');
    setHorarioTermino('');
    setEmAndamento(true);
    setMotivo('FALTA_MATERIAL');
    setDescricaoMotivo('Falta de matéria-prima no posto de trabalho');
    setResponsavel(usuarioAtivo.nome || 'Operador');
    setObservacao('');
    setModalNovaAberto(true);
  };

  const abrirModalFinalizar = (p: ParadaMaquina) => {
    setParadaParaFinalizar(p);
    setHorarioFimFinalizar('12:30');
    setObsFinalizar('');
    setModalFinalizarAberto(true);
  };

  const handleSalvarNova = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquina || !descricaoMotivo) return;

    registrarParada({
      maquina,
      setor,
      data,
      horarioInicio,
      horarioTermino: emAndamento ? undefined : horarioTermino,
      motivo,
      descricaoMotivo,
      responsavel,
      observacao,
      emAndamento,
    });

    setModalNovaAberto(false);
  };

  const handleSalvarFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paradaParaFinalizar) return;

    finalizarParada(paradaParaFinalizar.id, horarioFimFinalizar, obsFinalizar);
    setModalFinalizarAberto(false);
  };

  const paradasAtivas = paradas.filter(p => p.emAndamento);
  const totalMinutosParados = paradas.reduce((acc, p) => acc + p.duracaoMinutos, 0);

  const paradasFiltradas = paradas.filter(p => {
    const matchBusca = 
      p.maquina.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricaoMotivo.toLowerCase().includes(busca.toLowerCase()) ||
      p.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      p.setor.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;
    if (categoriaFiltro === 'TODAS') return true;
    return p.motivo === categoriaFiltro;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Controle de Paradas de Produção
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro em tempo real de quebras, setups, falta de insumos e manutenção para análise de MTTR.
          </p>
        </div>

        {temPermissao('REGISTRAR_PARADA') && (
          <button
            onClick={abrirModalNova}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            Apontar Nova Parada
          </button>
        )}
      </div>

      {/* Paradas Ativas no Chão de Fábrica */}
      {paradasAtivas.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Paradas em Andamento ({paradasAtivas.length})
              </h3>
            </div>
            <span className="text-xs text-rose-700 font-mono">Linha Interrompida</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paradasAtivas.map(p => (
              <div key={p.id} className="p-3 bg-white border border-rose-300 rounded-lg shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs">{p.maquina}</span>
                  <StatusBadge status={p.motivo} type="parada" />
                </div>
                <p className="text-xs text-slate-600 leading-snug">{p.descricaoMotivo}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono">Início: {p.horarioInicio} ({p.duracaoMinutos} min)</span>
                  <button
                    onClick={() => abrirModalFinalizar(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    Finalizar Parada
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-rose-600">
          <span className="text-xs text-slate-500 font-medium uppercase">Paradas Ativas</span>
          <div className="text-xl font-mono font-bold text-rose-700 mt-1 tabular-nums">{paradasAtivas.length}</div>
          <span className="text-[11px] text-slate-500">Máquinas paradas agora</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-amber-500">
          <span className="text-xs text-slate-500 font-medium uppercase">Tempo Parado Total</span>
          <div className="text-xl font-mono font-bold text-amber-800 mt-1 tabular-nums">
            {Math.floor(totalMinutosParados / 60)}h {totalMinutosParados % 60}m
          </div>
          <span className="text-[11px] text-slate-500">Acumulado do período</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-blue-600">
          <span className="text-xs text-slate-500 font-medium uppercase">Total de Ocorrências</span>
          <div className="text-xl font-mono font-bold text-slate-900 mt-1 tabular-nums">{paradas.length}</div>
          <span className="text-[11px] text-slate-500">Eventos registrados</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-slate-400">
          <span className="text-xs text-slate-500 font-medium uppercase">Causa Predominante</span>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">Falta de Material</div>
          <span className="text-[11px] text-slate-500">50% do tempo de parada</span>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por máquina, motivo ou operador..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg text-xs">
          {[
            { id: 'TODAS', label: 'Todas' },
            { id: 'FALTA_MATERIAL', label: 'Falta Material' },
            { id: 'MANUTENCAO', label: 'Manutenção' },
            { id: 'SETUP', label: 'Setup' },
            { id: 'PROBLEMA_MAQUINA', label: 'Defeito Máquina' },
            { id: 'QUALIDADE', label: 'Qualidade' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoriaFiltro === cat.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Paradas */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Data / Início</th>
                <th className="px-4 py-3 font-medium">Máquina & Setor</th>
                <th className="px-4 py-3 font-medium">Categoria do Motivo</th>
                <th className="px-4 py-3 font-medium">Descrição da Ocorrência</th>
                <th className="px-4 py-3 font-medium text-right">Duração</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paradasFiltradas.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                    <div>{p.data}</div>
                    <div className="text-slate-400">
                      {p.horarioInicio} {p.horarioTermino ? `às ${p.horarioTermino}` : '(em curso)'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{p.maquina}</div>
                    <div className="text-[11px] text-slate-500">{p.setor}</div>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={p.motivo} type="parada" />
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-800 leading-relaxed">{p.descricaoMotivo}</div>
                    {p.observacao && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        Obs: {p.observacao}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {p.duracaoMinutos} min
                  </td>

                  <td className="px-4 py-3 text-slate-700 text-[11px]">{p.responsavel}</td>

                  <td className="px-4 py-3 text-center">
                    {p.emAndamento ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                        Em Andamento
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Finalizada
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {p.emAndamento ? (
                      <button
                        onClick={() => abrirModalFinalizar(p)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      >
                        Finalizar
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Parada */}
      <Modal
        isOpen={modalNovaAberto}
        onClose={() => setModalNovaAberto(false)}
        title="Registrar Parada de Produção"
        subtitle="Identifique a máquina, a categoria do motivo e o horário da interrupção."
        maxWidth="lg"
      >
        <form onSubmit={handleSalvarNova} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Máquina *</label>
              <input
                type="text"
                required
                value={maquina}
                onChange={e => setMaquina(e.target.value)}
                placeholder="Ex: Torno CNC Mazak 02"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Setor</label>
              <input
                type="text"
                value={setor}
                onChange={e => setSetor(e.target.value)}
                placeholder="Ex: Usinagem Pesada"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Data *</label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Horário de Início *</label>
              <input
                type="time"
                required
                value={horarioInicio}
                onChange={e => setHorarioInicio(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Categoria do Motivo *</label>
              <select
                value={motivo}
                onChange={e => setMotivo(e.target.value as CategoriaParada)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-semibold text-xs"
              >
                <option value="FALTA_MATERIAL">Falta de Material (Insumo ou Embalagem)</option>
                <option value="MANUTENCAO">Manutenção (Mecânica / Elétrica / Hidráulica)</option>
                <option value="SETUP">Setup (Troca de Ferramenta / Molde / Preparação)</option>
                <option value="FALTA_OPERADOR">Falta de Operador / Ausência de Equipe</option>
                <option value="QUALIDADE">Qualidade / Inspeção / Desvio Dimensional</option>
                <option value="PROBLEMA_MAQUINA">Problema de Máquina / Pane Operacional</option>
                <option value="OUTROS">Outros Motivos</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Descrição Detalhada do Motivo *</label>
              <input
                type="text"
                required
                value={descricaoMotivo}
                onChange={e => setDescricaoMotivo(e.target.value)}
                placeholder="Ex: Quebra do inserto de usinagem e vazamento no fuso"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={emAndamento}
                  onChange={e => setEmAndamento(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                Parada em andamento (máquina ainda não foi liberada)
              </label>
            </div>

            {!emAndamento && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Horário de Término</label>
                <input
                  type="time"
                  value={horarioTermino}
                  onChange={e => setHorarioTermino(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                />
              </div>
            )}

            <div className={emAndamento ? 'col-span-2' : ''}>
              <label className="block font-medium text-slate-700 mb-1">Responsável pelo Registro</label>
              <input
                type="text"
                value={responsavel}
                onChange={e => setResponsavel(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Observações Técnicas / Ação</label>
              <textarea
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                rows={2}
                placeholder="Ex: Chamado aberto junto à equipe de manutenção preventiva..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalNovaAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Confirmar Parada
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Finalizar Parada */}
      <Modal
        isOpen={modalFinalizarAberto}
        onClose={() => setModalFinalizarAberto(false)}
        title="Finalizar Parada de Máquina"
        subtitle={paradaParaFinalizar ? `Liberar posto: ${paradaParaFinalizar.maquina}` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleSalvarFinalizar} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Horário de Retomada da Produção *</label>
            <input
              type="time"
              required
              value={horarioFimFinalizar}
              onChange={e => setHorarioFimFinalizar(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-sm"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Ação Corretiva Realizada / Observação</label>
            <textarea
              value={obsFinalizar}
              onChange={e => setObsFinalizar(e.target.value)}
              rows={2}
              placeholder="Ex: Peça substituída, alinhamento concluído e primeiro teste OK."
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalFinalizarAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Liberar Máquina
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
