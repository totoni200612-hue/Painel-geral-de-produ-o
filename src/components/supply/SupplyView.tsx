import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NecessidadeAbastecimento } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  Truck, 
  Search, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Warehouse, 
  PackageCheck, 
  Clock, 
  ArrowRight,
  Send,
  Boxes
} from 'lucide-react';

export const SupplyView: React.FC = () => {
  const { 
    necessidadesAbastecimento, 
    atenderAbastecimento, 
    abastecerTodaOP,
    ordens, 
    temPermissao 
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [opFiltro, setOpFiltro] = useState<string>('TODAS');

  // Modal para abastecer item individual
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<NecessidadeAbastecimento | null>(null);
  const [quantidadeAbastecer, setQuantidadeAbastecer] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const hoje = '2026-10-06';

  const abrirModalAbastecer = (item: NecessidadeAbastecimento) => {
    setItemSelecionado(item);
    setQuantidadeAbastecer(item.quantidadeAAbastecer);
    setFeedbackMsg(null);
    setModalItemAberto(true);
  };

  const handleConfirmarAbastecimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemSelecionado) return;

    const res = atenderAbastecimento(itemSelecionado.id, quantidadeAbastecer);
    if (res.sucesso) {
      setFeedbackMsg({ tipo: 'sucesso', texto: res.mensagem });
      setTimeout(() => {
        setModalItemAberto(false);
        setFeedbackMsg(null);
      }, 1200);
    } else {
      setFeedbackMsg({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleAbastecerKitCompleto = (opId: string) => {
    const res = abastecerTodaOP(opId);
    alert(res.mensagem);
  };

  // Filtragem
  const necessidadesFiltradas = necessidadesAbastecimento.filter(nec => {
    const matchBusca = 
      nec.numeroOP.toLowerCase().includes(busca.toLowerCase()) ||
      nec.produtoNome.toLowerCase().includes(busca.toLowerCase()) ||
      nec.materialNome.toLowerCase().includes(busca.toLowerCase()) ||
      nec.materialCodigo.toLowerCase().includes(busca.toLowerCase()) ||
      nec.setorDestino.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;
    if (opFiltro !== 'TODAS' && nec.numeroOP !== opFiltro) return false;
    if (filtroStatus === 'TODOS') return true;
    return nec.status === filtroStatus;
  });

  // Métricas do Abastecimento
  const totalNecessidades = necessidadesAbastecimento.length;
  const pendentes = necessidadesAbastecimento.filter(n => n.status === 'PENDENTE').length;
  const insuficientes = necessidadesAbastecimento.filter(n => n.status === 'ESTOQUE_INSUFICIENTE').length;
  const atendidas = necessidadesAbastecimento.filter(n => n.status === 'ABASTECIDO').length;

  // Alertas específicos de abastecimento
  const opsProximasSemAbastecer = ordens.filter(
    o => o.dataInicio <= hoje && !o.abastecido && o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sistema de Abastecimento da Produção
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo automatizado de materiais (BOM x OPs), transferências para linhas e monitoramento de faltas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-800">
            Fórmula: <span className="font-semibold">Qtd a Abastecer = Qtd Necessária - Qtd Atendida</span>
          </div>
        </div>
      </div>

      {/* Alertas Críticos do Abastecimento */}
      {(insuficientes > 0 || opsProximasSemAbastecer.length > 0) && (
        <div className="space-y-2">
          {insuficientes > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-rose-800">Alerta de Insumo Insuficiente:</span>{' '}
                  <span className="text-rose-700">
                    Existem {insuficientes} solicitação(ões) de materiais cujo saldo no estoque físico é inferior à necessidade da OP.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setFiltroStatus('ESTOQUE_INSUFICIENTE')}
                className="font-semibold text-rose-800 hover:text-rose-950 underline shrink-0 cursor-pointer"
              >
                Filtrar Críticos
              </button>
            </div>
          )}

          {opsProximasSemAbastecer.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-amber-800">Atenção ao Início de Produção:</span>{' '}
                  <span className="text-amber-700">
                    {opsProximasSemAbastecer.length} ordem(ns) com data de início prevista para hoje ({opsProximasSemAbastecer.map(o => o.numeroOP).join(', ')}) ainda não possuem abastecimento completo na linha.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-slate-400">
          <span className="text-xs text-slate-500 font-medium uppercase">Total de Demandas</span>
          <div className="text-xl font-mono font-bold text-slate-900 mt-1 tabular-nums">{totalNecessidades}</div>
          <span className="text-[11px] text-slate-400">Linhas de materiais por OP</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-amber-500">
          <span className="text-xs text-amber-700 font-medium uppercase">Pendentes na Linha</span>
          <div className="text-xl font-mono font-bold text-amber-800 mt-1 tabular-nums">{pendentes}</div>
          <span className="text-[11px] text-slate-500">Aguardando separação almoxarifado</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-rose-600">
          <span className="text-xs text-rose-700 font-medium uppercase">Estoque Insuficiente</span>
          <div className="text-xl font-mono font-bold text-rose-800 mt-1 tabular-nums">{insuficientes}</div>
          <span className="text-[11px] text-rose-600">Risco iminente de parada</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 border-l-4 border-l-emerald-600">
          <span className="text-xs text-emerald-700 font-medium uppercase">100% Abastecidas</span>
          <div className="text-xl font-mono font-bold text-emerald-800 mt-1 tabular-nums">{atendidas}</div>
          <span className="text-[11px] text-emerald-600">Disponíveis nos postos</span>
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
            placeholder="Buscar por OP, produto, material ou setor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filtro por OP */}
          <select
            value={opFiltro}
            onChange={e => setOpFiltro(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white font-mono"
          >
            <option value="TODAS">Todas as OPs</option>
            {Array.from(new Set(necessidadesAbastecimento.map(n => n.numeroOP))).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>

          {/* Filtro por Status */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md overflow-x-auto text-xs">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'PENDENTE', label: 'Pendentes' },
              { id: 'ESTOQUE_INSUFICIENTE', label: 'Sem Estoque' },
              { id: 'PARCIAL', label: 'Parcial' },
              { id: 'ABASTECIDO', label: 'Abastecido' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroStatus(f.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
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

      {/* Tabela de Abastecimento com Ações */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">OP</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Material Requerido</th>
                <th className="px-4 py-3 font-medium text-right">Qtd Necessária</th>
                <th className="px-4 py-3 font-medium text-right">Disponível Estoque</th>
                <th className="px-4 py-3 font-medium text-right">Qtd a Abastecer</th>
                <th className="px-4 py-3 font-medium">Local Estoque</th>
                <th className="px-4 py-3 font-medium">Linha / Destino</th>
                <th className="px-4 py-3 font-medium text-center">Prioridade</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {necessidadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    Nenhuma necessidade de abastecimento encontrada.
                  </td>
                </tr>
              ) : (
                necessidadesFiltradas.map(nec => {
                  const saldoSuficiente = nec.quantidadeDisponivelEstoque >= nec.quantidadeAAbastecer;

                  return (
                    <tr key={nec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900">{nec.numeroOP}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{nec.produtoNome}</div>
                        <div className="text-[10px] font-mono text-slate-500">{nec.produtoCodigo}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{nec.materialNome}</div>
                        <div className="text-[10px] font-mono text-slate-500">{nec.materialCodigo}</div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 tabular-nums">
                        {nec.quantidadeNecessaria} {nec.unidadeMedida}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-bold tabular-nums ${
                          nec.quantidadeDisponivelEstoque < nec.quantidadeAAbastecer ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {nec.quantidadeDisponivelEstoque} {nec.unidadeMedida}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-bold text-blue-700 tabular-nums">
                          {nec.quantidadeAAbastecer} {nec.unidadeMedida}
                        </span>
                        {nec.quantidadeAbastecida > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {nec.quantidadeAbastecida} já abastecido
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Warehouse className="w-3 h-3 text-slate-400" />
                          {nec.localEstoque}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 text-[11px]">
                        <div>{nec.setorDestino}</div>
                        <div className="text-slate-400">{nec.maquinaDestino}</div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={nec.prioridadeOP} type="prioridade" />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={nec.status} type="abastecimento" />
                      </td>

                      <td className="px-4 py-3 text-right">
                        {nec.quantidadeAAbastecer > 0 ? (
                          <button
                            onClick={() => abrirModalAbastecer(nec)}
                            disabled={!saldoSuficiente}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                              saldoSuficiente
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            title={saldoSuficiente ? 'Transferir material do almoxarifado para a linha' : 'Saldo em estoque insuficiente para atender'}
                          >
                            <Send className="w-3 h-3" />
                            Abastecer
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Atendido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ações em Lote por Ordem de Produção */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Abastecimento de Kits Completos por OP
            </h3>
            <p className="text-xs text-slate-500">
              Permite transferir simultaneamente todos os insumos de uma OP do almoxarifado para o ponto de consumo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ordens
            .filter(o => o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA')
            .map(op => {
              const necsOP = necessidadesAbastecimento.filter(n => n.opId === op.id);
              const pendentesOP = necsOP.filter(n => n.quantidadeAAbastecer > 0);
              const faltasOP = necsOP.filter(n => n.status === 'ESTOQUE_INSUFICIENTE');

              return (
                <div key={op.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">{op.numeroOP}</span>
                    <StatusBadge status={op.status} type="op" />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-slate-800 truncate">{op.produtoNome}</div>
                    <div className="text-slate-500 text-[11px]">{op.setorResponsavel}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-600">
                      {pendentesOP.length} itens pendentes
                    </span>

                    {pendentesOP.length === 0 ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 100% Abastecido
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAbastecerKitCompleto(op.id)}
                        disabled={faltasOP.length > 0}
                        className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                          faltasOP.length > 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={faltasOP.length > 0 ? 'Não é possível: há itens sem estoque suficiente' : 'Abastecer todos os insumos'}
                      >
                        Abastecer Kit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Modal Confirmar Abastecimento */}
      <Modal
        isOpen={modalItemAberto}
        onClose={() => setModalItemAberto(false)}
        title="Registrar Abastecimento de Linha"
        subtitle="Confirme a transferência física do material para o ponto de produção."
        maxWidth="md"
      >
        {itemSelecionado && (
          <form onSubmit={handleConfirmarAbastecimento} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ordem de Produção:</span>
                <span className="font-mono font-bold text-slate-900">{itemSelecionado.numeroOP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produto:</span>
                <span className="font-semibold text-slate-800">{itemSelecionado.produtoNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Material:</span>
                <span className="font-semibold text-slate-800">{itemSelecionado.materialNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Local de Origem:</span>
                <span className="text-slate-700">{itemSelecionado.localEstoque}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destino na Fábrica:</span>
                <span className="text-slate-700">{itemSelecionado.setorDestino}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Saldo Atual no Estoque:</span>
                <span className="font-mono font-bold text-slate-900">
                  {itemSelecionado.quantidadeDisponivelEstoque} {itemSelecionado.unidadeMedida}
                </span>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-medium text-slate-700 mb-1">
                Quantidade a Abastecer ({itemSelecionado.unidadeMedida}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={itemSelecionado.quantidadeDisponivelEstoque}
                required
                value={quantidadeAbastecer}
                onChange={e => setQuantidadeAbastecer(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Esta ação gerará automaticamente uma movimentação de estoque "TRANSFERENCIA_LINHA" e debitará o saldo do almoxarifado.
              </p>
            </div>

            {feedbackMsg && (
              <div
                className={`p-2.5 rounded text-xs font-medium ${
                  feedbackMsg.tipo === 'sucesso'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedbackMsg.texto}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalItemAberto(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Confirmar Transferência
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
