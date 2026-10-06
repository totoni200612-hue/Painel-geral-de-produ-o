import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Produto, 
  ItemEstoque, 
  OrdemProducao, 
  MovimentacaoEstoque, 
  ApontamentoProducao, 
  ParadaMaquina, 
  Usuario, 
  PerfilUsuario, 
  NecessidadeAbastecimento, 
  Alerta, 
  TipoMovimentacaoEstoque,
  StatusOP,
  Prioridade
} from '../types';
import { 
  INITIAL_USUARIOS, 
  INITIAL_ESTOQUE, 
  INITIAL_PRODUTOS, 
  INITIAL_ORDENS, 
  INITIAL_MOVIMENTACOES, 
  INITIAL_APONTAMENTOS, 
  INITIAL_PARADAS 
} from '../mockData/initialData';

interface AppContextType {
  // Usuários e sessão
  usuarios: Usuario[];
  usuarioAtivo: Usuario;
  setUsuarioAtivo: (usuario: Usuario) => void;
  temPermissao: (acao: string) => boolean;

  // Navegação
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Produtos
  produtos: Produto[];
  adicionarProduto: (produto: Omit<Produto, 'id'>) => void;
  atualizarProduto: (id: string, produto: Partial<Produto>) => void;
  removerProduto: (id: string) => void;

  // Ordens de Produção
  ordens: OrdemProducao[];
  adicionarOrdem: (ordem: Omit<OrdemProducao, 'id' | 'numeroOP' | 'quantidadeProduzida' | 'quantidadeRejeitada' | 'abastecido'>) => void;
  atualizarStatusOP: (id: string, novoStatus: StatusOP, observacoes?: string) => void;
  atualizarOrdem: (id: string, ordem: Partial<OrdemProducao>) => void;
  removerOrdem: (id: string) => void;

  // Estoque & Movimentações
  estoque: ItemEstoque[];
  movimentacoes: MovimentacaoEstoque[];
  registrarMovimentacao: (dados: {
    materialId: string;
    tipo: TipoMovimentacaoEstoque;
    quantidade: number;
    origem: string;
    destino: string;
    motivo?: string;
    opRelacionada?: string;
  }) => void;
  adicionarItemEstoque: (item: Omit<ItemEstoque, 'id'>) => void;
  atualizarItemEstoque: (id: string, item: Partial<ItemEstoque>) => void;

  // Abastecimento
  necessidadesAbastecimento: NecessidadeAbastecimento[];
  atenderAbastecimento: (necessidadeId: string, quantidade: number) => { sucesso: boolean; mensagem: string };
  abastecerTodaOP: (opId: string) => { sucesso: boolean; mensagem: string };

  // Apontamento de Produção
  apontamentos: ApontamentoProducao[];
  registrarApontamento: (dados: {
    opId: string;
    operador: string;
    maquina: string;
    horarioInicio: string;
    horarioTermino: string;
    quantidadeAprovada: number;
    quantidadeRejeitada: number;
    motivoRejeicao?: string;
    paradasMinutos: number;
  }) => void;

  // Paradas de Máquina
  paradas: ParadaMaquina[];
  registrarParada: (dados: Omit<ParadaMaquina, 'id' | 'duracaoMinutos' | 'emAndamento'> & { emAndamento?: boolean; horarioTermino?: string }) => void;
  finalizarParada: (id: string, horarioTermino: string, observacao?: string) => void;

  // Alertas
  alertas: Alerta[];
  marcarAlertaLido: (id: string) => void;
  marcarTodosAlertasLidos: () => void;

  // Gestão de Usuários
  adicionarUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  atualizarUsuario: (id: string, usuario: Partial<Usuario>) => void;

  // Reset
  resetarDados: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'app_producao_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Carregar ou inicializar estado
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'usuarios');
    return saved ? JSON.parse(saved) : INITIAL_USUARIOS;
  });

  const [usuarioAtivo, setUsuarioAtivo] = useState<Usuario>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_PREFIX + 'usuario_ativo_id');
    const found = INITIAL_USUARIOS.find(u => u.id === savedId);
    return found || INITIAL_USUARIOS[0];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'produtos');
    return saved ? JSON.parse(saved) : INITIAL_PRODUTOS;
  });

  const [ordens, setOrdens] = useState<OrdemProducao[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'ordens');
    return saved ? JSON.parse(saved) : INITIAL_ORDENS;
  });

  const [estoque, setEstoque] = useState<ItemEstoque[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'estoque');
    return saved ? JSON.parse(saved) : INITIAL_ESTOQUE;
  });

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'movimentacoes');
    return saved ? JSON.parse(saved) : INITIAL_MOVIMENTACOES;
  });

  const [apontamentos, setApontamentos] = useState<ApontamentoProducao[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'apontamentos');
    return saved ? JSON.parse(saved) : INITIAL_APONTAMENTOS;
  });

  const [paradas, setParadas] = useState<ParadaMaquina[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'paradas');
    return saved ? JSON.parse(saved) : INITIAL_PARADAS;
  });

  const [alertasLidos, setAlertasLidos] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'alertas_lidos');
    return saved ? JSON.parse(saved) : {};
  });

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'usuario_ativo_id', usuarioAtivo.id);
  }, [usuarioAtivo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'ordens', JSON.stringify(ordens));
  }, [ordens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'estoque', JSON.stringify(estoque));
  }, [estoque]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'movimentacoes', JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'apontamentos', JSON.stringify(apontamentos));
  }, [apontamentos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'paradas', JSON.stringify(paradas));
  }, [paradas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'alertas_lidos', JSON.stringify(alertasLidos));
  }, [alertasLidos]);

  // Controle de permissões baseado no perfil
  const temPermissao = useCallback((acao: string): boolean => {
    const perfil = usuarioAtivo.perfil;
    if (perfil === 'ADMINISTRADOR') return true;

    switch (acao) {
      case 'CRIAR_OP':
      case 'EDITAR_OP':
      case 'CRIAR_PRODUTO':
      case 'EDITAR_PRODUTO':
        return perfil === 'PCP';
      case 'REGISTRAR_APONTAMENTO':
      case 'REGISTRAR_PARADA':
        return perfil === 'PRODUCAO' || perfil === 'PCP';
      case 'MOVIMENTAR_ESTOQUE':
      case 'ATENDER_ABASTECIMENTO':
        return perfil === 'ESTOQUE';
      case 'GERENCIAR_USUARIOS':
        return false;
      case 'EXPORTAR_RELATORIOS':
        return perfil !== 'VISUALIZACAO';
      case 'VISUALIZAR':
      default:
        return true;
    }
  }, [usuarioAtivo]);

  // Cálculo automático das Necessidades de Abastecimento para todas as OPs ativas
  const necessidadesAbastecimento = useMemo<NecessidadeAbastecimento[]>(() => {
    const lista: NecessidadeAbastecimento[] = [];

    // OPs relevantes para abastecimento: não concluídas e não canceladas
    const opsAtivas = ordens.filter(o => o.status !== 'CONCLUIDA' && o.status !== 'CANCELADA');

    opsAtivas.forEach(op => {
      const produto = produtos.find(p => p.id === op.produtoId);
      if (!produto || !produto.estruturaMateriais) return;

      produto.estruturaMateriais.forEach(bom => {
        const itemEstoque = estoque.find(e => e.id === bom.materialId);
        const qtdNecessaria = Number((op.quantidadePlanejada * bom.quantidadePorUnidade).toFixed(2));
        
        // Calcular quanto já foi abastecido para esta OP e material via movimentações de transferência
        const abastecidoMovs = movimentacoes
          .filter(m => m.opRelacionada === op.numeroOP && m.materialId === bom.materialId && m.tipo === 'TRANSFERENCIA_LINHA')
          .reduce((acc, cur) => acc + cur.quantidade, 0);

        // Se a OP estiver marcada como totalmente abastecida ou já tiver quantidade
        const qtdAbastecida = op.abastecido ? qtdNecessaria : Math.min(qtdNecessaria, abastecidoMovs);
        const qtdAAbastecer = Math.max(0, Number((qtdNecessaria - qtdAbastecida).toFixed(2)));
        const qtdDisponivel = itemEstoque ? itemEstoque.estoqueAtual : 0;

        let status: NecessidadeAbastecimento['status'] = 'PENDENTE';
        if (qtdAAbastecer === 0) {
          status = 'ABASTECIDO';
        } else if (qtdDisponivel < qtdAAbastecer) {
          status = 'ESTOQUE_INSUFICIENTE';
        } else if (qtdAbastecida > 0) {
          status = 'PARCIAL';
        } else {
          status = 'PENDENTE';
        }

        lista.push({
          id: `${op.id}-${bom.materialId}`,
          opId: op.id,
          numeroOP: op.numeroOP,
          produtoCodigo: op.produtoCodigo,
          produtoNome: op.produtoNome,
          materialId: bom.materialId,
          materialCodigo: bom.codigoMaterial,
          materialNome: bom.nomeMaterial,
          quantidadeNecessaria: qtdNecessaria,
          quantidadeAbastecida: qtdAbastecida,
          quantidadeDisponivelEstoque: qtdDisponivel,
          quantidadeAAbastecer: qtdAAbastecer,
          unidadeMedida: bom.unidadeMedida,
          localEstoque: itemEstoque ? itemEstoque.localArmazenamento : 'Almoxarifado Geral',
          setorDestino: op.setorResponsavel,
          maquinaDestino: op.maquina,
          prioridadeOP: op.prioridade,
          dataInicioOP: op.dataInicio,
          status,
        });
      });
    });

    return lista;
  }, [ordens, produtos, estoque, movimentacoes]);

  // Alertas inteligentes calculados em tempo real
  const alertas = useMemo<Alerta[]>(() => {
    const lista: Alerta[] = [];
    const hojeStr = '2026-10-06';

    // 1. Alerta de materiais críticos no estoque (< estoque mínimo)
    estoque.forEach(item => {
      if (item.estoqueAtual < item.estoqueMinimo) {
        const id = `alerta-est-crit-${item.id}`;
        lista.push({
          id,
          tipo: 'ESTOQUE_CRITICO',
          severidade: item.estoqueAtual === 0 ? 'CRITICO' : 'ATENCAO',
          titulo: `Estoque Crítico: ${item.codigo}`,
          mensagem: `${item.nome} possui ${item.estoqueAtual} ${item.unidadeMedida} em estoque (mínimo exigido: ${item.estoqueMinimo} ${item.unidadeMedida}).`,
          dataHora: hojeStr + ' 07:00',
          lido: !!alertasLidos[id],
          linkAcao: 'estoque',
          metaRefId: item.id,
        });
      }
    });

    // 2. Alerta de material insuficiente para Ordens em Produção ou Liberadas
    necessidadesAbastecimento.forEach(nec => {
      if (nec.status === 'ESTOQUE_INSUFICIENTE') {
        const id = `alerta-insuf-${nec.id}`;
        lista.push({
          id,
          tipo: 'MATERIAL_INSUFICIENTE',
          severidade: 'CRITICO',
          titulo: `Falta de Material para ${nec.numeroOP}`,
          mensagem: `Necessário ${nec.quantidadeAAbastecer} ${nec.unidadeMedida} de "${nec.materialNome}", porém há apenas ${nec.quantidadeDisponivelEstoque} no estoque.`,
          dataHora: hojeStr + ' 08:00',
          lido: !!alertasLidos[id],
          linkAcao: 'abastecimento',
          metaRefId: nec.opId,
        });
      }
    });

    // 3. OPs atrasadas
    ordens.forEach(op => {
      if (op.status !== 'CONCLUIDA' && op.status !== 'CANCELADA') {
        if (op.dataPrevisaoTermino < hojeStr) {
          const id = `alerta-op-atraso-${op.id}`;
          lista.push({
            id,
            tipo: 'OP_ATRASADA',
            severidade: 'CRITICO',
            titulo: `Ordem Atrasada: ${op.numeroOP}`,
            mensagem: `A OP ${op.numeroOP} (${op.produtoNome}) previa término em ${op.dataPrevisaoTermino} e está com status ${op.status}.`,
            dataHora: hojeStr + ' 08:30',
            lido: !!alertasLidos[id],
            linkAcao: 'ordens',
            metaRefId: op.id,
          });
        } else if (op.dataPrevisaoTermino === hojeStr && op.quantidadeProduzida < op.quantidadePlanejada * 0.7) {
          const id = `alerta-op-prazo-${op.id}`;
          lista.push({
            id,
            tipo: 'OP_PROXIMA_PRAZO',
            severidade: 'ATENCAO',
            titulo: `Prazo Hoje: ${op.numeroOP}`,
            mensagem: `Vencimento programado para hoje (${op.quantidadeProduzida}/${op.quantidadePlanejada} produzidos).`,
            dataHora: hojeStr + ' 09:00',
            lido: !!alertasLidos[id],
            linkAcao: 'ordens',
            metaRefId: op.id,
          });
        }
      }
    });

    // 4. Paradas em andamento
    paradas.forEach(p => {
      if (p.emAndamento) {
        const id = `alerta-parada-${p.id}`;
        lista.push({
          id,
          tipo: 'MAQUINA_PARADA',
          severidade: 'CRITICO',
          titulo: `Máquina Parada: ${p.maquina}`,
          mensagem: `Motivo: ${p.descricaoMotivo}. Início: ${p.horarioInicio}. Responsável: ${p.responsavel}.`,
          dataHora: hojeStr + ' ' + p.horarioInicio,
          lido: !!alertasLidos[id],
          linkAcao: 'paradas',
          metaRefId: p.id,
        });
      }
    });

    return lista;
  }, [estoque, necessidadesAbastecimento, ordens, paradas, alertasLidos]);

  // Ações de Produtos
  const adicionarProduto = (produto: Omit<Produto, 'id'>) => {
    const id = 'prod-' + Date.now();
    const novoProduto: Produto = { ...produto, id };
    setProdutos(prev => [novoProduto, ...prev]);
  };

  const atualizarProduto = (id: string, produto: Partial<Produto>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...produto } : p));
  };

  const removerProduto = (id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  // Ações de Ordens de Produção
  const adicionarOrdem = (dados: Omit<OrdemProducao, 'id' | 'numeroOP' | 'quantidadeProduzida' | 'quantidadeRejeitada' | 'abastecido'>) => {
    const id = 'op-' + Date.now();
    const count = ordens.length + 80;
    const numeroOP = `OP-2026-${String(count).padStart(3, '0')}`;
    
    const novaOP: OrdemProducao = {
      ...dados,
      id,
      numeroOP,
      quantidadeProduzida: 0,
      quantidadeRejeitada: 0,
      abastecido: false,
    };
    setOrdens(prev => [novaOP, ...prev]);
  };

  const atualizarStatusOP = (id: string, novoStatus: StatusOP, observacoes?: string) => {
    setOrdens(prev => prev.map(op => {
      if (op.id !== id) return op;
      const updates: Partial<OrdemProducao> = { status: novoStatus };
      if (observacoes) updates.observacoes = observacoes;
      if (novoStatus === 'CONCLUIDA') {
        updates.dataConclusao = new Date().toISOString().split('T')[0];
      }
      return { ...op, ...updates };
    }));
  };

  const atualizarOrdem = (id: string, ordem: Partial<OrdemProducao>) => {
    setOrdens(prev => prev.map(op => op.id === id ? { ...op, ...ordem } : op));
  };

  const removerOrdem = (id: string) => {
    setOrdens(prev => prev.filter(op => op.id !== id));
  };

  // Ações de Estoque
  const registrarMovimentacao = (dados: {
    materialId: string;
    tipo: TipoMovimentacaoEstoque;
    quantidade: number;
    origem: string;
    destino: string;
    motivo?: string;
    opRelacionada?: string;
  }) => {
    const material = estoque.find(m => m.id === dados.materialId);
    if (!material) return;

    const dataHoraStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const novaMov: MovimentacaoEstoque = {
      id: 'mov-' + Date.now(),
      dataHora: dataHoraStr,
      materialId: dados.materialId,
      materialCodigo: material.codigo,
      materialNome: material.nome,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      origem: dados.origem,
      destino: dados.destino,
      responsavel: usuarioAtivo.nome,
      motivo: dados.motivo,
      opRelacionada: dados.opRelacionada,
    };

    setMovimentacoes(prev => [novaMov, ...prev]);

    // Atualizar saldo do estoque
    setEstoque(prev => prev.map(item => {
      if (item.id !== dados.materialId) return item;
      let novoEstoque = item.estoqueAtual;
      if (dados.tipo === 'ENTRADA') {
        novoEstoque += dados.quantidade;
      } else if (dados.tipo === 'SAIDA_PRODUCAO' || dados.tipo === 'TRANSFERENCIA_LINHA') {
        novoEstoque = Math.max(0, novoEstoque - dados.quantidade);
      } else if (dados.tipo === 'AJUSTE') {
        novoEstoque = Math.max(0, novoEstoque + dados.quantidade);
      }
      return { ...item, estoqueAtual: Number(novoEstoque.toFixed(2)) };
    }));
  };

  const adicionarItemEstoque = (item: Omit<ItemEstoque, 'id'>) => {
    const id = 'mat-' + Date.now();
    setEstoque(prev => [...prev, { ...item, id }]);
  };

  const atualizarItemEstoque = (id: string, item: Partial<ItemEstoque>) => {
    setEstoque(prev => prev.map(e => e.id === id ? { ...e, ...item } : e));
  };

  // Ações de Abastecimento
  const atenderAbastecimento = (necessidadeId: string, quantidade: number): { sucesso: boolean; mensagem: string } => {
    const nec = necessidadesAbastecimento.find(n => n.id === necessidadeId);
    if (!nec) return { sucesso: false, mensagem: 'Necessidade não encontrada.' };

    const itemEstoque = estoque.find(e => e.id === nec.materialId);
    if (!itemEstoque) return { sucesso: false, mensagem: 'Material não cadastrado no estoque.' };

    if (itemEstoque.estoqueAtual < quantidade) {
      return { 
        sucesso: false, 
        mensagem: `Estoque insuficiente! Disponível: ${itemEstoque.estoqueAtual} ${nec.unidadeMedida}. Solicitado: ${quantidade} ${nec.unidadeMedida}.` 
      };
    }

    // Registrar movimentação de transferência
    registrarMovimentacao({
      materialId: nec.materialId,
      tipo: 'TRANSFERENCIA_LINHA',
      quantidade,
      origem: itemEstoque.localArmazenamento,
      destino: `${nec.setorDestino} (${nec.maquinaDestino})`,
      motivo: `Abastecimento da OP ${nec.numeroOP}`,
      opRelacionada: nec.numeroOP,
    });

    // Se toda a OP foi atendida em todos os seus materiais, marcar OP como abastecida
    const opNecessidades = necessidadesAbastecimento.filter(n => n.opId === nec.opId);
    const outrasPendentes = opNecessidades.filter(n => n.id !== necessidadeId && n.quantidadeAAbastecer > 0);
    const estaRestante = nec.quantidadeAAbastecer - quantidade;

    if (outrasPendentes.length === 0 && estaRestante <= 0) {
      setOrdens(prev => prev.map(o => o.id === nec.opId ? { ...o, abastecido: true } : o));
    }

    return { 
      sucesso: true, 
      mensagem: `Abastecimento de ${quantidade} ${nec.unidadeMedida} de "${nec.materialNome}" registrado com sucesso para a ${nec.numeroOP}!` 
    };
  };

  const abastecerTodaOP = (opId: string): { sucesso: boolean; mensagem: string } => {
    const op = ordens.find(o => o.id === opId);
    if (!op) return { sucesso: false, mensagem: 'OP não encontrada.' };

    const necsDaOP = necessidadesAbastecimento.filter(n => n.opId === opId && n.quantidadeAAbastecer > 0);
    if (necsDaOP.length === 0) {
      return { sucesso: true, mensagem: `A ordem ${op.numeroOP} já está com abastecimento 100% concluído!` };
    }

    // Verificar se todos os materiais possuem saldo
    for (const nec of necsDaOP) {
      const itemEstoque = estoque.find(e => e.id === nec.materialId);
      if (!itemEstoque || itemEstoque.estoqueAtual < nec.quantidadeAAbastecer) {
        return { 
          sucesso: false, 
          mensagem: `Não é possível abastecer todo o kit: saldo insuficiente para "${nec.materialNome}" (Estoque: ${itemEstoque?.estoqueAtual || 0}, Necessário: ${nec.quantidadeAAbastecer}).` 
        };
      }
    }

    // Transferir todos
    necsDaOP.forEach(nec => {
      const itemEstoque = estoque.find(e => e.id === nec.materialId);
      registrarMovimentacao({
        materialId: nec.materialId,
        tipo: 'TRANSFERENCIA_LINHA',
        quantidade: nec.quantidadeAAbastecer,
        origem: itemEstoque?.localArmazenamento || 'Almoxarifado',
        destino: `${nec.setorDestino} (${nec.maquinaDestino})`,
        motivo: `Abastecimento integral da OP ${op.numeroOP}`,
        opRelacionada: op.numeroOP,
      });
    });

    setOrdens(prev => prev.map(o => o.id === opId ? { ...o, abastecido: true } : o));

    return { sucesso: true, mensagem: `Kit completo de materiais abastecido com sucesso para a ${op.numeroOP}!` };
  };

  // Registrar Apontamento de Produção com cálculos automáticos
  const registrarApontamento = (dados: {
    opId: string;
    operador: string;
    maquina: string;
    horarioInicio: string;
    horarioTermino: string;
    quantidadeAprovada: number;
    quantidadeRejeitada: number;
    motivoRejeicao?: string;
    paradasMinutos: number;
  }) => {
    const op = ordens.find(o => o.id === dados.opId);
    if (!op) return;

    // Calcular duração
    const [hIni, mIni] = dados.horarioInicio.split(':').map(Number);
    const [hFim, mFim] = dados.horarioTermino.split(':').map(Number);
    let duracaoMin = (hFim * 60 + mFim) - (hIni * 60 + mIni);
    if (duracaoMin < 0) duracaoMin += 24 * 60; // Tratamento de turno noturno

    const tempoTrabalhadoEfetivoHoras = Math.max(0.1, (duracaoMin - dados.paradasMinutos) / 60);
    const totalProduzido = dados.quantidadeAprovada + dados.quantidadeRejeitada;

    const produtividadePecasHora = Number((totalProduzido / tempoTrabalhadoEfetivoHoras).toFixed(2));
    const refugoPercentual = totalProduzido > 0 
      ? Number(((dados.quantidadeRejeitada / totalProduzido) * 100).toFixed(2)) 
      : 0;

    // Obter tempo padrão do produto
    const prod = produtos.find(p => p.id === op.produtoId);
    const taktTimeMinutos = prod?.tempoPadraoMinutos || 30;
    const metaProducaoPeriodo = Math.max(1, Math.round((duracaoMin - dados.paradasMinutos) / taktTimeMinutos));
    
    const cumprimentoMetaPercentual = Number(((dados.quantidadeAprovada / metaProducaoPeriodo) * 100).toFixed(1));
    const eficienciaPercentual = Number(((totalProduzido / metaProducaoPeriodo) * 100).toFixed(1));

    const novoApontamento: ApontamentoProducao = {
      id: 'ap-' + Date.now(),
      opId: op.id,
      numeroOP: op.numeroOP,
      produtoCodigo: op.produtoCodigo,
      produtoNome: op.produtoNome,
      operador: dados.operador,
      maquina: dados.maquina,
      setor: op.setorResponsavel,
      data: new Date().toISOString().split('T')[0],
      horarioInicio: dados.horarioInicio,
      horarioTermino: dados.horarioTermino,
      duracaoMinutos: duracaoMin,
      quantidadeProduzida: totalProduzido,
      quantidadeAprovada: dados.quantidadeAprovada,
      quantidadeRejeitada: dados.quantidadeRejeitada,
      motivoRejeicao: dados.motivoRejeicao,
      paradasMinutos: dados.paradasMinutos,
      eficienciaPercentual,
      produtividadePecasHora,
      cumprimentoMetaPercentual,
      refugoPercentual,
    };

    setApontamentos(prev => [novoApontamento, ...prev]);

    // Atualizar a OP com a quantidade aprovada e refugada
    setOrdens(prev => prev.map(o => {
      if (o.id !== op.id) return o;
      const novaQtdProd = o.quantidadeProduzida + dados.quantidadeAprovada;
      const novaQtdRej = o.quantidadeRejeitada + dados.quantidadeRejeitada;
      const novoStatus = novaQtdProd >= o.quantidadePlanejada ? 'CONCLUIDA' : 'EM_PRODUCAO';
      return {
        ...o,
        quantidadeProduzida: novaQtdProd,
        quantidadeRejeitada: novaQtdRej,
        status: o.status === 'CONCLUIDA' ? 'CONCLUIDA' : novoStatus,
        dataConclusao: novoStatus === 'CONCLUIDA' ? new Date().toISOString().split('T')[0] : o.dataConclusao,
      };
    }));
  };

  // Registrar Parada de Máquina
  const registrarParada = (dados: Omit<ParadaMaquina, 'id' | 'duracaoMinutos' | 'emAndamento'> & { emAndamento?: boolean; horarioTermino?: string }) => {
    let duracaoMin = 0;
    const emAndamento = dados.emAndamento ?? !dados.horarioTermino;

    if (dados.horarioTermino) {
      const [hIni, mIni] = dados.horarioInicio.split(':').map(Number);
      const [hFim, mFim] = dados.horarioTermino.split(':').map(Number);
      duracaoMin = (hFim * 60 + mFim) - (hIni * 60 + mIni);
      if (duracaoMin < 0) duracaoMin += 24 * 60;
    }

    const novaParada: ParadaMaquina = {
      ...dados,
      id: 'par-' + Date.now(),
      duracaoMinutos: duracaoMin,
      emAndamento,
    };

    setParadas(prev => [novaParada, ...prev]);
  };

  const finalizarParada = (id: string, horarioTermino: string, observacao?: string) => {
    setParadas(prev => prev.map(p => {
      if (p.id !== id) return p;
      const [hIni, mIni] = p.horarioInicio.split(':').map(Number);
      const [hFim, mFim] = horarioTermino.split(':').map(Number);
      let duracaoMin = (hFim * 60 + mFim) - (hIni * 60 + mIni);
      if (duracaoMin < 0) duracaoMin += 24 * 60;

      return {
        ...p,
        horarioTermino,
        duracaoMinutos: duracaoMin,
        emAndamento: false,
        observacao: observacao ? (p.observacao ? `${p.observacao} | ${observacao}` : observacao) : p.observacao,
      };
    }));
  };

  // Alertas
  const marcarAlertaLido = (id: string) => {
    setAlertasLidos(prev => ({ ...prev, [id]: true }));
  };

  const marcarTodosAlertasLidos = () => {
    const todos: Record<string, boolean> = {};
    alertas.forEach(a => { todos[a.id] = true; });
    setAlertasLidos(todos);
  };

  // Usuários
  const adicionarUsuario = (usuario: Omit<Usuario, 'id'>) => {
    const id = 'user-' + Date.now();
    setUsuarios(prev => [...prev, { ...usuario, id }]);
  };

  const atualizarUsuario = (id: string, usuario: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...usuario } : u));
  };

  // Reset para demonstração
  const resetarDados = () => {
    localStorage.clear();
    setUsuarios(INITIAL_USUARIOS);
    setUsuarioAtivo(INITIAL_USUARIOS[0]);
    setProdutos(INITIAL_PRODUTOS);
    setOrdens(INITIAL_ORDENS);
    setEstoque(INITIAL_ESTOQUE);
    setMovimentacoes(INITIAL_MOVIMENTACOES);
    setApontamentos(INITIAL_APONTAMENTOS);
    setParadas(INITIAL_PARADAS);
    setAlertasLidos({});
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider value={{
      usuarios,
      usuarioAtivo,
      setUsuarioAtivo,
      temPermissao,
      activeTab,
      setActiveTab,
      produtos,
      adicionarProduto,
      atualizarProduto,
      removerProduto,
      ordens,
      adicionarOrdem,
      atualizarStatusOP,
      atualizarOrdem,
      removerOrdem,
      estoque,
      movimentacoes,
      registrarMovimentacao,
      adicionarItemEstoque,
      atualizarItemEstoque,
      necessidadesAbastecimento,
      atenderAbastecimento,
      abastecerTodaOP,
      apontamentos,
      registrarApontamento,
      paradas,
      registrarParada,
      finalizarParada,
      alertas,
      marcarAlertaLido,
      marcarTodosAlertasLidos,
      adicionarUsuario,
      atualizarUsuario,
      resetarDados,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
