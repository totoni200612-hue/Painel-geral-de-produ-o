import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerfilUsuario, Usuario } from '../../types';
import { Modal } from '../common/Modal';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Check, 
  X, 
  Lock, 
  KeyRound, 
  Edit2, 
  ShieldAlert 
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { usuarios, usuarioAtivo, setUsuarioAtivo, adicionarUsuario, atualizarUsuario, temPermissao } = useApp();

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('PRODUCAO');
  const [departamento, setDepartamento] = useState('Chão de Fábrica');

  const abrirNovo = () => {
    setUsuarioEditando(null);
    setNome('');
    setEmail('');
    setPerfil('PRODUCAO');
    setDepartamento('Chão de Fábrica');
    setModalAberto(true);
  };

  const abrirEditar = (u: Usuario) => {
    setUsuarioEditando(u);
    setNome(u.nome);
    setEmail(u.email);
    setPerfil(u.perfil);
    setDepartamento(u.departamento);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    if (usuarioEditando) {
      atualizarUsuario(usuarioEditando.id, {
        nome,
        email,
        perfil,
        departamento,
      });
    } else {
      adicionarUsuario({
        nome,
        email,
        perfil,
        departamento,
        ativo: true,
      });
    }

    setModalAberto(false);
  };

  // Matriz de Permissões
  const matrizPermissoes = [
    { funcionalidade: 'Criar / Editar Produtos & BOM', admin: true, pcp: true, prod: false, est: false, gestor: false, vis: false },
    { funcionalidade: 'Criar / Programar OPs', admin: true, pcp: true, prod: false, est: false, gestor: false, vis: false },
    { funcionalidade: 'Iniciar / Pausar / Concluir OPs', admin: true, pcp: true, prod: true, est: false, gestor: false, vis: false },
    { funcionalidade: 'Atender Abastecimento de Linha', admin: true, pcp: false, prod: false, est: true, gestor: false, vis: false },
    { funcionalidade: 'Movimentações de Estoque (Entradas/Saídas)', admin: true, pcp: false, prod: false, est: true, gestor: false, vis: false },
    { funcionalidade: 'Registrar Apontamentos de Produção', admin: true, pcp: true, prod: true, est: false, gestor: false, vis: false },
    { funcionalidade: 'Registrar / Finalizar Paradas de Máquina', admin: true, pcp: true, prod: true, est: false, gestor: false, vis: false },
    { funcionalidade: 'Visualizar Dashboard e Indicadores (OEE)', admin: true, pcp: true, prod: true, est: true, gestor: true, vis: true },
    { funcionalidade: 'Exportar Relatórios PDF e Excel', admin: true, pcp: true, prod: false, est: true, gestor: true, vis: false },
    { funcionalidade: 'Gerenciar Usuários e Permissões', admin: true, pcp: false, prod: false, est: false, gestor: false, vis: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Controle de Usuários & Matriz de Permissões
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de operadores, analistas de PCP, equipe de almoxarifado e perfis de segurança.
          </p>
        </div>

        {temPermissao('GERENCIAR_USUARIOS') && (
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Usuário
          </button>
        )}
      </div>

      {/* Banner de Simulação Rápida */}
      <div className="p-4 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Simulador de Sessão Operacional
          </span>
          <h3 className="text-sm font-bold text-white">
            Usuário Ativo: {usuarioAtivo.nome} ({usuarioAtivo.perfil})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique em qualquer usuário da tabela abaixo para assumir seu perfil e testar restrições.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-slate-800 rounded border border-slate-700 text-xs font-mono text-slate-300">
          Perfil: <span className="text-emerald-400 font-bold">{usuarioAtivo.perfil}</span>
        </div>
      </div>

      {/* Tabela de Usuários Cadastrados */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Usuários do Sistema</h2>
          <span className="text-xs text-slate-500 font-mono">{usuarios.length} cadastrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail Corporativo</th>
                <th className="px-4 py-3 font-medium">Departamento</th>
                <th className="px-4 py-3 font-medium text-center">Nível / Perfil</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map(u => {
                const isCurrent = u.id === usuarioAtivo.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50/80 ${isCurrent ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {u.nome}
                        {isCurrent && (
                          <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-bold">
                            Sessão Atual
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.departamento}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {u.perfil}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <Check className="w-3 h-3" /> Ativo
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => setUsuarioAtivo(u)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Assumir Perfil
                          </button>
                        )}
                        {temPermissao('GERENCIAR_USUARIOS') && (
                          <button
                            onClick={() => abrirEditar(u)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Editar usuário"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

      {/* Matriz de Permissões por Nível */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">
            Matriz de Permissões por Perfil de Acesso
          </h2>
          <p className="text-xs text-slate-500">
            Regras de controle de acesso aos recursos fabris e módulos operacionais.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Funcionalidade / Módulo</th>
                <th className="px-3 py-2.5 font-semibold text-center">Administrador</th>
                <th className="px-3 py-2.5 font-semibold text-center">PCP</th>
                <th className="px-3 py-2.5 font-semibold text-center">Produção</th>
                <th className="px-3 py-2.5 font-semibold text-center">Estoque</th>
                <th className="px-3 py-2.5 font-semibold text-center">Gestor</th>
                <th className="px-3 py-2.5 font-semibold text-center">Visualização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrizPermissoes.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{p.funcionalidade}</td>
                  
                  <td className="px-3 py-2.5 text-center">
                    {p.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.pcp ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.prod ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.est ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.gestor ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {p.vis ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Usuário */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title={usuarioEditando ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
        subtitle="Defina o perfil de acesso e departamento fabril."
        maxWidth="md"
      >
        <form onSubmit={handleSalvar} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Carlos Alberto"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">E-mail Corporativo *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Ex: carlos.alberto@industria.com.br"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Perfil de Acesso *</label>
            <select
              value={perfil}
              onChange={e => setPerfil(e.target.value as PerfilUsuario)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-semibold"
            >
              <option value="ADMINISTRADOR">Administrador (Controle Total)</option>
              <option value="PCP">PCP (Planejamento, OPs e Engenharia)</option>
              <option value="PRODUCAO">Produção (Chão de Fábrica, Apontamentos e Paradas)</option>
              <option value="ESTOQUE">Estoque / Almoxarifado (Movimentações e Abastecimento)</option>
              <option value="GESTOR">Gestor (Indicadores, Dashboards e Relatórios)</option>
              <option value="VISUALIZACAO">Visualização (Somente Leitura)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Departamento</label>
            <input
              type="text"
              value={departamento}
              onChange={e => setDepartamento(e.target.value)}
              placeholder="Ex: Linhas de Montagem"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
            />
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
              Salvar Usuário
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
