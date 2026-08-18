import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { FiGitBranch, FiClock, FiCode, FiCheckCircle } from 'react-icons/fi';
import styled from 'styled-components';

// Componentes estilizados
const Container = styled.div`
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1rem;
`;

const VersionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #3498db;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const VersionTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChangeList = styled.ul`
  padding-left: 1rem;
  list-style-type: none;
`;

const ChangeItem = styled.li`
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
  color: #34495e;
  line-height: 1.5;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.5rem;
    width: 8px;
    height: 8px;
    background-color: #3498db;
    border-radius: 50%;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  font-size: 1.2rem;
  background: #fde8e8;
  border-radius: 8px;
`;

const LOCAL_VERSION_LOGS = [
  {
    version: "20:42 - v7.0.25 - Desvinculação Automática ao Excluir Integrações de Filas",
    changes: [
      "🗑️ <strong>Exclusão Direta de Integrações</strong>: `DeleteQueueIntegrationService.ts` desvincula automaticamente Filas e Tickets antes de deletar, eliminando travamentos de Foreign Key Constraint.",
      "⚡ <strong>Remoção Instantânea</strong>: O botão 'Excluir' na lista de Integrações agora remove a integração de primeira sem erro."
    ]
  },
  {
    version: "20:13 - v7.0.24 - Tratamento de Iterabilidade em Respostas do Typebot em Filas",
    changes: [
      "🛡️ <strong>Prevenção de Exceção em `typebotListener.ts`</strong>: Verificação `!Array.isArray(messages)` na linha 147 impedindo a exceção `TypeError: messages is not iterable`.",
      "⚡ <strong>Estabilidade de Fila</strong>: Garantia de que respostas nulas ou malformadas do Typebot na Fila 2 não interrompam a entrega das mensagens do WhatsApp."
    ]
  },
  {
    version: "20:04 - v7.0.23 - Diagnóstico Detalhado de Opções de Menu & Normalização por Dígitos",
    changes: [
      "🔍 <strong>Logs de Rastreamento de Opções</strong>: Inseridos logs de diagnóstico `[FlowBuilder Debug]` para rastrear em tempo real a correspondência da opção digitada e o nó de destino resolvido.",
      "🔢 <strong>Flexibilização da Opção Digitada</strong>: Suporte a correspondência por dígitos extraídos (`digitsOnly === num`) garantindo que entradas com pontuação ou espaço sejam capturadas."
    ]
  },
  {
    version: "19:25 - v7.0.22 - Atendimento Automático do Bot Desbloqueado com Atendente Humano",
    changes: [
      "🤖 <strong>Automação Total Desbloqueada</strong>: Removida a trava de `ticket.userId` em `ExecuteFlowService.ts`, permitindo que o robô responda automaticamente mesmo que a conversa esteja atribuída ao Admin na aba 'Atendendo'.",
      "⚡ <strong>Resposta Instantânea</strong>: Garantia de resposta imediata no WhatsApp independentemente de atribuição manual."
    ]
  },
  {
    version: "19:18 - v7.0.21 - Logs de Diagnóstico em Tempo Real & Liberação de Gatilhos",
    changes: [
      "🔍 <strong>Logs de Diagnóstico do FlowBuilder</strong>: Logs detalhados `[FlowBuilder Debug]` inseridos em `ExecuteFlowService.ts` mostrando a busca e execução de nós em tempo real.",
      "🔓 <strong>Execução Desbloqueada sem Atendente</strong>: Atendimento automatizado do bot liberado para rodar mesmo quando a conversa estiver com status aberto sem usuário humano atribuído."
    ]
  },
  {
    version: "18:50 - v7.0.20 - Blindagem Contra Crashes de Integração Typebot na Fila",
    changes: [
      "🛡️ <strong>Prevenção de Crash em `typebotListener.ts`</strong>: Adicionado Optional Chaining em `dataStart?.messages?.length` prevenindo exceções do tipo `TypeError: Cannot read properties of undefined (reading 'length')`.",
      "⚡ <strong>Estabilidade de Fila</strong>: Correção da interrupção do loop do WhatsApp ao transferir tickets para filas com integrações ativas."
    ]
  },
  {
    version: "18:08 - v7.0.19 - Prioridade de Gatilhos Explícitos em 2 Passadas & Purga Global de Cache ao Publicar",
    changes: [
      "⚡ <strong>Prioridade Absoluta para Gatilhos Explícitos</strong>: Seleção em 2 passadas no `ExecuteFlowService.ts` garante que gatilhos como 'suporte' tenham prioridade total sobre qualquer gatilho curinga `*`.",
      "🧹 <strong>Invalidação de Cache ao Publicar</strong>: `UpdateFlowService.ts` purga o cache do Redis automaticamente ao salvar qualquer fluxo, forçando o servidor a rodar imediatamente o novo fluxo publicado."
    ]
  },
  {
    version: "18:03 - v7.0.18 - Unificação Universal de Busca de Conectores em Todos os Nós",
    changes: [
      "🔗 <strong>Resolução Universal de Bordas</strong>: Todos os tipos de nós (Mensagem, Kanban, Delay, Webhook, Pix, Condição) agora utilizam `findTargetFromConnections` universal.",
      "🛡️ <strong>Fim das Interrupções Prematuras</strong>: Transições de nós mantêm a sessão do Redis intacta até a entrega da mensagem sequencial."
    ]
  },
  {
    version: "17:36 - v7.0.17 - Bloqueio de Loop Infinito do Gatilho Curinga (*) & Mapeamento por Número de Opção",
    changes: [
      "🛡️ <strong>Bloqueio de Reinício Indevido</strong>: O gatilho curinga `*` foi blindado para NUNCA reiniciar o fluxo do zero quando o usuário digita uma opção no menu.",
      "🔢 <strong>Mapeamento por Número da Opção</strong>: `findTargetFromConnections` agora busca tanto pelo ID do conector quanto pelo número da opção (`optionNumber`), permitindo avançar perfeitamente para 'Lista 2'."
    ]
  },
  {
    version: "17:17 - v7.0.16 - Suporte a LONGTEXT no Banco & Autolimpeza de Cache Desatualizado",
    changes: [
      "🛢️ <strong>Capacidade de Fluxos Complexos (LONGTEXT)</strong>: Colunas `nodes` e `connections` atualizadas para `LONGTEXT` evitando truncamento de JSON no MySQL.",
      "🧹 <strong>Autolimpeza de Cache Redis Stale</strong>: Exclusão automática de referências de nós antigos no Redis ao reutilizar ou editar um fluxo."
    ]
  },
  {
    version: "17:04 - v7.0.15 - Correção no Listener do WhatsApp & Simulação Multinó de 3 Turnos",
    changes: [
      "⚡ <strong>Garantia de Execução no WhatsApp</strong>: Ajustada trava em `wbotMessageListener.ts` para que respostas de menus em fluxos ativos no Redis sejam sempre processadas pelo FlowBuilder.",
      "🤖 <strong>Simulação Multinó Validade</strong>: Execução autônoma testada e aprovada em 3 turnos (Gatilho -> Mensagem -> Kanban -> Mensagem -> Menu -> Lista Interativa -> Fila)."
    ]
  },
  {
    version: "16:46 - v7.0.14 - Otimização Arquitetural de Salvamento e Resolução do FlowBuilder",
    changes: [
      "🤖 <strong>Sincronização Dupla de Opções e Conexões</strong>: Salvamento automático de `targetNodeId`, `targetNodeIdOption` e `targetNodeIdTag` diretamente no array de opções e botões dos nós no `builder.js`.",
      "🔗 <strong>Preservação de Handles do ReactFlow</strong>: Conexões gravadas e recarregadas sem perda de `sourceHandle` ou `targetHandle`."
    ]
  },
  {
    version: "10:50 - v7.0.13 - Solução Definitiva para Opções do Menu Numérico no FlowBuilder",
    changes: [
      "🤖 <strong>Navegação de Nós Resiliente</strong>: Suporte completo para transição do Nó #5 (Menu Numérico) para os nós #6 (Lista Interativa), #7 (Botões), #8 e #10.",
      "🔗 <strong>Ajuste de Handles de Conexão ReactFlow</strong>: Resolução de conexões pelos handles `sourceHandle`, `option-1`, `opt-0` e `handle-0`."
    ]
  },
  {
    version: "21:04 - v7.0.12 - Desregistro de ServiceWorker PWA & Purga de CacheStorage",
    changes: [
      "⚡ <strong>Visualização Obrigatória de Horário</strong>: Exibição da versão com horário no menu lateral junto ao selo `latest`.",
      "🧹 <strong>Limpeza Automática de Cache PWA</strong>: Desativação do Service Worker para forçar o navegador a carregar o novo build.",
      "🛠️ <strong>Arquitetura VPS Blindada</strong>: Invalidação de cache no Nginx e Express."
    ]
  },
  {
    version: "20:57 - v7.0.11 - Sincronização Geral de Versão & Horário em Tempo Real",
    changes: [
      "⚡ <strong>Visualização de Versão e Horário em Tempo Real</strong>: Exibição no menu lateral abaixo de Atualizações e na Central de Ajuda.",
      "🤖 <strong>Execução Resiliente do FlowBuilder</strong>: Resolução unificada de nós por Tag visual (#1, #2, VENDAS).",
      "🛠️ <strong>Configuração Completa VPS Ubuntu</strong>: Permissões de arquivos, invalidação de cache e gerenciamento de processos PM2."
    ]
  },
  {
    version: "20:49 - v7.0.10 - Roteamento de Nós & Invalidação de Cache VPS",
    changes: [
      "⚡ <strong>Visualização de Versão e Horário em Tempo Real</strong>: Exibição abaixo do menu Atualizações e no menu Ajuda.",
      "🤖 <strong>Execução do FlowBuilder Resiliente</strong>: Resolução de nós por Tag visual (#1, #2, VENDAS) e prevenção de reset para o início.",
      "🛠️ <strong>Deploy Seguro VPS Ubuntu</strong>: Invalidação de cache no Express (`no-cache`) e suporte a `max-old-space-size=4096` no build."
    ]
  },
  {
    version: "Versão 7.0.0 - Lançamento Especial PJZap PRO",
    changes: [
      "🤖 <strong>FlowBuilder Avançado</strong>: Adicionados nós de Webhook (HTTP POST), Atraso (Delay), Sorteio (Randomizador A/B), Cobrança Pix e Transição Automática de Kanban.",
      "🚀 <strong>Motor de Automação Visual</strong>: Execução autônoma integrada aos listeners do WhatsApp e Instagram Direct.",
      "⚡ <strong>Layout Responsivo FlowBuilder</strong>: Interface compactada com botão de enquadramento automático (fitView) e fontes otimizadas.",
      "✂️ <strong>Remoção Simplificada de Ligações</strong>: Exclusão de fios com clique direto sobre a linha ou usando as teclas Delete / Backspace.",
      "📊 <strong>Kanban CRM Automático</strong>: Disparo autônomo de mensagens de saudação ou acionamento de fluxos ao mover cards entre colunas.",
      "💰 <strong>Dashboard Financeiro no Kanban</strong>: Exibição de faturamento total e ticket médio acumulado por coluna do funil.",
      "🔗 <strong>Rastreamento de Tráfego (UTMs)</strong>: Captura e exibição de utm_source, utm_medium, utm_campaign, utm_content e utm_term nos cards de leads.",
      "📱 <strong>Visualização Multicanal</strong>: Ícone do canal (WhatsApp / Instagram) + Nome da Conexão visíveis nos cards dos tickets.",
      "🔄 <strong>Transferência de Tickets Aprimorada</strong>: Mudança imediata de aba para 'Pendente', desvinculação instantânea do atendente anterior e notificações via WebSockets (react-toastify).",
      "💳 <strong>Campanhas de Disparo em Massa</strong>: Suporte a envio por Tags do Kanban ou Listas de Contatos com validação estrita de conexão.",
      "🎨 <strong>Branding & Customização White-Label</strong>: Gerenciamento dinâmico de logotipos, temas claro/escuro, cores primárias/secundárias e tamanho de fonte global."
    ]
  },
  {
    version: "Versão 6.3.0 - Estabilidade e Performance",
    changes: [
      "🔧 Correção e sanitização do gerenciamento de conexões WhatsApp/Baileys.",
      "⚡ Atualizações em tempo real das mensagens e trocas de abas via WebSockets.",
      "📁 Suporte estendido para upload e envio de mídias de até 50MB."
    ]
  }
];

const VersionLog = () => {
  const [versionLog, setVersionLog] = useState(LOCAL_VERSION_LOGS);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user.super) {
      toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
      setTimeout(() => {
        history.push(`/`)
      }, 1000);
    }
  }, [user, history]);

  const decodeBase64 = (str) => {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
  };

  const parseVersionLog = (content) => {
    const versions = content.split('## ').slice(1);
    return versions.map(versionText => {
      const [title, ...changes] = versionText.split('\n').filter(line => line.trim() !== '');
      return {
        version: title.trim(),
        changes: changes.map(change => change.trim().replace(/^[-•]\s*/, '').trim())
      };
    }).map(log => ({
      ...log,
      changes: log.changes.map(change => formatMarkdown(change))
    }));
  };

  const formatMarkdown = (text) => {
    // Processa links [texto](url)
    let formatted = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3498db; text-decoration: none;">$1</a>');
    
    // Processa negrito **texto** ou __texto__
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                         .replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Processa itálico *texto* ou _texto_
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')
                         .replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Processa código `texto`
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace;">$1</code>');
    
    return formatted;
  };

  if (loading) return (
    <Loading>
      <FiClock size={24} style={{ marginBottom: '1rem' }} />
      <p>Carregando histórico de versões...</p>
    </Loading>
  );
  
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <Header>
        <FiGitBranch size={48} color="#3498db" style={{ marginBottom: '1rem' }} />
        <Title>Histórico de Atualizações</Title>
        <Subtitle>Confira as melhorias e novidades implementadas em cada versão</Subtitle>
      </Header>
      
      {versionLog.map(({ version, changes }) => (
        <VersionCard key={version}>
          <VersionTitle>
            <FiCode color="#3498db" />
            {version}
          </VersionTitle>
          <ChangeList>
            {changes.map((change, index) => (
              <ChangeItem 
                key={index} 
                dangerouslySetInnerHTML={{ __html: change }} 
              />
            ))}
          </ChangeList>
        </VersionCard>
      ))}
    </Container>
  );
};

export default VersionLog;