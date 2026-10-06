import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Zap, 
  Activity,
  Layers,
  Award,
  ShieldAlert
} from 'lucide-react';

export const IndicatorsView: React.FC = () => {
  const { ordens, estoque, apontamentos, paradas, necessidadesAbastecimento } = useApp();

  const hoje = '2026-10-06';

  // 1. Planejado x Realizado
  const totalPlanejadoOPs = ordens.filter(o => o.status !== 'CANCELADA').reduce((acc, o) => acc + o.quantidadePlanejada, 0);
  const totalProduzido = ordens.filter(o => o.status !== 'CANCELADA').reduce((acc, o) => acc + o.quantidadeProduzida, 0);
  const totalRejeitado = ordens.filter(o => o.status !== 'CANCELADA').reduce((acc, o) => acc + o.quantidadeRejeitada, 0);
  const percAtingimentoGeral = totalPlanejadoOPs > 0 ? Number(((totalProduzido / totalPlanejadoOPs) * 100).toFixed(1)) : 0;

  // 2. Eficiência e Produtividade (média dos apontamentos)
  const eficienciaMedia = apontamentos.length > 0
    ? Number((apontamentos.reduce((acc, a) => acc + a.eficienciaPercentual, 0) / apontamentos.length).toFixed(1))
    : 92.4;

  const produtividadeMedia = apontamentos.length > 0
    ? Number((apontamentos.reduce((acc, a) => acc + a.produtividadePecasHora, 0) / apontamentos.length).toFixed(1))
    : 5.6;

  // 3. Refugo Geral
  const totalPecas = totalProduzido + totalRejeitado;
  const taxaRefugo = totalPecas > 0 ? Number(((totalRejeitado / totalPecas) * 100).toFixed(2)) : 0;

  // 4. Horas Paradas
  const minutosParadosTotal = paradas.reduce((acc, p) => acc + p.duracaoMinutos, 0);
  const horasParadasDecimal = Number((minutosParadosTotal / 60).toFixed(1));

  // 5. Cumprimento de Prazo (% OPs entregues ou no prazo)
  const opsConcluidasOuAtivas = ordens.filter(o => o.status !== 'CANCELADA');
  const opsAtrasadas = opsConcluidasOuAtivas.filter(o => o.status !== 'CONCLUIDA' && o.dataPrevisaoTermino < hoje);
  const percCumprimentoPrazo = opsConcluidasOuAtivas.length > 0
    ? Number((((opsConcluidasOuAtivas.length - opsAtrasadas.length) / opsConcluidasOuAtivas.length) * 100).toFixed(1))
    : 100;

  // 6. Disponibilidade de Materiais (% itens com estoque >= mínimo)
  const itensEmNivelSeguro = estoque.filter(e => e.estoqueAtual >= e.estoqueMinimo).length;
  const percDisponibilidadeMateriais = estoque.length > 0
    ? Number(((itensEmNivelSeguro / estoque.length) * 100).toFixed(1))
    : 100;

  // 7. Cálculo OEE (Overall Equipment Effectiveness)
  // Disponibilidade: tempo trabalhado / tempo total (ex: 480 min - paradas)
  const tempoPlanejadoTurnoMin = 480 * 3; // 3 turnos / linhas
  const disponibilidadeOEE = Math.max(70, Math.min(99, Number((((tempoPlanejadoTurnoMin - minutosParadosTotal) / tempoPlanejadoTurnoMin) * 100).toFixed(1))));
  const performanceOEE = eficienciaMedia;
  const qualidadeOEE = Number((100 - taxaRefugo).toFixed(1));
  const oeeGlobal = Number(((disponibilidadeOEE / 100) * (performanceOEE / 100) * (qualidadeOEE / 100) * 100).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Indicadores de Desempenho Fabril (KPIs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de produtividade, OEE, qualidade, aderência ao plano e disponibilidade de matéria-prima.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white px-3 py-1.5 border border-slate-200 rounded-lg">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Meta Fábrica Classe Mundial: <strong>OEE &ge; 85%</strong></span>
        </div>
      </div>

      {/* Destaque OEE (Overall Equipment Effectiveness) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
              Índice de Eficiência Global dos Equipamentos
            </span>
            <div className="flex items-baseline justify-center lg:justify-start gap-3">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                {oeeGlobal}%
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                oeeGlobal >= 85 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {oeeGlobal >= 85 ? 'Classe Mundial (Excelente)' : 'Nível Operacional Estável'}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Composição tripartite: Disponibilidade de Máquinas &times; Performance &times; Índice de Qualidade.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto text-center">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg min-w-[110px]">
              <span className="text-[10px] text-slate-400 block font-medium">Disponibilidade</span>
              <span className="text-lg font-bold font-mono text-blue-400 tabular-nums">{disponibilidadeOEE}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tempo em Marcha</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg min-w-[110px]">
              <span className="text-[10px] text-slate-400 block font-medium">Desempenho</span>
              <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">{performanceOEE}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Velocidade Efetiva</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-lg min-w-[110px]">
              <span className="text-[10px] text-slate-400 block font-medium">Qualidade</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{qualidadeOEE}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Peças Aprovadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Indicadores Chave Exigidos pelo Usuário */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Produção Planejada x Realizada */}
        <StatCard
          label="Planejado x Realizado"
          value={`${percAtingimentoGeral}%`}
          unit={`(${totalProduzido}/${totalPlanejadoOPs} un)`}
          subtext="Cumprimento acumulado do plano fabril"
          variant={percAtingimentoGeral >= 90 ? 'success' : 'warning'}
          icon={TrendingUp}
        />

        {/* 2. Eficiência */}
        <StatCard
          label="Eficiência Operacional"
          value={`${eficienciaMedia}%`}
          subtext="Volume produzido vs. meta de takt time"
          variant={eficienciaMedia >= 90 ? 'success' : 'warning'}
          icon={Zap}
        />

        {/* 3. Produtividade */}
        <StatCard
          label="Produtividade Média"
          value={produtividadeMedia}
          unit="peças/hora"
          subtext="Ritmo efetivo de fabricação"
          variant="info"
          icon={Activity}
        />

        {/* 4. Refugo */}
        <StatCard
          label="Índice de Refugo"
          value={`${taxaRefugo}%`}
          unit={`(${totalRejeitado} rejeitadas)`}
          subtext="Peças não conformes no período"
          variant={taxaRefugo > 4 ? 'danger' : 'success'}
          icon={AlertTriangle}
        />

        {/* 5. Horas Paradas */}
        <StatCard
          label="Horas Paradas"
          value={`${horasParadasDecimal}h`}
          unit={`(${minutosParadosTotal} min)`}
          subtext="Interrupções acumuladas nas células"
          variant={horasParadasDecimal > 3 ? 'danger' : 'neutral'}
          icon={Clock}
        />

        {/* 6. Cumprimento de Prazo */}
        <StatCard
          label="Cumprimento de Prazo"
          value={`${percCumprimentoPrazo}%`}
          subtext="Ordens finalizadas ou sem atraso"
          variant={percCumprimentoPrazo >= 90 ? 'success' : 'warning'}
          icon={CheckCircle2}
        />

        {/* 7. Disponibilidade de Materiais */}
        <StatCard
          label="Disponib. de Materiais"
          value={`${percDisponibilidadeMateriais}%`}
          unit={`(${itensEmNivelSeguro}/${estoque.length} SKUs)`}
          subtext="Itens com saldo acima do mínimo"
          variant={percDisponibilidadeMateriais >= 85 ? 'success' : 'warning'}
          icon={Package}
        />

        {/* 8. Ordens Atrasadas */}
        <StatCard
          label="Ordens Atrasadas"
          value={opsAtrasadas.length}
          unit="OPs"
          subtext={opsAtrasadas.length > 0 ? 'Requer intervenção imediata' : 'Zero atrasos'}
          variant={opsAtrasadas.length > 0 ? 'danger' : 'success'}
          icon={ShieldAlert}
        />
      </div>

      {/* Análise de Desvios e Detalhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalhe de Cumprimento por Linha / Setor */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Aderência ao Plano de Produção por Célula
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Metas operacionais e entregas</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Meta: 95%</span>
          </div>

          <div className="space-y-3">
            {[
              { setor: 'Linha de Montagem 01', real: 42, plan: 60, perc: 70, status: 'Atenção' },
              { setor: 'Usinagem Pesada', real: 18, plan: 30, perc: 60, status: 'Atenção' },
              { setor: 'Centro de Usinagem CNC', real: 5, plan: 25, perc: 20, status: 'Crítico' },
              { setor: 'Estamparia & Forja', real: 80, plan: 80, perc: 100, status: 'Concluído' },
            ].map(item => (
              <div key={item.setor} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{item.setor}</span>
                  <span className="font-mono font-bold text-slate-800">{item.real} / {item.plan} un ({item.perc}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.perc}%` }}
                    className={`h-full rounded-full ${
                      item.perc >= 90 ? 'bg-emerald-600' : item.perc >= 50 ? 'bg-amber-500' : 'bg-rose-600'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhe dos Insumos Mais Críticos para o Abastecimento */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Gargalos de Abastecimento (Disponibilidade)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Materiais com maior déficit em relação ao plano</p>
            </div>
          </div>

          <div className="space-y-3">
            {necessidadesAbastecimento
              .filter(n => n.status === 'ESTOQUE_INSUFICIENTE')
              .slice(0, 4)
              .map(nec => (
                <div key={nec.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{nec.materialNome}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Vinculado à {nec.numeroOP} ({nec.produtoNome})
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-rose-700 font-bold">Faltam {nec.quantidadeAAbastecer} {nec.unidadeMedida}</div>
                    <div className="text-[10px] text-slate-500">Saldo: {nec.quantidadeDisponivelEstoque} {nec.unidadeMedida}</div>
                  </div>
                </div>
              ))}

            {necessidadesAbastecimento.filter(n => n.status === 'ESTOQUE_INSUFICIENTE').length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum gargalo de abastecimento ativo no momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
