import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusOP, Prioridade, OrdemProducao } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Flame, 
  Truck, 
  Calendar, 
  Filter,
  Edit2,
  Trash2
} from 'lucide-react';

export const ProductionOrdersView: React.FC = () => {
  const { 
    ordens, 
    produtos, 
    adicionarOrdem, 
    atualizarStatusOP, 
    atualizarOrdem,
    removerOrdem, 
    temPermissao, 
    setActiveTab 
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [opEmEdicao, setOpEmEdicao] = useState<OrdemProducao | null>(null);

  // Form states
  const [produtoId, setProdutoId] = useState('');
  const [quantidadePlanejada, setQuantidadePlanejada] = useState(50);
  const [dataInicio, setDataInicio] = useState('2026-10-06');
  const [dataPrevisaoTermino, setDataPrevisaoTermino] = useState('2026-10-07');
  const [setorResponsavel, setSetorResponsavel] = useState('Linha de Montagem 01');
  const [maquina, setMaquina] = useState('Bancada Montagem M-01');
  const [prioridade, setPrioridade] = useState<Prioridade>('MEDIA');
  const [status, setStatus] = useState<StatusOP>('PLANEJADA');
  const [observacoes, setObservacoes] = useState('');

  const hoje = '2026-10-06';

  const abrirNovo = () => {
    if (produtos.length > 0) {
      setProdutoId(produtos[0].id);
    }
    setQuantidadePlanejada(50);
    setDataInicio(hoje);
    setDataPrevisaoTermino(hoje);
    setSetorResponsavel('Linha de Montagem 01');
    setMaquina('Bancada Montagem M-01');
    setPrioridade('MEDIA');
    setStatus('PLANEJADA');
    setObservacoes('');
    setModalNovoAberto(true);
  };

  const abrirEditar = (op: OrdemProducao) => {
    setOpEmEdicao(op);
    setProdutoId(op.produtoId);
    setQuantidadePlanejada(op.quantidadePlanejada);
    setDataInicio(op.dataInicio);
    setDataPrevisaoTermino(op.dataPrevisaoTermino);
    setSetorResponsavel(op.setorResponsavel);
    setMaquina(op.maquina);
    setPrioridade(op.prioridade);
    setStatus(op.status);
    setObservacoes(op.observacoes || '');
    setModalEditarAberto(true);
  };

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = produtos.find(p => p.id === produtoId);
    if (!prod) return;

    adicionarOrdem({
      produtoId: prod.id,
      produtoCodigo: prod.codigo,
      produtoNome: prod.nome,
      quantidadePlanejada: Number(quantidadePlanejada),
      dataInicio,
      dataPrevisaoTermino,
      setorResponsavel,
      maquina,
      prioridade,
      status,
      observacoes,
    });

    setModalNovoAberto(false);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opEmEdicao) return;
    const prod = produtos.find(p => p.id === produtoId);
    if (!prod) return;

    atualizarOrdem(opEmEdicao.id, {
      produtoId: prod.id,
      produtoCodigo: prod.codigo,
      produtoNome: prod.nome,
      quantidadePlanejada: Number(quantidadePlanejada),
      dataInicio,
      dataPrevisaoTermino,
      setorResponsavel,
      maquina,
      prioridade,
      status,
      observacoes,
    });

    setModalEditarAberto(false);
  };

  const ordensFiltradas = ordens.filter(op => {
    const matchBusca = 
      op.numeroOP.toLowerCase().includes(busca.toLowerCase()) ||
      op.produtoNome.toLowerCase().includes(busca.toLowerCase()) ||
      op.produtoCodigo.toLowerCase().includes(busca.toLowerCase()) ||
      op.setorResponsavel.toLowerCase().includes(busca.toLowerCase()) ||
      op.maquina.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;

    if (filtroStatus === 'TODAS') return true;
    if (filtroStatus === 'ATRASADAS') {
      return op.status !== 'CONCLUIDA' && op.status !== 'CANCELADA' && op.dataPrevisaoTermino < hoje;
    }
    return op.status === filtroStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ordens de Produção (OPs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Criação, controle de roteiros, liberação e acompanhamento de ordens industriais.
          </p>
        </div>

        {temPermissao('CRIAR_OP') && (
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Ordem de Produção
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por número da OP, produto, máquina ou setor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'TODAS', label: 'Todas' },
              { id: 'EM_PRODUCAO', label: 'Em Produção' },
              { id: 'LIBERADA', label: 'Liberadas' },
              { id: 'PLANEJADA', label: 'Planejadas' },
              { id: 'ATRASADAS', label: 'Atrasadas' },
              { id: 'CONCLUIDA', label: 'Concluídas' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroStatus(f.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  filtroStatus === f.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Ordens de Produção */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Número OP</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium text-right">Qtd Planejada</th>
                <th className="px-4 py-3 font-medium text-right">Qtd Produzida</th>
                <th className="px-4 py-3 font-medium">Início / Previsão</th>
                <th className="px-4 py-3 font-medium">Setor / Máquina</th>
                <th className="px-4 py-3 font-medium text-center">Prioridade</th>
                <th className="px-4 py-3 font-medium text-center">Abastecimento</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordensFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    Nenhuma ordem de produção encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                ordensFiltradas.map(op => {
                  const percConcluido = op.quantidadePlanejada > 0
                    ? Math.round((op.quantidadeProduzida / op.quantidadePlanejada) * 100)
                    : 0;
                  const atrasada = op.status !== 'CONCLUIDA' && op.status !== 'CANCELADA' && op.dataPrevisaoTermino < hoje;

                  return (
                    <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900 block">{op.numeroOP}</span>
                        {atrasada && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                            <AlertCircle className="w-3 h-3" /> Atrasada
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{op.produtoNome}</div>
                        <div className="text-[11px] font-mono text-slate-500">{op.produtoCodigo}</div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {op.quantidadePlanejada} un
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="font-mono tabular-nums text-slate-800 font-semibold">
                          {op.quantidadeProduzida} un
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {percConcluido}% concluído
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-mono text-[11px]">{op.dataInicio}</div>
                        <div className={`font-mono text-[11px] ${atrasada ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                          até {op.dataPrevisaoTermino}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <div>{op.setorResponsavel}</div>
                        <div className="text-[11px] text-slate-400">{op.maquina}</div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={op.prioridade} type="prioridade" />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setActiveTab('abastecimento')}
                          className="cursor-pointer"
                          title="Clique para ir ao módulo de abastecimento"
                        >
                          <StatusBadge
                            status={op.abastecido ? 'ABASTECIDO' : 'PENDENTE'}
                            type="abastecimento"
                          />
                        </button>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={op.status} type="op" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ações de Chão de Fábrica */}
                          {op.status === 'LIBERADA' && (
                            <button
                              onClick={() => atualizarStatusOP(op.id, 'EM_PRODUCAO')}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Iniciar produção"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {op.status === 'PLANEJADA' && (
                            <button
                              onClick={() => atualizarStatusOP(op.id, 'LIBERADA')}
                              className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                              title="Liberar para fábrica"
                            >
                              Liberar
                            </button>
                          )}

                          {op.status === 'EM_PRODUCAO' && (
                            <>
                              <button
                                onClick={() => atualizarStatusOP(op.id, 'PAUSADA', 'Pausada pelo operador')}
                                className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                title="Pausar ordem"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => atualizarStatusOP(op.id, 'CONCLUIDA')}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Concluir ordem"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {op.status === 'PAUSADA' && (
                            <button
                              onClick={() => atualizarStatusOP(op.id, 'EM_PRODUCAO')}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Retomar produção"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Ações Administrativas */}
                          {temPermissao('EDITAR_OP') && (
                            <button
                              onClick={() => abrirEditar(op)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Editar OP"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {temPermissao('CRIAR_OP') && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Excluir a ordem ${op.numeroOP}?`)) {
                                  removerOrdem(op.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Excluir OP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Nova OP */}
      <Modal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        title="Criar Nova Ordem de Produção (OP)"
        subtitle="O PCP gera automaticamente as requisições de abastecimento com base no produto selecionado."
        maxWidth="xl"
      >
        <form onSubmit={handleCriar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Produto a Fabricar *</label>
              <select
                required
                value={produtoId}
                onChange={e => setProdutoId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
              >
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nome} (Estoque: {p.estoqueAtual} {p.unidadeMedida})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantidade Planejada *</label>
              <input
                type="number"
                min="1"
                required
                value={quantidadePlanejada}
                onChange={e => setQuantidadePlanejada(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value as Prioridade)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Data de Início *</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Previsão de Término *</label>
              <input
                type="date"
                required
                value={dataPrevisaoTermino}
                onChange={e => setDataPrevisaoTermino(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Setor Responsável</label>
              <input
                type="text"
                value={setorResponsavel}
                onChange={e => setSetorResponsavel(e.target.value)}
                placeholder="Ex: Linha de Montagem 01"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Máquina / Posto</label>
              <input
                type="text"
                value={maquina}
                onChange={e => setMaquina(e.target.value)}
                placeholder="Ex: Bancada Montagem M-01"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Status Inicial</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StatusOP)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="PLANEJADA">Planejada (Aguardando liberação do PCP)</option>
                <option value="LIBERADA">Liberada (Apta para abastecimento e início)</option>
                <option value="EM_PRODUCAO">Em Produção Imediata</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Observações Técnicas</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs"
                placeholder="Instruções para os operadores, tolerâncias ou cliente..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalNovoAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Gerar Ordem de Produção
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar OP */}
      <Modal
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        title={opEmEdicao ? `Editar OP: ${opEmEdicao.numeroOP}` : 'Editar Ordem'}
        subtitle="Altere prazos, máquinas, setores ou observações."
        maxWidth="xl"
      >
        <form onSubmit={handleSalvarEdicao} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Qtd Planejada</label>
              <input
                type="number"
                min="1"
                required
                value={quantidadePlanejada}
                onChange={e => setQuantidadePlanejada(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value as Prioridade)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Início</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Término</label>
              <input
                type="date"
                required
                value={dataPrevisaoTermino}
                onChange={e => setDataPrevisaoTermino(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Setor</label>
              <input
                type="text"
                value={setorResponsavel}
                onChange={e => setSetorResponsavel(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Máquina</label>
              <input
                type="text"
                value={maquina}
                onChange={e => setMaquina(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StatusOP)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="PLANEJADA">Planejada</option>
                <option value="LIBERADA">Liberada</option>
                <option value="EM_PRODUCAO">Em Produção</option>
                <option value="PAUSADA">Pausada</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Observações</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalEditarAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
