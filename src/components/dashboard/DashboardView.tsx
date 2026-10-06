import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Package, 
  Truck, 
  PauseCircle, 
  Activity,
  Layers,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    ordens, 
    estoque, 
    apontamentos, 
    paradas, 
    necessidadesAbastecimento, 
    setActiveTab,
    temPermissao
  } = useApp();

  const [graficoFiltro, setGraficoFiltro] = useState<'dia' | 'semana'>('dia');

  const hoje = '2026-10-06';

  // 1. Cálculos de Produção do Dia
  const apontamentosHoje = apontamentos.filter(a => a.data === hoje);
  const producaoRealizadaHoje = apontamentosHoje.reduce((acc, a) => acc + a.quantidadeAprovada, 0);

  // OPs do dia
  const opsHoje = ordens.filter(o => o.dataInicio <= hoje && o.dataPrevisaoTermino >= hoje && o.status !== 'CANCELADA');
  const producaoPlanejadaHoje = opsHoje.reduce((acc, o) => acc + (o.quantidadePlanejada / 1), 0) || 120; // baseline

  const percentualCumprimento = producaoPlanejadaHoje > 0 
    ? Number(((producaoRealizadaHoje / producaoPlanejadaHoje) * 100).toFixed(1))
    : 0;

  // 2. OPs abertas e atrasadas
  const opsAbertas = ordens.filter(o => o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA');
  const opsAtrasadas = opsAbertas.filter(o => o.dataPrevisaoTermino < hoje);

  // 3. Materiais Críticos
  const materiaisCriticos = estoque.filter(e => e.estoqueAtual < e.estoqueMinimo);
  const totalItensEstoque = estoque.reduce((acc, e) => acc + e.estoqueAtual, 0);

  // 4. Necessidades de abastecimento pendentes
  const abastecimentosPendentes = necessidadesAbastecimento.filter(
    n => n.status === 'PENDENTE' || n.status === 'ESTOQUE_INSUFICIENTE'
  );

  // 5. Paradas de produção hoje
  const paradasHoje = paradas.filter(p => p.data === hoje);
  const minutosParadosHoje = paradasHoje.reduce((acc, p) => acc + p.duracaoMinutos, 0);
  const paradasAtivas = paradas.filter(p => p.emAndamento);

  // Gráfico 1: Planejado x Realizado por Turno/Hora
  const dadosTurno = [
    { hora: '08:00', planejado: 15, realizado: 14 },
    { hora: '10:00', planejado: 30, realizado: 28 },
    { hora: '12:00', planejado: 45, realizado: 42 },
    { hora: '14:00', planejado: 65, realizado: 58 },
    { hora: '16:00', planejado: 90, realizado: 71 },
    { hora: '18:00', planejado: 110, realizado: producaoRealizadaHoje },
  ];

  // Gráfico 2: Produção por Dia (Últimos 7 dias)
  const dadosDias = [
    { dia: '30/09', realizado: 98, meta: 100 },
    { dia: '01/10', realizado: 105, meta: 100 },
    { dia: '02/10', realizado: 112, meta: 105 },
    { dia: '03/10', realizado: 88, meta: 100 },
    { dia: '04/10', realizado: 120, meta: 110 },
    { dia: '05/10', realizado: 94, meta: 100 },
    { dia: '06/10', realizado: producaoRealizadaHoje, meta: 110 },
  ];

  // Gráfico 3: Produção por Produto
  const prodPorProduto = [
    { nome: 'Válvula VC-200', qtd: 42, meta: 60, cor: 'bg-blue-600' },
    { nome: 'Eixo EC-450', qtd: 18, meta: 30, cor: 'bg-emerald-600' },
    { nome: 'Redutor RP-100', qtd: 5, meta: 25, cor: 'bg-amber-500' },
    { nome: 'Flange FP-30', qtd: 80, meta: 80, cor: 'bg-indigo-600' },
    { nome: 'Atuador AP-80', qtd: 0, meta: 50, cor: 'bg-slate-400' },
  ];

  // Gráfico 4: Produção por Setor
  const prodPorSetor = [
    { setor: 'Montagem 01', qtd: 42, capacidade: 50, perc: 84 },
    { setor: 'Usinagem Pesada', qtd: 18, capacidade: 25, perc: 72 },
    { setor: 'Centro de Usinagem', qtd: 5, capacidade: 20, perc: 25 },
    { setor: 'Estamparia & Forja', qtd: 80, capacidade: 90, perc: 88 },
  ];

  // Gráfico 5: Principais Motivos de Parada
  const motivosParada = [
    { motivo: 'Falta de Material', minutos: 185, perc: 50, cor: 'bg-rose-500' },
    { motivo: 'Manutenção Mecânica', minutos: 80, perc: 22, cor: 'bg-amber-500' },
    { motivo: 'Setup de Ferramental', minutos: 45, perc: 12, cor: 'bg-blue-500' },
    { motivo: 'Problema Máquina', minutos: 40, perc: 11, cor: 'bg-purple-500' },
    { motivo: 'Inspeção de Qualidade', minutos: 20, perc: 5, cor: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Painel Geral de Produção
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoramento em tempo real do chão de fábrica, abastecimento e ordens ativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {temPermissao('CRIAR_OP') && (
            <button
              onClick={() => setActiveTab('ordens')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Ordem de Produção
            </button>
          )}
          {temPermissao('REGISTRAR_APONTAMENTO') && (
            <button
              onClick={() => setActiveTab('apontamento')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Apontar Produção
            </button>
          )}
        </div>
      </div>

      {/* Alerta banner se houver máquina parada */}
      {paradasAtivas.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <div>
              <span className="text-xs font-bold text-rose-800">
                Alerta de Interrupção Crítica:
              </span>
              <span className="text-xs text-rose-700 ml-1.5">
                {paradasAtivas.length} máquina(s) parada(s) no chão de fábrica no momento ({paradasAtivas.map(p => p.maquina).join(', ')}).
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('paradas')}
            className="text-xs font-semibold text-rose-800 hover:text-rose-950 underline underline-offset-2 shrink-0 cursor-pointer"
          >
            Ver Paradas
          </button>
        </div>
      )}

      {/* Grid de 8 Indicadores Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Planejado do Dia"
          value={producaoPlanejadaHoje}
          unit="peças"
          subtext="Meta estipulada no PCP"
          variant="info"
          icon={Calendar}
          onClick={() => setActiveTab('ordens')}
        />
        <StatCard
          label="Realizado do Dia"
          value={producaoRealizadaHoje}
          unit="peças"
          subtext="Apontamentos registrados hoje"
          variant="success"
          icon={CheckCircle2}
          trend={{ value: `${percentualCumprimento}% meta`, isPositive: percentualCumprimento >= 90 }}
          onClick={() => setActiveTab('apontamento')}
        />
        <StatCard
          label="Cumprimento da Meta"
          value={`${percentualCumprimento}%`}
          subtext={percentualCumprimento >= 90 ? 'Dentro do plano diário' : 'Ritmo abaixo do projetado'}
          variant={percentualCumprimento >= 90 ? 'success' : percentualCumprimento >= 70 ? 'warning' : 'danger'}
          icon={TrendingUp}
          onClick={() => setActiveTab('indicadores')}
        />
        <StatCard
          label="Ordens Abertas"
          value={opsAbertas.length}
          unit="OPs"
          subtext={`${ordens.filter(o => o.status === 'EM_PRODUCAO').length} em andamento na linha`}
          variant="neutral"
          icon={Layers}
          onClick={() => setActiveTab('ordens')}
        />
        <StatCard
          label="Ordens Atrasadas"
          value={opsAtrasadas.length}
          unit="OPs"
          subtext="Prazo de entrega vencido"
          variant={opsAtrasadas.length > 0 ? 'danger' : 'neutral'}
          icon={Clock}
          onClick={() => setActiveTab('ordens')}
        />
        <StatCard
          label="Materiais Críticos"
          value={materiaisCriticos.length}
          unit="itens"
          subtext="Estoque abaixo do ponto mínimo"
          variant={materiaisCriticos.length > 0 ? 'warning' : 'success'}
          icon={Package}
          onClick={() => setActiveTab('estoque')}
        />
        <StatCard
          label="Abastecimento Pendente"
          value={abastecimentosPendentes.length}
          unit="requisições"
          subtext="Necessidades a atender na linha"
          variant={abastecimentosPendentes.length > 0 ? 'warning' : 'neutral'}
          icon={Truck}
          onClick={() => setActiveTab('abastecimento')}
        />
        <StatCard
          label="Paradas de Produção"
          value={`${Math.floor(minutosParadosHoje / 60)}h ${minutosParadosHoje % 60}m`}
          subtext={`${paradasHoje.length} ocorrência(s) hoje`}
          variant={minutosParadosHoje > 60 ? 'danger' : 'neutral'}
          icon={PauseCircle}
          onClick={() => setActiveTab('paradas')}
        />
      </div>

      {/* Seção de Gráficos (5 gráficos requeridos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Planejado x Realizado no Dia */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                01. Produção Planejada x Realizada por Horário
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Evolução acumulada no turno atual</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300"></span> Planejado
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Realizado
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {dadosTurno.map(item => {
              const maxVal = 120;
              const wPlanejado = (item.planejado / maxVal) * 100;
              const wRealizado = (item.realizado / maxVal) * 100;
              return (
                <div key={item.hora} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-mono font-medium">{item.hora}</span>
                    <span className="font-mono tabular-nums text-[11px]">
                      <span className="font-semibold text-blue-700">{item.realizado}</span> / {item.planejado} un
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-sm overflow-hidden flex relative">
                    <div
                      style={{ width: `${wPlanejado}%` }}
                      className="h-full bg-slate-200 absolute top-0 left-0"
                    ></div>
                    <div
                      style={{ width: `${wRealizado}%` }}
                      className="h-full bg-blue-600 relative z-10 rounded-sm"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 2: Produção por Dia */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                02. Histórico de Produção por Dia
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Volume diário concluído vs. meta da fábrica</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Últimos 7 dias</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 pb-2">
            {dadosDias.map(item => {
              const alturaPerc = Math.min(100, (item.realizado / 140) * 100);
              const atingiu = item.realizado >= item.meta;
              return (
                <div key={item.dia} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono tabular-nums text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.realizado}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-sm h-full max-h-36 flex items-end">
                    <div
                      style={{ height: `${alturaPerc}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        atingiu ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{item.dia}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Meta atingida
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Abaixo da meta
            </span>
          </div>
        </div>

        {/* Gráfico 3: Produção por Produto */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                03. Cumprimento por Produto (SKU)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Andamento das ordens ativas em fabricação</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {prodPorProduto.map(prod => {
              const perc = Math.min(100, Math.round((prod.qtd / prod.meta) * 100));
              return (
                <div key={prod.nome} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{prod.nome}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      <span className="font-bold text-slate-900">{prod.qtd}</span> / {prod.meta} un ({perc}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${perc}%` }}
                      className={`h-full rounded-full ${prod.cor}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 4: Produção por Setor & Linha */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                04. Ocupação e Rendimento por Setor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Capacidade utilizada nas células industriais</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {prodPorSetor.map(s => (
              <div key={s.setor} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{s.setor}</span>
                  <span className="font-mono tabular-nums font-bold text-blue-700">{s.perc}% ocupação</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${s.perc}%` }}
                    className={`h-full rounded-full ${s.perc >= 80 ? 'bg-emerald-600' : 'bg-blue-600'}`}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Produzido: {s.qtd} un</span>
                  <span>Capacidade Turno: {s.capacidade} un</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 5: Principais Motivos de Parada (Pareto) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                05. Análise de Paradas de Produção (Motivos / Causas)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tempo total de interrupção acumulado por categoria</p>
            </div>
            <button
              onClick={() => setActiveTab('paradas')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              Registrar parada
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
            {motivosParada.map(m => (
              <div key={m.motivo} className="p-3 border border-slate-200 rounded-lg bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{m.motivo}</span>
                  <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{m.perc}%</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {m.minutos} <span className="text-xs font-normal text-slate-500">min</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${m.perc}%` }} className={`h-full ${m.cor}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela Resumo: OPs Ativas Prioritárias */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Ordens de Produção em Andamento
            </h2>
            <p className="text-xs text-slate-500">Monitoramento das ordens em execução no chão de fábrica</p>
          </div>
          <button
            onClick={() => setActiveTab('ordens')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Ver todas as OPs
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">Número OP</th>
                <th className="px-4 py-2.5 font-medium">Produto</th>
                <th className="px-4 py-2.5 font-medium">Setor / Máquina</th>
                <th className="px-4 py-2.5 font-medium text-right">Progresso</th>
                <th className="px-4 py-2.5 font-medium text-center">Prioridade</th>
                <th className="px-4 py-2.5 font-medium text-center">Abastecimento</th>
                <th className="px-4 py-2.5 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opsAbertas.slice(0, 5).map(op => {
                const perc = Math.round((op.quantidadeProduzida / op.quantidadePlanejada) * 100);
                return (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {op.numeroOP}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{op.produtoNome}</div>
                      <div className="text-[11px] font-mono text-slate-500">{op.produtoCodigo}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{op.setorResponsavel}</div>
                      <div className="text-[11px] text-slate-400">{op.maquina}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-mono font-semibold text-slate-900 tabular-nums">
                        {op.quantidadeProduzida} / {op.quantidadePlanejada} un
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{perc}% concluído</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={op.prioridade} type="prioridade" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge
                        status={op.abastecido ? 'ABASTECIDO' : 'PENDENTE'}
                        type="abastecimento"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={op.status} type="op" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
