import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Produto, UnidadeMedida, StatusProduto, BOMItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Plus, Search, Edit2, Trash2, Package, Layers, Clock, AlertCircle } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { produtos, adicionarProduto, atualizarProduto, removerProduto, estoque, temPermissao } = useApp();

  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  // Estados do formulário
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedida>('UN');
  const [tempoPadraoMinutos, setTempoPadraoMinutos] = useState(45);
  const [estoqueMinimo, setEstoqueMinimo] = useState(20);
  const [estoqueAtual, setEstoqueAtual] = useState(0);
  const [localArmazenamento, setLocalArmazenamento] = useState('');
  const [status, setStatus] = useState<StatusProduto>('ATIVO');
  
  // Lista BOM (Estrutura de Materiais)
  const [estrutura, setEstrutura] = useState<BOMItem[]>([]);
  const [materialSelecionadoId, setMaterialSelecionadoId] = useState('');
  const [qtdMaterialBOM, setQtdMaterialBOM] = useState(1);

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setCodigo(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setNome('');
    setDescricao('');
    setUnidadeMedida('UN');
    setTempoPadraoMinutos(45);
    setEstoqueMinimo(20);
    setEstoqueAtual(0);
    setLocalArmazenamento('Expedição - Prateleira EX-01');
    setStatus('ATIVO');
    setEstrutura([]);
    setModalAberto(true);
  };

  const abrirModalEditar = (prod: Produto) => {
    setProdutoEditando(prod);
    setCodigo(prod.codigo);
    setNome(prod.nome);
    setDescricao(prod.descricao);
    setUnidadeMedida(prod.unidadeMedida);
    setTempoPadraoMinutos(prod.tempoPadraoMinutos);
    setEstoqueMinimo(prod.estoqueMinimo);
    setEstoqueAtual(prod.estoqueAtual);
    setLocalArmazenamento(prod.localArmazenamento);
    setStatus(prod.status);
    setEstrutura(prod.estruturaMateriais || []);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !nome) {
      alert('Preencha código e nome do produto.');
      return;
    }

    const payload = {
      codigo,
      nome,
      descricao,
      unidadeMedida,
      tempoPadraoMinutos: Number(tempoPadraoMinutos),
      estoqueMinimo: Number(estoqueMinimo),
      estoqueAtual: Number(estoqueAtual),
      localArmazenamento,
      status,
      estruturaMateriais: estrutura,
    };

    if (produtoEditando) {
      atualizarProduto(produtoEditando.id, payload);
    } else {
      adicionarProduto(payload);
    }

    setModalAberto(false);
  };

  const adicionarMaterialBOM = () => {
    if (!materialSelecionadoId) return;
    const mat = estoque.find(m => m.id === materialSelecionadoId);
    if (!mat) return;

    if (estrutura.some(item => item.materialId === mat.id)) {
      alert('Este material já consta na estrutura.');
      return;
    }

    const novoItem: BOMItem = {
      materialId: mat.id,
      codigoMaterial: mat.codigo,
      nomeMaterial: mat.nome,
      quantidadePorUnidade: Number(qtdMaterialBOM),
      unidadeMedida: mat.unidadeMedida,
    };

    setEstrutura(prev => [...prev, novoItem]);
    setMaterialSelecionadoId('');
    setQtdMaterialBOM(1);
  };

  const removerMaterialBOM = (matId: string) => {
    setEstrutura(prev => prev.filter(item => item.materialId !== matId));
  };

  const produtosFiltrados = produtos.filter(p => 
    p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cadastro de Produtos & Estrutura (BOM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento do catálogo fabril, tempos padrão de ciclo e insumos necessários.
          </p>
        </div>

        {temPermissao('CRIAR_PRODUTO') && (
          <button
            onClick={abrirModalNovo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Produto
          </button>
        )}
      </div>

      {/* Barra de Busca e Filtro */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por código, nome ou especificação..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Total: <span className="font-bold text-slate-900">{produtosFiltrados.length}</span> produtos
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Nome & Descrição</th>
                <th className="px-4 py-3 font-medium text-center">Unid.</th>
                <th className="px-4 py-3 font-medium text-right">Tempo Padrão</th>
                <th className="px-4 py-3 font-medium text-right">Estoque Mín.</th>
                <th className="px-4 py-3 font-medium text-right">Estoque Atual</th>
                <th className="px-4 py-3 font-medium">Localização</th>
                <th className="px-4 py-3 font-medium text-center">Insumos (BOM)</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtosFiltrados.map(prod => {
                const emAlerta = prod.estoqueAtual < prod.estoqueMinimo;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {prod.codigo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{prod.nome}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">{prod.descricao}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-center text-slate-600">
                      {prod.unidadeMedida}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                      {prod.tempoPadraoMinutos} min
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {prod.estoqueMinimo}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold tabular-nums ${emAlerta ? 'text-amber-600' : 'text-slate-900'}`}>
                        {prod.estoqueAtual}
                      </span>
                      {emAlerta && (
                        <span className="block text-[10px] text-amber-600">Abaixo mín.</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px]">
                      {prod.localArmazenamento}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {prod.estruturaMateriais?.length || 0} itens
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={prod.status} type="produto" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {temPermissao('EDITAR_PRODUTO') && (
                          <button
                            onClick={() => abrirModalEditar(prod)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar produto e BOM"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {temPermissao('CRIAR_PRODUTO') && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir o produto ${prod.nome}?`)) {
                                removerProduto(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro / Edição */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title={produtoEditando ? `Editar Produto: ${produtoEditando.codigo}` : 'Cadastrar Novo Produto'}
        subtitle="Defina os parâmetros industriais e a estrutura de materiais (BOM)."
        maxWidth="2xl"
      >
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Código do Produto *</label>
              <input
                type="text"
                required
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: PRD-VC-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nome do Produto *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: Válvula Hidráulica VC-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Descrição Técnica</label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                placeholder="Especificações mecânicas, aplicação, normas..."
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Unidade de Medida</label>
              <select
                value={unidadeMedida}
                onChange={e => setUnidadeMedida(e.target.value as UnidadeMedida)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-mono"
              >
                <option value="UN">UN - Unidade</option>
                <option value="PC">PC - Peça</option>
                <option value="KG">KG - Quilograma</option>
                <option value="M">M - Metro</option>
                <option value="CX">CX - Caixa</option>
                <option value="L">L - Litro</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tempo Padrão (Minutos/un)</label>
              <input
                type="number"
                min="1"
                value={tempoPadraoMinutos}
                onChange={e => setTempoPadraoMinutos(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={estoqueMinimo}
                onChange={e => setEstoqueMinimo(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Estoque Atual</label>
              <input
                type="number"
                min="0"
                value={estoqueAtual}
                onChange={e => setEstoqueAtual(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Local de Armazenamento</label>
              <input
                type="text"
                value={localArmazenamento}
                onChange={e => setLocalArmazenamento(e.target.value)}
                placeholder="Ex: Expedição - Prateleira EX-01"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StatusProduto)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="HOMOLOGACAO">Em Homologação</option>
              </select>
            </div>
          </div>

          {/* Seção Estrutura de Materiais (BOM) */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Estrutura de Materiais (BOM - Bill of Materials)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Insumos consumidos para fabricar 1 unidade deste produto. O abastecimento calcula automaticamente as ordens com base nestes itens.
                </p>
              </div>
            </div>

            {/* Adicionar Insumo */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-end gap-2 text-xs">
              <div className="flex-1 w-full">
                <label className="block font-medium text-slate-600 mb-1">Selecionar Insumo do Estoque</label>
                <select
                  value={materialSelecionadoId}
                  onChange={e => setMaterialSelecionadoId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                >
                  <option value="">Selecione um material...</option>
                  {estoque.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} - {m.nome} (Saldo: {m.estoqueAtual} {m.unidadeMedida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28">
                <label className="block font-medium text-slate-600 mb-1">Qtd / Peça</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={qtdMaterialBOM}
                  onChange={e => setQtdMaterialBOM(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white font-mono text-xs"
                />
              </div>

              <button
                type="button"
                onClick={adicionarMaterialBOM}
                disabled={!materialSelecionadoId}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded text-xs disabled:opacity-50 cursor-pointer"
              >
                Adicionar Insumo
              </button>
            </div>

            {/* Tabela de Insumos da BOM */}
            <div className="mt-2.5 max-h-40 overflow-y-auto border border-slate-200 rounded-md">
              {estrutura.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Nenhum insumo vinculado a este produto ainda.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">Código</th>
                      <th className="px-3 py-1.5 font-medium">Nome do Material</th>
                      <th className="px-3 py-1.5 font-medium text-right">Qtd Consumida</th>
                      <th className="px-3 py-1.5 font-medium text-center">Unid.</th>
                      <th className="px-3 py-1.5 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {estrutura.map(item => (
                      <tr key={item.materialId} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-slate-800">{item.codigoMaterial}</td>
                        <td className="px-3 py-1.5 text-slate-700">{item.nomeMaterial}</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {item.quantidadePorUnidade}
                        </td>
                        <td className="px-3 py-1.5 text-center font-mono text-slate-500">{item.unidadeMedida}</td>
                        <td className="px-3 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => removerMaterialBOM(item.materialId)}
                            className="text-rose-600 hover:text-rose-800 font-medium text-[11px]"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
              {produtoEditando ? 'Salvar Alterações' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
