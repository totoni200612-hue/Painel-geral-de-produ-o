import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApontamentoProducao } from '../../types';
import { Modal } from '../common/Modal';
import { StatCard } from '../common/StatCard';
import { 
  Flame, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  User, 
  Cpu, 
  Calendar 
} from 'lucide-react';

export const ProductionLogsView: React.FC = () => {
  const { 
    apontamentos, 
    ordens, 
    produtos, 
    registrarApontamento, 
    usuarioAtivo, 
    temPermissao 
  } = useApp();

  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Form states
  const [opId, setOpId] = useState('');
  const [operador, setOperador] = useState(usuarioAtivo.nome || 'Carlos Silva');
  const [maquina, setMaquina] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioTermino, setHorarioTermino] = useState('12:00');
  const [quantidadeAprovada, setQuantidadeAprovada] = useState(20);
  const [quantidadeRejeitada, setQuantidadeRejeitada] = useState(1);
  const [motivoRejeicao, setMotivoRejeicao] = useState('Desvio dimensional');
  const [paradasMinutos, setParadasMinutos] = useState(15);

  const abrirModal = () => {
    // Escolher a primeira OP aberta
    const opsAtivas = ordens.filter(o => o.status === 'EM_PRODUCAO' || o.status === 'LIBERADA');
    if (opsAtivas.length > 0) {
      setOpId(opsAtivas[0].id);
      setMaquina(opsAtivas[0].maquina);
    } else if (ordens.length > 0) {
      setOpId(ordens[0].id);
      setMaquina(ordens[0].maquina);
    }
    setOperador(usuarioAtivo.nome || 'Carlos Silva');
    setHorarioInicio('08:00');
    setHorarioTermino('12:00');
    setQuantidadeAprovada(20);
    setQuantidadeRejeitada(1);
    setMotivoRejeicao('Desvio dimensional leve');
    setParadasMinutos(10);
    setModalAberto(true);
  };

  const handleOpChange = (selectedOpId: string) => {
    setOpId(selectedOpId);
    const op = ordens.find(o => o.id === selectedOpId);
    if (op) {
      setMaquina(op.maquina);
    }
  };

  // Cálculos prévios em tempo real para exibir no formulário
  const calcularMetricasPreview = () => {
    const [hIni, mIni] = horarioInicio.split(':').map(Number);
    const [hFim, mFim] = horarioTermino.split(':').map(Number);
    let duracaoMin = (hFim * 60 + mFim) - (hIni * 60 + mIni);
    if (duracaoMin < 0) duracaoMin += 24 * 60;

    const tempoEfetivoH = Math.max(0.1, (duracaoMin - paradasMinutos) / 60);
    const totalProd = quantidadeAprovada + quantidadeRejeitada;
    const refugoPerc = totalProd > 0 ? ((quantidadeRejeitada / totalProd) * 100).toFixed(1) : '0';
    const produtividade = (totalProd / tempoEfetivoH).toFixed(1);

    const op = ordens.find(o => o.id === opId);
    const prod = produtos.find(p => p.id === op?.produtoId);
    const taktTime = prod?.tempoPadraoMinutos || 30;
    const metaPreview = Math.max(1, Math.round((duracaoMin - paradasMinutos) / taktTime));
    const eficiencia = ((totalProd / metaPreview) * 100).toFixed(1);
    const metaCumprida = ((quantidadeAprovada / metaPreview) * 100).toFixed(1);

    return {
      duracaoMin,
      totalProd,
      refugoPerc,
      produtividade,
      eficiencia,
      metaCumprida,
      metaPreview,
    };
  };

  const preview = calcularMetricasPreview();

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opId) return;

    registrarApontamento({
      opId,
      operador,
      maquina,
      horarioInicio,
      horarioTermino,
      quantidadeAprovada: Number(quantidadeAprovada),
      quantidadeRejeitada: Number(quantidadeRejeitada),
      motivoRejeicao: quantidadeRejeitada > 0 ? motivoRejeicao : undefined,
      paradasMinutos: Number(paradasMinutos),
    });

    setModalAberto(false);
  };

  // Métricas Globais dos Apontamentos
  const totalPecasProduzidas = apontamentos.reduce((acc, a) => acc + a.quantidadeProduzida, 0);
  const totalPecasAprovadas = apontamentos.reduce((acc, a) => acc + a.quantidadeAprovada, 0);
  const totalPecasRejeitadas = apontamentos.reduce((acc, a) => acc + a.quantidadeRejeitada, 0);
  const taxaMediaRefugo = totalPecasProduzidas > 0 
    ? Number(((totalPecasRejeitadas / totalPecasProduzidas) * 100).toFixed(2)) 
    : 0;
  const eficienciaMedia = apontamentos.length > 0
    ? Number((apontamentos.reduce((acc, a) => acc + a.eficienciaPercentual, 0) / apontamentos.length).toFixed(1))
    : 0;

  const apontamentosFiltrados = apontamentos.filter(a => 
    a.numeroOP.toLowerCase().includes(busca.toLowerCase()) ||
    a.produtoNome.toLowerCase().includes(busca.toLowerCase()) ||
    a.operador.toLowerCase().includes(busca.toLowerCase()) ||
    a.maquina.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Apontamento de Produção de Chão de Fábrica
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro detalhado de turnos, peças aprovadas, refugo e cálculo automático de eficiência.
          </p>
        </div>

        {temPermissao('REGISTRAR_APONTAMENTO') && (
          <button
            onClick={abrirModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Apontamento
          </button>
        )}
      </div>

      {/* Cards de Métricas de Apontamento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Produzido"
          value={totalPecasProduzidas}
          unit="peças"
          subtext="Produção bruta acumulada"
          variant="info"
          icon={Flame}
        />
        <StatCard
          label="Produção Aprovada"
          value={totalPecasAprovadas}
          unit="peças"
          subtext="Peças conformes para expedição"
          variant="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Índice de Refugo"
          value={`${taxaMediaRefugo}%`}
          subtext={`${totalPecasRejeitadas} peças rejeitadas`}
          variant={taxaMediaRefugo > 5 ? 'danger' : 'neutral'}
          icon={AlertTriangle}
        />
        <StatCard
          label="Eficiência Operacional"
          value={`${eficienciaMedia}%`}
          subtext="Média geral de rendimento"
          variant={eficienciaMedia >= 90 ? 'success' : 'warning'}
          icon={TrendingUp}
        />
      </div>

      {/* Barra de Busca */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por OP, produto, operador ou máquina..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-500">
          Registros: <span className="font-bold text-slate-900">{apontamentosFiltrados.length}</span>
        </span>
      </div>

      {/* Tabela de Apontamentos com os Cálculos Automáticos Exigidos */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Data / Horário</th>
                <th className="px-4 py-3 font-medium">OP</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Operador & Máquina</th>
                <th className="px-4 py-3 font-medium text-right">Produção Total</th>
                <th className="px-4 py-3 font-medium text-right text-emerald-700">Aprovada</th>
                <th className="px-4 py-3 font-medium text-right text-rose-700">Rejeitada</th>
                <th className="px-4 py-3 font-medium text-right">Refugo (%)</th>
                <th className="px-4 py-3 font-medium text-right">Eficiência</th>
                <th className="px-4 py-3 font-medium text-right">Produtividade</th>
                <th className="px-4 py-3 font-medium text-right">Meta (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apontamentosFiltrados.map(ap => (
                <tr key={ap.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800">{ap.data}</div>
                    <div className="text-slate-400">{ap.horarioInicio} às {ap.horarioTermino} ({ap.duracaoMinutos} min)</div>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {ap.numeroOP}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{ap.produtoNome}</div>
                    <div className="text-[10px] font-mono text-slate-500">{ap.produtoCodigo}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium">{ap.operador}</div>
                    <div className="text-[11px] text-slate-400">{ap.maquina}</div>
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {ap.quantidadeProduzida} un
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    {ap.quantidadeAprovada} un
                  </td>

                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    <span className={ap.quantidadeRejeitada > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                      {ap.quantidadeRejeitada} un
                    </span>
                    {ap.motivoRejeicao && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={ap.motivoRejeicao}>
                        {ap.motivoRejeicao}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                    <span className={ap.refugoPercentual > 5 ? 'text-rose-600' : 'text-slate-700'}>
                      {ap.refugoPercentual}%
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                    <span className={ap.eficienciaPercentual >= 90 ? 'text-emerald-700' : 'text-amber-700'}>
                      {ap.eficienciaPercentual}%
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                    {ap.produtividadePecasHora} pç/h
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                    <span className={ap.cumprimentoMetaPercentual >= 95 ? 'text-emerald-700' : 'text-blue-700'}>
                      {ap.cumprimentoMetaPercentual}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Apontamento com Cálculos Automáticos em Tempo Real */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Registrar Apontamento de Produção"
        subtitle="Informe os dados da jornada e os indicadores serão calculados automaticamente."
        maxWidth="xl"
      >
        <form onSubmit={handleSalvar} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Ordem de Produção (OP) *</label>
              <select
                required
                value={opId}
                onChange={e => handleOpChange(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-mono"
              >
                {ordens
                  .filter(o => o.status !== 'CANCELADA')
                  .map(o => (
                    <option key={o.id} value={o.id}>
                      {o.numeroOP} - {o.produtoNome} ({o.status})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Operador Responsável *</label>
              <input
                type="text"
                required
                value={operador}
                onChange={e => setOperador(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Máquina / Posto *</label>
              <input
                type="text"
                required
                value={maquina}
                onChange={e => setMaquina(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
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

            <div>
              <label className="block font-medium text-slate-700 mb-1">Horário de Término *</label>
              <input
                type="time"
                required
                value={horarioTermino}
                onChange={e => setHorarioTermino(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantidade Aprovada *</label>
              <input
                type="number"
                min="0"
                required
                value={quantidadeAprovada}
                onChange={e => setQuantidadeAprovada(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-sm font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantidade Rejeitada (Refugo)</label>
              <input
                type="number"
                min="0"
                value={quantidadeRejeitada}
                onChange={e => setQuantidadeRejeitada(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-sm font-bold text-rose-700"
              />
            </div>

            {quantidadeRejeitada > 0 && (
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Motivo da Rejeição</label>
                <input
                  type="text"
                  value={motivoRejeicao}
                  onChange={e => setMotivoRejeicao(e.target.value)}
                  placeholder="Ex: Rebarba excessiva, trinca, defeito dimensional..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Tempo de Paradas no Período (Minutos)</label>
              <input
                type="number"
                min="0"
                value={paradasMinutos}
                onChange={e => setParadasMinutos(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>
          </div>

          {/* Painel de Cálculo Automático em Tempo Real */}
          <div className="p-3 bg-slate-900 text-white rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Cálculo Automático do Sistema
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">Total Prod.</span>
                <span className="font-mono font-bold text-white text-sm tabular-nums">{preview.totalProd}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">Aprovadas</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">{quantidadeAprovada}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">Refugo</span>
                <span className="font-mono font-bold text-rose-400 text-sm tabular-nums">{preview.refugoPerc}%</span>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">Eficiência</span>
                <span className="font-mono font-bold text-blue-400 text-sm tabular-nums">{preview.eficiencia}%</span>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">Produtividade</span>
                <span className="font-mono font-bold text-amber-400 text-xs tabular-nums">{preview.produtividade} pç/h</span>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <span className="text-[10px] text-slate-400 block">Cumprimento</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">{preview.metaCumprida}%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Confirmar e Atualizar OP
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
