export type PerfilUsuario = 
  | 'ADMINISTRADOR'
  | 'PCP'
  | 'PRODUCAO'
  | 'ESTOQUE'
  | 'GESTOR'
  | 'VISUALIZACAO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  departamento: string;
  ativo: boolean;
}

export type StatusProduto = 'ATIVO' | 'INATIVO' | 'HOMOLOGACAO';
export type UnidadeMedida = 'UN' | 'KG' | 'M' | 'CX' | 'L' | 'PC';

export interface BOMItem {
  materialId: string;
  codigoMaterial: string;
  nomeMaterial: string;
  quantidadePorUnidade: number;
  unidadeMedida: UnidadeMedida;
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  unidadeMedida: UnidadeMedida;
  tempoPadraoMinutos: number; // Takt time / tempo padrão de fabricação em minutos
  estoqueMinimo: number;
  estoqueAtual: number;
  localArmazenamento: string;
  status: StatusProduto;
  estruturaMateriais: BOMItem[]; // BOM
}

export type StatusOP = 
  | 'PLANEJADA'
  | 'LIBERADA'
  | 'EM_PRODUCAO'
  | 'PAUSADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface OrdemProducao {
  id: string;
  numeroOP: string;
  produtoId: string;
  produtoCodigo: string;
  produtoNome: string;
  quantidadePlanejada: number;
  quantidadeProduzida: number;
  quantidadeRejeitada: number;
  dataInicio: string; // ISO string ou YYYY-MM-DD
  dataPrevisaoTermino: string; // YYYY-MM-DD
  dataConclusao?: string;
  setorResponsavel: string;
  maquina: string;
  prioridade: Prioridade;
  status: StatusOP;
  abastecido: boolean;
  observacoes?: string;
}

export type StatusAbastecimento = 
  | 'PENDENTE'
  | 'PARCIAL'
  | 'ABASTECIDO'
  | 'ESTOQUE_INSUFICIENTE';

export interface NecessidadeAbastecimento {
  id: string;
  opId: string;
  numeroOP: string;
  produtoCodigo: string;
  produtoNome: string;
  materialId: string;
  materialCodigo: string;
  materialNome: string;
  quantidadeNecessaria: number;
  quantidadeAbastecida: number;
  quantidadeDisponivelEstoque: number;
  quantidadeAAbastecer: number; // max(0, quantidadeNecessaria - quantidadeAbastecida)
  unidadeMedida: UnidadeMedida;
  localEstoque: string;
  setorDestino: string;
  maquinaDestino: string;
  prioridadeOP: Prioridade;
  dataInicioOP: string;
  status: StatusAbastecimento;
}

export type TipoMovimentacaoEstoque = 
  | 'ENTRADA'
  | 'SAIDA_PRODUCAO'
  | 'AJUSTE'
  | 'TRANSFERENCIA_LINHA';

export interface MovimentacaoEstoque {
  id: string;
  dataHora: string;
  materialId: string;
  materialCodigo: string;
  materialNome: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  origem: string;
  destino: string;
  responsavel: string;
  motivo?: string;
  opRelacionada?: string;
}

export interface ItemEstoque {
  id: string;
  codigo: string;
  nome: string;
  categoria: 'MATERIA_PRIMA' | 'COMPONENTE' | 'EMBALAGEM' | 'PRODUTO_ACABADO';
  unidadeMedida: UnidadeMedida;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localArmazenamento: string;
  custoUnitario: number;
}

export interface ApontamentoProducao {
  id: string;
  opId: string;
  numeroOP: string;
  produtoCodigo: string;
  produtoNome: string;
  operador: string;
  maquina: string;
  setor: string;
  data: string;
  horarioInicio: string; // HH:mm
  horarioTermino: string; // HH:mm
  duracaoMinutos: number;
  quantidadeProduzida: number;
  quantidadeAprovada: number;
  quantidadeRejeitada: number;
  motivoRejeicao?: string;
  paradasMinutos: number;
  // Campos calculados
  eficienciaPercentual: number;
  produtividadePecasHora: number;
  cumprimentoMetaPercentual: number;
  refugoPercentual: number;
}

export type CategoriaParada = 
  | 'FALTA_MATERIAL'
  | 'MANUTENCAO'
  | 'SETUP'
  | 'FALTA_OPERADOR'
  | 'QUALIDADE'
  | 'PROBLEMA_MAQUINA'
  | 'OUTROS';

export interface ParadaMaquina {
  id: string;
  maquina: string;
  setor: string;
  data: string;
  horarioInicio: string; // HH:mm
  horarioTermino?: string; // HH:mm (opcional se ainda estiver em andamento)
  duracaoMinutos: number;
  motivo: CategoriaParada;
  descricaoMotivo: string;
  responsavel: string;
  observacao?: string;
  opRelacionada?: string;
  emAndamento: boolean;
}

export type TipoAlerta = 
  | 'MATERIAL_INSUFICIENTE'
  | 'ESTOQUE_CRITICO'
  | 'OP_ATRASADA'
  | 'OP_PROXIMA_PRAZO'
  | 'ABASTECIMENTO_PENDENTE'
  | 'PRODUCAO_ABAIXO_META'
  | 'MAQUINA_PARADA';

export type SeveridadeAlerta = 'CRITICO' | 'ATENCAO' | 'INFO';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  mensagem: string;
  dataHora: string;
  lido: boolean;
  linkAcao?: string; // Aba para navegar
  metaRefId?: string; // ID da OP ou do material
}

export type TipoRelatorio = 
  | 'PRODUCAO_DIARIA'
  | 'PRODUCAO_SEMANAL'
  | 'PRODUCAO_MENSAL'
  | 'OPS_CONCLUIDAS'
  | 'OPS_ATRASADAS'
  | 'CONSUMO_MATERIAIS'
  | 'NECESSIDADES_ABASTECIMENTO'
  | 'ESTOQUE_CRITICO'
  | 'PARADAS_PRODUCAO'
  | 'PRODUTIVIDADE_OPERADOR'
  | 'PRODUTIVIDADE_MAQUINA';
