import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TipoRelatorio } from '../../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Package, 
  PauseCircle, 
  User, 
  Cpu 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    ordens, 
    produtos, 
    estoque, 
    movimentacoes, 
    apontamentos, 
    paradas, 
    necessidadesAbastecimento,
    temPermissao 
  } = useApp();

  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('PRODUCAO_DIARIA');
  const [dataInicio, setDataInicio] = useState('2026-10-01');
  const [dataFim, setDataFim] = useState('2026-10-06');
  const [termoBusca, setTermoBusca] = useState('');

  const relatoriosDisponiveis = [
    { id: 'PRODUCAO_DIARIA', nome: '01. Produção Diária', desc: 'Apontamentos e volume produzido no dia' },
    { id: 'PRODUCAO_SEMANAL', nome: '02. Produção Semanal', desc: 'Consolidado semanal de peças e cumprimento' },
    { id: 'PRODUCAO_MENSAL', nome: '03. Produção Mensal', desc: 'Fechamento mensal e eficiência' },
    { id: 'OPS_CONCLUIDAS', nome: '04. OPs Concluídas', desc: 'Histórico de ordens finalizadas com sucesso' },
    { id: 'OPS_ATRASADAS', nome: '05. OPs Atrasadas', desc: 'Ordens com prazo de entrega extrapolado' },
    { id: 'CONSUMO_MATERIAIS', nome: '06. Consumo de Materiais', desc: 'Insumos transferidos e consumidos na fábrica' },
    { id: 'NECESSIDADES_ABASTECIMENTO', nome: '07. Necessidades de Abastecimento', desc: 'Demandas pendentes da linha por OP' },
    { id: 'ESTOQUE_CRITICO', nome: '08. Estoque Crítico', desc: 'Materiais com saldo abaixo do estoque mínimo' },
    { id: 'PARADAS_PRODUCAO', nome: '09. Paradas de Produção', desc: 'Registro de quebras, setups e minutos perdidos' },
    { id: 'PRODUTIVIDADE_OPERADOR', nome: '10. Produtividade por Operador', desc: 'Rendimento horário e refugo por colaborador' },
    { id: 'PRODUTIVIDADE_MAQUINA', nome: '11. Produtividade por Máquina', desc: 'Horas trabalhadas e peças por equipamento' },
  ];

  // Gerar dados tabulares do relatório ativo
  const gerarDadosRelatorio = () => {
    switch (tipoRelatorio) {
      case 'PRODUCAO_DIARIA':
      case 'PRODUCAO_SEMANAL':
      case 'PRODUCAO_MENSAL':
        return apontamentos.map(a => ({
          Data: a.data,
          OP: a.numeroOP,
          Produto: a.produtoNome,
          Operador: a.operador,
          Máquina: a.maquina,
          'Produção Total': a.quantidadeProduzida,
          'Aprovadas': a.quantidadeAprovada,
          'Rejeitadas': a.quantidadeRejeitada,
          'Refugo (%)': `${a.refugoPercentual}%`,
          'Eficiência (%)': `${a.eficienciaPercentual}%`,
          'Produtividade (pç/h)': a.produtividadePecasHora,
        }));

      case 'OPS_CONCLUIDAS':
        return ordens
          .filter(o => o.status === 'CONCLUIDA')
          .map(o => ({
            'Número OP': o.numeroOP,
            Produto: o.produtoNome,
            Código: o.produtoCodigo,
            'Qtd Planejada': o.quantidadePlanejada,
            'Qtd Produzida': o.quantidadeProduzida,
            'Data Início': o.dataInicio,
            'Data Conclusão': o.dataConclusao || o.dataPrevisaoTermino,
            Setor: o.setorResponsavel,
            Máquina: o.maquina,
          }));

      case 'OPS_ATRASADAS':
        return ordens
          .filter(o => o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA' && o.dataPrevisaoTermino < '2026-10-06')
          .map(o => ({
            'Número OP': o.numeroOP,
            Produto: o.produtoNome,
            'Qtd Planejada': o.quantidadePlanejada,
            'Qtd Produzida': o.quantidadeProduzida,
            'Previsão Término': o.dataPrevisaoTermino,
            Setor: o.setorResponsavel,
            Máquina: o.maquina,
            Prioridade: o.prioridade,
            Status: o.status,
          }));

      case 'CONSUMO_MATERIAIS':
        return movimentacoes
          .filter(m => m.tipo === 'SAIDA_PRODUCAO' || m.tipo === 'TRANSFERENCIA_LINHA')
          .map(m => ({
            'Data/Hora': m.dataHora,
            'Código Material': m.materialCodigo,
            Material: m.materialNome,
            Tipo: m.tipo,
            Quantidade: m.quantidade,
            Origem: m.origem,
            Destino: m.destino,
            'OP Relacionada': m.opRelacionada || '-',
            Responsável: m.responsavel,
          }));

      case 'NECESSIDADES_ABASTECIMENTO':
        return necessidadesAbastecimento.map(n => ({
          OP: n.numeroOP,
          Produto: n.produtoNome,
          Material: n.materialNome,
          'Qtd Necessária': n.quantidadeNecessaria,
          'Disponível Estoque': n.quantidadeDisponivelEstoque,
          'Qtd a Abastecer': n.quantidadeAAbastecer,
          Unidade: n.unidadeMedida,
          'Local Estoque': n.localEstoque,
          'Destino Linha': n.setorDestino,
          Prioridade: n.prioridadeOP,
          Status: n.status,
        }));

      case 'ESTOQUE_CRITICO':
        return estoque
          .filter(e => e.estoqueAtual < e.estoqueMinimo)
          .map(e => ({
            Código: e.codigo,
            Material: e.nome,
            Categoria: e.categoria,
            'Estoque Atual': e.estoqueAtual,
            'Estoque Mínimo': e.estoqueMinimo,
            Déficit: e.estoqueMinimo - e.estoqueAtual,
            Unidade: e.unidadeMedida,
            Localização: e.localArmazenamento,
          }));

      case 'PARADAS_PRODUCAO':
        return paradas.map(p => ({
          Data: p.data,
          Máquina: p.maquina,
          Setor: p.setor,
          'Início': p.horarioInicio,
          'Término': p.horarioTermino || 'Em andamento',
          'Duração (min)': p.duracaoMinutos,
          Motivo: p.motivo,
          'Descrição Ocorrência': p.descricaoMotivo,
          Responsável: p.responsavel,
          'Ação / Obs': p.observacao || '-',
        }));

      case 'PRODUTIVIDADE_OPERADOR': {
        const mapa: Record<string, { totalPecas: number; aprovadas: number; minutos: number; ops: number }> = {};
        apontamentos.forEach(a => {
          if (!mapa[a.operador]) {
            mapa[a.operador] = { totalPecas: 0, aprovadas: 0, minutos: 0, ops: 0 };
          }
          mapa[a.operador].totalPecas += a.quantidadeProduzida;
          mapa[a.operador].aprovadas += a.quantidadeAprovada;
          mapa[a.operador].minutos += a.duracaoMinutos;
          mapa[a.operador].ops += 1;
        });

        return Object.entries(mapa).map(([operador, dados]) => {
          const horas = dados.minutos / 60;
          const pPecasHora = horas > 0 ? (dados.totalPecas / horas).toFixed(1) : '0';
          const refugo = dados.totalPecas > 0 ? (((dados.totalPecas - dados.aprovadas) / dados.totalPecas) * 100).toFixed(1) : '0';
          return {
            Operador: operador,
            'Apontamentos Realizados': dados.ops,
            'Total Produzido': dados.totalPecas,
            'Peças Aprovadas': dados.aprovadas,
            'Horas Trabalhadas': horas.toFixed(1) + 'h',
            'Produtividade (pç/h)': pPecasHora,
            'Índice Refugo': refugo + '%',
          };
        });
      }

      case 'PRODUTIVIDADE_MAQUINA': {
        const mapa: Record<string, { totalPecas: number; aprovadas: number; minutos: number }> = {};
        apontamentos.forEach(a => {
          if (!mapa[a.maquina]) {
            mapa[a.maquina] = { totalPecas: 0, aprovadas: 0, minutos: 0 };
          }
          mapa[a.maquina].totalPecas += a.quantidadeProduzida;
          mapa[a.maquina].aprovadas += a.quantidadeAprovada;
          mapa[a.maquina].minutos += a.duracaoMinutos;
        });

        return Object.entries(mapa).map(([maquina, dados]) => {
          const horas = dados.minutos / 60;
          return {
            'Máquina / Equipamento': maquina,
            'Peças Produzidas': dados.totalPecas,
            'Peças Aprovadas': dados.aprovadas,
            'Horas Operadas': horas.toFixed(1) + 'h',
            'Rendimento Horário': horas > 0 ? (dados.totalPecas / horas).toFixed(1) + ' pç/h' : '0 pç/h',
          };
        });
      }

      default:
        return [];
    }
  };

  const dados = gerarDadosRelatorio();

  // Exportar para Excel (.xlsx)
  const exportarExcel = () => {
    if (dados.length === 0) {
      alert('Não há dados para exportar neste relatório.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    const nomeArquivo = `APP_Producao_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  };

  // Exportar para PDF
  const exportarPDF = () => {
    if (dados.length === 0) {
      alert('Não há dados para exportar neste relatório.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const infoRelatorio = relatoriosDisponiveis.find(r => r.id === tipoRelatorio);
    const titulo = infoRelatorio ? infoRelatorio.nome : 'Relatório Industrial';

    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('APP Produção - Sistema Integrado de Manufatura', 40, 40);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório: ${titulo}`, 40, 60);

    doc.setFontSize(9);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | Total de registros: ${dados.length}`, 40, 75);

    // Renderizar tabela simples em texto formatado
    const chaves = Object.keys(dados[0]);
    let startY = 105;
    const lineHeight = 16;
    const colWidth = 750 / chaves.length;

    // Cabeçalhos de coluna
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    chaves.forEach((chave, index) => {
      doc.text(String(chave).substring(0, 18), 40 + index * colWidth, startY);
    });

    doc.setLineWidth(0.5);
    doc.line(40, startY + 4, 790, startY + 4);
    startY += 18;

    // Linhas
    doc.setFont('helvetica', 'normal');
    dados.slice(0, 24).forEach(linha => {
      chaves.forEach((chave, index) => {
        const val = String((linha as Record<string, unknown>)[chave] ?? '-');
        doc.text(val.substring(0, 20), 40 + index * colWidth, startY);
      });
      startY += lineHeight;
    });

    if (dados.length > 24) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`... e mais ${dados.length - 24} registros (utilize exportação Excel para visualização irrestrita).`, 40, startY + 10);
    }

    doc.save(`APP_Producao_${tipoRelatorio}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Relatórios Industriais & Exportação
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidação gerencial de turnos, estoque, paradas e ordens com emissão em PDF e Excel.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={exportarExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Exportar Excel (.xlsx)
          </button>

          <button
            onClick={exportarPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-700" />
            Exportar PDF (.pdf)
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Seletor do Tipo de Relatório (11 tipos requeridos) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 no-print">
        <label className="block text-xs font-semibold text-slate-900">
          Selecione o Modelo de Relatório Gerencial:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {relatoriosDisponiveis.map(rel => {
            const isSelected = tipoRelatorio === rel.id;
            return (
              <button
                key={rel.id}
                onClick={() => setTipoRelatorio(rel.id as TipoRelatorio)}
                className={`p-2.5 text-left rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="truncate">{rel.nome}</div>
                <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">{rel.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela de Visualização dos Dados do Relatório */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {relatoriosDisponiveis.find(r => r.id === tipoRelatorio)?.nome}
            </h2>
            <p className="text-xs text-slate-500">
              Visualização prévia do conjunto de dados para conferência e exportação
            </p>
          </div>
          <span className="font-mono text-xs text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
            {dados.length} linhas
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {dados.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum dado encontrado para o relatório selecionado.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 sticky top-0">
                <tr>
                  {Object.keys(dados[0]).map(coluna => (
                    <th key={coluna} className="px-4 py-2.5 font-semibold border-b border-slate-200 whitespace-nowrap">
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.map((linha, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(linha).map((val, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                        {String(val ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
