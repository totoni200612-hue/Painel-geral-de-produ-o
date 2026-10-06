import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ItemEstoque, TipoMovimentacaoEstoque, UnidadeMedida } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Warehouse, 
  Search, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  ArrowLeftRight, 
  AlertTriangle, 
  Clock, 
  History,
  Boxes,
  CheckCircle2
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { 
    estoque, 
    movimentacoes, 
    registrarMovimentacao, 
    adicionarItemEstoque, 
    necessidadesAbastecimento, 
    temPermissao 
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'saldo' | 'movimentacoes'>('saldo');
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');

  // Modal de Movimentação
  const [modalMovAberto, setModalMovAberto] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [tipoMov, setTipoMov] = useState<TipoMovimentacaoEstoque>('ENTRADA');
  const [quantidadeMov, setQuantidadeMov] = useState(10);
  const [origemMov, setOrigemMov] = useState('');
  const [destinoMov, setDestinoMov] = useState('');
  const [motivoMov, setMotivoMov] = useState('');

  // Modal Novo Item de Estoque
  const [modalNovoItemAberto, setModalNovoItemAberto] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<ItemEstoque['categoria']>('MATERIA_PRIMA');
  const [novaUnidade, setNovaUnidade] = useState<UnidadeMedida>('KG');
  const [novoEstoqueAtual, setNovoEstoqueAtual] = useState(100);
  const [novoEstoqueMinimo, setNovoEstoqueMinimo] = useState(50);
  const [novoEstoqueMaximo, setNovoEstoqueMaximo] = useState(1000);
  const [novoLocal, setNovoLocal] = useState('');
  const [novoCusto, setNovoCusto] = useState(10);

  const abrirModalMov = (item?: ItemEstoque, tipoSugerido?: TipoMovimentacaoEstoque) => {
    if (item) {
      setMaterialId(item.id);
      setOrigemMov(item.localArmazenamento);
      setDestinoMov(tipoSugerido === 'ENTRADA' ? item.localArmazenamento : 'Chão de Fábrica');
    } else if (estoque.length > 0) {
      setMaterialId(estoque[0].id);
      setOrigemMov('Fornecedor');
      setDestinoMov(estoque[0].localArmazenamento);
    }
    if (tipoSugerido) setTipoMov(tipoSugerido);
    setQuantidadeMov(50);
    setMotivoMov('');
    setModalMovAberto(true);
  };

  const handleSalvarMovimentacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantidadeMov <= 0) return;

    registrarMovimentacao({
      materialId,
      tipo: tipoMov,
      quantidade: Number(quantidadeMov),
      origem: origemMov || 'Almoxarifado',
      destino: destinoMov || 'Produção',
      motivo: motivoMov,
    });

    setModalMovAberto(false);
  };

  const handleSalvarNovoItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCodigo || !novoNome) return;

    adicionarItemEstoque({
      codigo: novoCodigo,
      nome: novoNome,
      categoria: novaCategoria,
      unidadeMedida: novaUnidade,
      estoqueAtual: Number(novoEstoqueAtual),
      estoqueMinimo: Number(novoEstoqueMinimo),
      estoqueMaximo: Number(novoEstoqueMaximo),
      localArmazenamento: novoLocal || 'Almoxarifado Geral',
      custoUnitario: Number(novoCusto),
    });

    setModalNovoItemAberto(false);
  };

  // Calcular demanda acumulada e quantidade a abastecer por item
  // Quantidade a abastecer = quantidade necessária das OPs ativas - quantidade disponível no estoque
  const calcularDemandaEAbastecer = (item: ItemEstoque) => {
    const necsDoItem = necessidadesAbastecimento.filter(n => n.materialId === item.id);
    const totalNecessario = necsDoItem.reduce((acc, n) => acc + n.quantidadeNecessaria, 0);
    const quantidadeAAbastecerCalculada = Math.max(0, Number((totalNecessario - item.estoqueAtual).toFixed(2)));
    return {
      totalNecessario,
      quantidadeAAbastecerCalculada,
    };
  };

  const itensFiltrados = estoque.filter(item => {
    const matchBusca = 
      item.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.localArmazenamento.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;
    if (categoriaFiltro === 'TODAS') return true;
    return item.categoria === categoriaFiltro;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Controle de Estoque & Almoxarifado
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de matérias-primas, entradas, saídas, transferências e cálculo de abastecimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {temPermissao('MOVIMENTAR_ESTOQUE') && (
            <>
              <button
                onClick={() => abrirModalMov(undefined, 'ENTRADA')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Registrar Movimentação
              </button>

              <button
                onClick={() => setModalNovoItemAberto(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Material
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs: Saldo em Estoque vs. Histórico de Movimentações */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setAbaAtiva('saldo')}
          className={`pb-2.5 px-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            abaAtiva === 'saldo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Saldos Físicos & Necessidade de Abastecimento
        </button>
        <button
          onClick={() => setAbaAtiva('movimentacoes')}
          className={`pb-2.5 px-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            abaAtiva === 'movimentacoes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Histórico de Movimentações ({movimentacoes.length})
        </button>
      </div>

      {abaAtiva === 'saldo' ? (
        <>
          {/* Filtros */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por código do material, nome ou localização..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg text-xs">
              {[
                { id: 'TODAS', label: 'Todas' },
                { id: 'MATERIA_PRIMA', label: 'Matéria-Prima' },
                { id: 'COMPONENTE', label: 'Componentes' },
                { id: 'EMBALAGEM', label: 'Embalagens' },
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

          {/* Tabela de Estoque */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Nome do Material</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium text-center">Unid.</th>
                    <th className="px-4 py-3 font-medium text-right">Estoque Mín.</th>
                    <th className="px-4 py-3 font-medium text-right">Estoque Atual</th>
                    <th className="px-4 py-3 font-medium text-right">Estoque Máx.</th>
                    <th className="px-4 py-3 font-medium text-right bg-blue-50/50">Qtd a Abastecer</th>
                    <th className="px-4 py-3 font-medium">Localização</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itensFiltrados.map(item => {
                    const { totalNecessario, quantidadeAAbastecerCalculada } = calcularDemandaEAbastecer(item);
                    const critico = item.estoqueAtual < item.estoqueMinimo;
                    const esgotado = item.estoqueAtual === 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {item.codigo}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{item.nome}</div>
                          {totalNecessario > 0 && (
                            <div className="text-[10px] text-blue-600 font-mono">
                              Demanda OPs ativas: {totalNecessario} {item.unidadeMedida}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {item.categoria.replace('_', ' ')}
                        </td>

                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                          {item.unidadeMedida}
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-slate-500 tabular-nums">
                          {item.estoqueMinimo}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className={`font-mono font-bold tabular-nums text-sm ${
                            esgotado ? 'text-rose-700' : critico ? 'text-amber-700' : 'text-slate-900'
                          }`}>
                            {item.estoqueAtual}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-slate-500 tabular-nums">
                          {item.estoqueMaximo}
                        </td>

                        {/* Campo com cálculo automático do prompt */}
                        <td className="px-4 py-3 text-right font-mono font-bold bg-blue-50/30 tabular-nums">
                          {quantidadeAAbastecerCalculada > 0 ? (
                            <span className="text-amber-800">
                              {quantidadeAAbastecerCalculada} {item.unidadeMedida}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-medium">0 (Atendido)</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600 text-[11px]">
                          {item.localArmazenamento}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {esgotado ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              Esgotado
                            </span>
                          ) : critico ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Abaixo Mínimo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Normal
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => abrirModalMov(item)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Movimentar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Histórico de Movimentações */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Data / Hora</th>
                  <th className="px-4 py-3 font-medium">Tipo Movimentação</th>
                  <th className="px-4 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium text-right">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Destino</th>
                  <th className="px-4 py-3 font-medium">OP Relacionada</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimentacoes.map(mov => {
                  const isEntrada = mov.tipo === 'ENTRADA';
                  const isTransf = mov.tipo === 'TRANSFERENCIA_LINHA';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {mov.dataHora}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded border ${
                          isEntrada
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isTransf
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {mov.tipo.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{mov.materialNome}</div>
                        <div className="text-[10px] font-mono text-slate-500">{mov.materialCodigo}</div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {mov.quantidade}
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-[11px]">{mov.origem}</td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">{mov.destino}</td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-800">
                        {mov.opRelacionada || '-'}
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-[11px]">{mov.responsavel}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">{mov.motivo || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nova Movimentação */}
      <Modal
        isOpen={modalMovAberto}
        onClose={() => setModalMovAberto(false)}
        title="Registrar Movimentação de Estoque"
        subtitle="Entradas de compras, saídas para fabricação, transferências ou ajustes de inventário."
        maxWidth="md"
      >
        <form onSubmit={handleSalvarMovimentacao} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Material / Insumo *</label>
            <select
              required
              value={materialId}
              onChange={e => setMaterialId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs"
            >
              {estoque.map(m => (
                <option key={m.id} value={m.id}>
                  {m.codigo} - {m.nome} (Atual: {m.estoqueAtual} {m.unidadeMedida})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Tipo de Movimentação *</label>
            <select
              value={tipoMov}
              onChange={e => setTipoMov(e.target.value as TipoMovimentacaoEstoque)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-semibold"
            >
              <option value="ENTRADA">Entrada (Recebimento de Compras / Fornecedor)</option>
              <option value="SAIDA_PRODUCAO">Saída de Produção (Consumo Direto / Descarte)</option>
              <option value="TRANSFERENCIA_LINHA">Transferência para Linha de Montagem / Posto</option>
              <option value="AJUSTE">Ajuste de Inventário Físico</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Quantidade *</label>
            <input
              type="number"
              step="0.01"
              required
              value={quantidadeMov}
              onChange={e => setQuantidadeMov(Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Origem</label>
              <input
                type="text"
                value={origemMov}
                onChange={e => setOrigemMov(e.target.value)}
                placeholder="Ex: Fornecedor NF 123"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Destino</label>
              <input
                type="text"
                value={destinoMov}
                onChange={e => setDestinoMov(e.target.value)}
                placeholder="Ex: Linha de Montagem 01"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Motivo / Justificativa</label>
            <input
              type="text"
              value={motivoMov}
              onChange={e => setMotivoMov(e.target.value)}
              placeholder="Ex: Abastecimento de linha, compra periódica, auditoria..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalMovAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Confirmar Movimentação
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Novo Item de Estoque */}
      <Modal
        isOpen={modalNovoItemAberto}
        onClose={() => setModalNovoItemAberto(false)}
        title="Cadastrar Novo Material no Almoxarifado"
        subtitle="Defina os parâmetros de estoque mínimo, máximo e custos unitários."
        maxWidth="lg"
      >
        <form onSubmit={handleSalvarNovoItem} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Código do Material *</label>
              <input
                type="text"
                required
                value={novoCodigo}
                onChange={e => setNovoCodigo(e.target.value)}
                placeholder="Ex: MP-ACO-1045"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nome do Material *</label>
              <input
                type="text"
                required
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                placeholder="Ex: Barra Laminada SAE 1045"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Categoria</label>
              <select
                value={novaCategoria}
                onChange={e => setNovaCategoria(e.target.value as ItemEstoque['categoria'])}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="MATERIA_PRIMA">Matéria-Prima</option>
                <option value="COMPONENTE">Componente Mecânico/Eletrônico</option>
                <option value="EMBALAGEM">Material de Embalagem</option>
                <option value="PRODUTO_ACABADO">Produto Acabado</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Unidade de Medida</label>
              <select
                value={novaUnidade}
                onChange={e => setNovaUnidade(e.target.value as UnidadeMedida)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-mono"
              >
                <option value="KG">KG - Quilograma</option>
                <option value="PC">PC - Peça</option>
                <option value="UN">UN - Unidade</option>
                <option value="M">M - Metro</option>
                <option value="L">L - Litro</option>
                <option value="CX">CX - Caixa</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Estoque Inicial</label>
              <input
                type="number"
                min="0"
                value={novoEstoqueAtual}
                onChange={e => setNovoEstoqueAtual(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={novoEstoqueMinimo}
                onChange={e => setNovoEstoqueMinimo(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Estoque Máximo</label>
              <input
                type="number"
                min="0"
                value={novoEstoqueMaximo}
                onChange={e => setNovoEstoqueMaximo(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={novoCusto}
                onChange={e => setNovoCusto(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Local de Armazenamento</label>
              <input
                type="text"
                value={novoLocal}
                onChange={e => setNovoLocal(e.target.value)}
                placeholder="Ex: Almoxarifado Central - Prateleira B-04"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalNovoItemAberto(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Salvar Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
