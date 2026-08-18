import React, { useState, useEffect, useCallback } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  Chip,
  Tabs,
  Tab,
  Button
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PaletteIcon from "@material-ui/icons/Palette";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import PeopleIcon from "@material-ui/icons/People";
import PhonelinkSetupIcon from "@material-ui/icons/PhonelinkSetup";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import SendIcon from "@material-ui/icons/Send";
import HeadsetMicIcon from "@material-ui/icons/HeadsetMic";
import CodeIcon from "@material-ui/icons/Code";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import CloudDoneIcon from "@material-ui/icons/CloudDone";
import QrCodeIcon from "@material-ui/icons/CropFree";
import CameraAltIcon from "@material-ui/icons/CameraAlt";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import useHelps from "../../hooks/useHelps";
import useVersion from "../../hooks/useVersion";

const useStyles = makeStyles(theme => ({
  mainPaperContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 160px)',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.type === 'dark' ? '#151521' : '#f8f9fa',
  },
  headerBox: {
    marginBottom: theme.spacing(3),
    textAlign: "center",
    padding: theme.spacing(3),
    background: "linear-gradient(135deg, #128C7E 0%, #075E54 100%)",
    borderRadius: 12,
    color: "#ffffff",
    boxShadow: "0 4px 20px rgba(18,140,126,0.3)"
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  tabButton: {
    fontWeight: 700,
    fontSize: "0.9rem",
    textTransform: "none",
  },
  accordion: {
    marginBottom: theme.spacing(2),
    borderRadius: "10px !important",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.08)",
    "&:before": {
      display: "none",
    },
  },
  accordionSummary: {
    backgroundColor: theme.palette.type === 'dark' ? '#1e1e2d' : '#ffffff',
    padding: "12px 20px",
  },
  accordionTitle: {
    fontWeight: 700,
    fontSize: "1.05rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  sectionBadge: {
    backgroundColor: "#128C7E",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.75rem",
  },
  contentBox: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    width: "100%",
    padding: theme.spacing(1),
  },
  stepBlock: {
    backgroundColor: theme.palette.type === 'dark' ? '#27273a' : '#f0f4f8',
    borderRadius: 8,
    padding: theme.spacing(2),
    borderLeft: "4px solid #128C7E"
  },
  stepTitle: {
    fontWeight: 700,
    color: "#128C7E",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  channelCard: {
    padding: theme.spacing(3),
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.type === 'dark' ? '#1e1e2d' : '#ffffff',
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  channelTitle: {
    fontWeight: 800,
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  helpPaper: {
    position: 'relative',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[2],
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: theme.shadows[6],
    },
  },
  videoThumbnail: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1024,
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
}));

const SETUP_FLUXO_STEPS = [
  {
    id: "step1",
    title: "1. Personalização da Marca & Aparência (White-Label)",
    icon: <PaletteIcon style={{ color: "#e91e63" }} />,
    summary: "Branding & Cores da Empresa",
    description: "Deixe a plataforma com a identidade visual da sua marca desde a tela de login até o painel interno.",
    steps: [
      "Acesse no menu lateral esquerdo: Configurações > Aparência.",
      "Faça upload da imagem do Logo da Tela de Login e do Logo Interno (exibido no topo do sistema).",
      "Defina a Cor Primária (ex: tom verde/azul da sua marca) e a Cor Secundária para botões e destaques.",
      "Ajuste o Tamanho da Fonte Global para garantir legibilidade ideal para a sua equipe.",
      "Alterne entre Tema Claro (Light) e Tema Escuro (Dark Mode) conforme a preferência da empresa.",
      "Clique no botão Salvar."
    ]
  },
  {
    id: "step2",
    title: "2. Setores & Filas de Atendimento (Queues)",
    icon: <DeviceHubIcon style={{ color: "#ff9800" }} />,
    summary: "Departamentos & Horários",
    description: "Segregue os atendimentos por setor (Vendas, Suporte, Financeiro) com regras e horários de funcionamento.",
    steps: [
      "Acesse no menu lateral: Filas > Adicionar Fila.",
      "Digite o Nome da Fila (ex: 'Vendas') e selecione uma Cor de identificação.",
      "Digite a Mensagem de Saudação automática enviada assim que o cliente é direcionado para esta fila.",
      "Configure o Horário de Atendimento (dias da semana e turnos de expediente).",
      "Escreva a Mensagem Fora de Expediente enviada se o cliente chamar à noite ou nos finais de semana.",
      "Clique no botão Salvar."
    ]
  },
  {
    id: "step3",
    title: "3. Cadastro de Usuários & Permissões da Equipe",
    icon: <PeopleIcon style={{ color: "#2196f3" }} />,
    summary: "Atendentes & Administradores",
    description: "Cadastre sua equipe dando acessos restritos a setores e funções específicas do sistema.",
    steps: [
      "Acesse no menu lateral: Usuários > Adicionar Usuário.",
      "Preencha o Nome completo, E-mail de login e Senha inicial do atendente.",
      "Defina o Perfil: escolha 'User' para atendente comum ou 'Admin' para gerentes com acesso total.",
      "Em Filas, marque quais setores este atendente terá permissão para visualizar e responder.",
      "Clique no botão Salvar."
    ]
  },
  {
    id: "step4",
    title: "4. Conexões de WhatsApp & Instagram Direct",
    icon: <PhonelinkSetupIcon style={{ color: "#4caf50" }} />,
    summary: "Vinculação de Canais de Mensagem",
    description: "Conecte seus números de WhatsApp (QR Code ou API Cloud Oficial) e contas de Instagram Direct.",
    steps: [
      "Acesse no menu lateral: Conexões > Adicionar Conexão.",
      "Selecione o Canal: 'WhatsApp (QR Code)', 'WhatsApp Cloud API Oficial (Meta WABA)' ou 'Instagram Direct (API Meta)'.",
      "Digite o Nome da Conexão e selecione as Filas que responderão a este número/conta.",
      "Digite um Token da sua escolha para autorizar integrações externas de Webhook.",
      "Clique em Salvar. Se escolheu QR Code, clique no botão azul QR CODE e escaneie no aplicativo do WhatsApp no celular."
    ]
  },
  {
    id: "step5",
    title: "5. Funil Kanban CRM, Tags & Automação de Colunas",
    icon: <ViewColumnIcon style={{ color: "#9c27b0" }} />,
    summary: "CRM Visual & Métricas Financeiras",
    description: "Organize seus leads em etapas visuais, acompanhe faturamento acumulado, UTMs e dispare automações ao mover cards.",
    steps: [
      "Acesse no menu lateral: Tags > Adicionar Tag.",
      "Digite o Nome da etapa (ex: '1. Novo Lead', '2. Proposta Enviada', '3. Venda Fechada').",
      "Escolha a Cor e marque o checkbox 'Exibir no Painel Kanban = Sim'.",
      "Em Mensagem de Automação, digite o texto enviado automaticamente ao cliente assim que o card for movido para esta coluna.",
      "Em Disparar Fluxo, selecione um robô do FlowBuilder para ser executado ao mover o card.",
      "No menu Kanban, acompanhe o quadro de colunas, faturamento total por etapa e os rastreadores de tráfego (UTMs)."
    ]
  },
  {
    id: "step6",
    title: "6. Construtor Visual de Chatbots (FlowBuilder)",
    icon: <AccountTreeIcon style={{ color: "#00bcd4" }} />,
    summary: "Robôs de Triagem & Vendas",
    description: "Crie automações visuais inteligentes com mensagens, botões clicáveis, menus, condicionais, webhooks e cobrança Pix.",
    steps: [
      "Acesse no menu lateral: FlowBuilder > Criar Novo Fluxo.",
      "Gatilho Inicial: No nó inicial, defina a palavra-chave que aciona o robô (use '*' para responder a qualquer mensagem inicial).",
      "Adicionar Componentes: Clique nos itens da barra lateral COMPONENTES (Texto, Botões Interativos, Lista, Condição, Delay, Pix, Webhook).",
      "Conectar Nós: Clique na bolinha inferior de um nó e arraste até o nó de destino para criar a linha de conexão.",
      "Editar/Excluir: Clique no nó para abrir a gaveta de edição à direita. Para excluir, selecione e pressione Delete no teclado.",
      "Testar Fluxo: Clique no botão 'Testar Fluxo' no topo, digite seu WhatsApp e valide a execução direta no celular antes de ativar!"
    ]
  },
  {
    id: "step7",
    title: "7. Respostas Rápidas (Quick Answers)",
    icon: <FlashOnIcon style={{ color: "#ffc107" }} />,
    summary: "Atalhos por Barra '/' no Chat",
    description: "Cadastre respostas padrão para que sua equipe envie informações completas com apenas dois cliques.",
    steps: [
      "Acesse no menu lateral: Respostas Rápidas > Adicionar.",
      "No campo Atalho, digite a palavra sem espaços (ex: 'pix', 'endereco', 'horario').",
      "Digite o texto completo da resposta e anexe arquivos ou mídias se necessário.",
      "Durante a conversa na Central de Atendimento, o atendente digita '/' para abrir a lista de atalhos e clica na opção desejada."
    ]
  },
  {
    id: "step8",
    title: "8. Disparos em Massa & Campanhas",
    icon: <SendIcon style={{ color: "#3f51b5" }} />,
    summary: "Envios em Lote Ativos",
    description: "Realize transmissões em massa para uma Lista de Contatos ou para leads de uma Tag específica do Kanban.",
    steps: [
      "Para enviar via planilha: Acesse Listas de Contatos e importe seu arquivo CSV/Excel de telefones.",
      "Para enviar via segmento do Kanban: Certifique-se de que os contatos estão marcados com a Tag desejada.",
      "Acesse no menu lateral: Campanhas > Nova Campanha.",
      "Selecione a Conexão emissora do WhatsApp e escolha a Lista de Contatos ou Tag de destino.",
      "Escreva as mensagens com suporte a variações (spintax ex: '{Olá|Oi|Tudo bem}') e agende a data/hora do disparo."
    ]
  },
  {
    id: "step9",
    title: "9. Central de Atendimento ao Vivo & Mídias",
    icon: <HeadsetMicIcon style={{ color: "#4caf50" }} />,
    summary: "Operação Diária dos Atendentes",
    description: "Gerencie chamados de WhatsApp e Instagram em tempo real com recursos avançados de chat.",
    steps: [
      "Aba Aguardando: Onde entram novas conversas ou clientes triados pelo robô. Clique em 'Aceitar' para puxar o atendimento.",
      "Aba Atendendo: Onde ficam os chamados ativos sob a responsabilidade do seu usuário.",
      "Mídias & Áudios: Envie áudios simulando gravação em tempo real (Ptt), imagens, vídeos e arquivos PDF de até 50MB.",
      "Transferência: Clique no botão 'Transferir' para passar a conversa para outro atendente ou fila de destino.",
      "Encerrar: Clique no ícone de Check verde (✅) para resolver e arquivar o atendimento."
    ]
  },
  {
    id: "step10",
    title: "10. API Externa & Integradores (n8n, Make, Webhooks)",
    icon: <CodeIcon style={{ color: "#607d8b" }} />,
    summary: "Integração HTTP REST Exclusiva",
    description: "Dispare mensagens e consulte status via código ou ferramentas de automação externas.",
    steps: [
      "Acesse no menu lateral a aba API.",
      "Endpoint de Envio: Use a URL 'https://seu-dominio.com/api/messages/send' via método POST.",
      "Autenticação: Inclua o cabeçalho 'Authorization: Bearer SEU_TOKEN' (o token cadastrado na Conexão).",
      "Body JSON: Envie no formato { \"number\": \"5511999999999\", \"body\": \"Sua mensagem\" }.",
      "Teste Rápido: Utilize o painel de teste integrado na própria aba API para validar suas requisições."
    ]
  }
];

const FLOWBUILDER_MANUAL_STEPS = [
  {
    id: "fb_step1",
    title: "1. Nó Gatilho Inicial (Trigger / Palavra-Chave)",
    icon: <FlashOnIcon style={{ color: "#ff9800" }} />,
    summary: "Ativação do Robô",
    description: "Determina qual mensagem do cliente aciona a execução deste fluxo automatizado.",
    steps: [
      "No tela do FlowBuilder, o primeiro nó do canvas é o Nó Gatilho Inicial (Trigger).",
      "Clique no nó para abrir a gaveta de edição à direita.",
      "Palavra-chave específica: Digite o termo exato que aciona o robô (ex: 'vendas', 'suporte', 'orcamento', 'pix').",
      "Gatilho Coringa (*): Use '*' se quiser que o robô responda a QUALQUER primeira mensagem de um novo atendimento.",
      "Conecte a bolinha inferior do Nó Gatilho ao próximo nó que deseja executar (ex: Enviar Mensagem)."
    ]
  },
  {
    id: "fb_step2",
    title: "2. Nó Enviar Mensagem (Texto, Imagens, Áudios & Arquivos)",
    icon: <SendIcon style={{ color: "#4caf50" }} />,
    summary: "Mensagens & Anexos",
    description: "Envia mensagens de texto formatadas com variáveis personalizadas ou arquivos de mídia.",
    steps: [
      "Arraste ou clique no componente 'Conteúdo / Mensagem' no menu lateral de componentes.",
      "Variáveis dinâmicas: Insira tags como {{name}} (Nome do contato), {{protocol}} (Protocolo), {{date}} (Data atual) ou {{hour}} (Hora atual).",
      "Envio de Áudio PTT: Ao anexar áudio (.ogg / .mp3), marque a opção 'Enviar como Gravação' para que o WhatsApp exiba o áudio como se tivesse sido gravado na hora!",
      "Envio de Mídias: Você pode anexar imagens (JPG/PNG), vídeos (MP4) ou documentos PDF de até 50MB."
    ]
  },
  {
    id: "fb_step3",
    title: "3. Nó Menu Numerado (Opções de Texto 1, 2, 3)",
    icon: <DeviceHubIcon style={{ color: "#2196f3" }} />,
    summary: "Menu de Triagem",
    description: "Cria um menu de opções numéricas para o cliente escolher o assunto desejado.",
    steps: [
      "Adicione o nó 'Menu' ao canvas e abra o painel de edição.",
      "Escreva o Título da mensagem (ex: 'Olá! Como podemos te ajudar hoje?').",
      "Clique em 'Adicionar Opção': crie itens como '1 - Falar com Vendas', '2 - Suporte Técnico', '3 - Financeiro'.",
      "RAMIFICAÇÃO: O nó criará uma saída para cada opção numérica. Conecte cada número ao fluxo correspondente!"
    ]
  },
  {
    id: "fb_step4",
    title: "4. Nó Botões Interativos (Buttons)",
    icon: <AccountTreeIcon style={{ color: "#9c27b0" }} />,
    summary: "Botões Clicáveis",
    description: "Envia botões nativos clicáveis na tela do cliente sem necessidade de digitar texto.",
    steps: [
      "Adicione o nó 'Botões' no canvas.",
      "Defina a Mensagem Principal (ex: 'Deseja confirmar seu agendamento para amanhã?').",
      "Cadastre até 3 Botões clicáveis (ex: [Sim, Confirmar], [Remarcar], [Cancelar]).",
      "Conecte a saída de cada botão ao nó de destino correspondente à escolha do cliente."
    ]
  },
  {
    id: "fb_step5",
    title: "5. Nó Atraso / Delay Humanizado",
    icon: <PhonelinkSetupIcon style={{ color: "#ff5722" }} />,
    summary: "Simulação de Digitação",
    description: "Insere uma pausa calculada em segundos entre o envio de mensagens para simular comportamento humano.",
    steps: [
      "Adicione o nó 'Atraso / Delay' entre dois nós de mensagem.",
      "No painel de edição, informe o tempo em segundos (ex: 3 segundos).",
      "Durante o delay, o WhatsApp exibirá o status 'digitando...' para o cliente, tornando o robô extremamente humano e natural."
    ]
  },
  {
    id: "fb_step6",
    title: "6. Nó Condicional (Se / Senão)",
    icon: <CodeIcon style={{ color: "#e91e63" }} />,
    summary: "Tomada de Decisão",
    description: "Verifica se a resposta do cliente ou o valor de uma variável satisfaz uma condição.",
    steps: [
      "Adicione o nó 'Condição' ao fluxo.",
      "Defina a Palavra ou Padrão a verificar (ex: se o texto contém 'sim', 'comprar' ou se a variável 'estado' == 'SP').",
      "O nó possui DUAS saídas: 'Verdadeiro' (se atender à condição) e 'Falso' (se não atender).",
      "Conecte cada saída ao caminho apropriado."
    ]
  },
  {
    id: "fb_step7",
    title: "7. Nó Capturar Variável (Input do Usuário)",
    icon: <HelpOutlineIcon style={{ color: "#00bcd4" }} />,
    summary: "Coleta de Dados",
    description: "Faz uma pergunta ao cliente e armazena a resposta em uma variável para ser usada no restante do fluxo.",
    steps: [
      "Adicione o nó 'Capturar Variável' (ou Set Variable).",
      "Escolha ou digite o Nome da Variável (ex: 'cpf', 'email', 'cidade', 'tamanho_empresa').",
      "Digite a Pergunta feita ao cliente (ex: 'Por favor, digite seu E-mail para cadastro:').",
      "Nas mensagens seguintes, você pode exibir o dado capturado usando '{{email}}' ou enviar via Webhook!"
    ]
  },
  {
    id: "fb_step8",
    title: "8. Nó Cobrança Pix Automática",
    icon: <CheckCircleOutlineIcon style={{ color: "#4caf50" }} />,
    summary: "Vendas & Pagamentos",
    description: "Gera automaticamente o QR Code Pix e o código Copia e Cola no chat do cliente.",
    steps: [
      "Adicione o nó 'Cobrança Pix'.",
      "Defina o Valor da cobrança (ex: R$ 49,90) ou vincule a uma variável de valor.",
      "Insira a Chave Pix da empresa e o texto de instrução.",
      "Ao passar por este nó, o robô enviará a chave 'Copia e Cola' pronta para o cliente pagar no aplicativo do banco."
    ]
  },
  {
    id: "fb_step9",
    title: "9. Nó Webhook / Integração HTTP (n8n / Make / APIs)",
    icon: <CodeIcon style={{ color: "#3f51b5" }} />,
    summary: "Integração Externa",
    description: "Envia os dados do ticket/cliente para um sistema externo ou consulta informações em tempo real.",
    steps: [
      "Adicione o nó 'Webhook'.",
      "Cole a URL do seu Webhook (ex: n8n, Make, Typebot, CRM externo).",
      "Selecione o Método HTTP (POST ou GET).",
      "O robô enviará todos os dados do contato (nome, telefone, variáveis capturadas) no Body JSON da requisição!"
    ]
  },
  {
    id: "fb_step10",
    title: "10. Nó Transferir para Fila / Setor (Queue Transfer)",
    icon: <HeadsetMicIcon style={{ color: "#009688" }} />,
    summary: "Encaminhamento Humano",
    description: "Direciona a conversa para uma fila específica de atendentes da empresa.",
    steps: [
      "Adicione o nó 'Transferir Fila'.",
      "Selecione a Fila de destino no menu suspenso (ex: 'Vendas', 'Suporte Técnico', 'Financeiro').",
      "Assim que o robô executa este nó, o ticket é movido para a aba 'Aguardando' da fila correspondente."
    ]
  },
  {
    id: "fb_step11",
    title: "11. Nó Alterar Kanban / Estágio CRM",
    icon: <ViewColumnIcon style={{ color: "#673ab7" }} />,
    summary: "Automação do CRM Visual",
    description: "Move a conversa automaticamente para uma coluna do Quadro Kanban.",
    steps: [
      "Adicione o nó 'Definir Kanban / Tag'.",
      "Selecione a Tag/Coluna de destino (ex: '1. Lead Qualificado', '2. Proposta Enviada', '3. Cliente Fechado').",
      "O card do cliente no quadro Kanban será atualizado instantaneamente sem intervenção manual!"
    ]
  },
  {
    id: "fb_step12",
    title: "12. Nó Encerrar Atendimento (Close Ticket)",
    icon: <CheckCircleOutlineIcon style={{ color: "#f44336" }} />,
    summary: "Finalização Automática",
    description: "Resolve e encerra o ticket automaticamente ao concluir a jornada do robô.",
    steps: [
      "Adicione o nó 'Encerrar Ticket'.",
      "Digite uma mensagem final de despedida ou pesquisa de satisfação (opcional).",
      "O ticket será movido para o status 'Resolvido' liberando espaço na lista de atendimentos."
    ]
  },
  {
    id: "fb_step13",
    title: "13. Nó Randomizador (Teste A/B)",
    icon: <PaletteIcon style={{ color: "#ffc107" }} />,
    summary: "Distribuição Percentual",
    description: "Divide os clientes aleatoriamente entre 2 caminhos para testar abordagens de vendas.",
    steps: [
      "Adicione o nó 'Randomizador'.",
      "Defina a porcentagem de divisão (ex: 50% para Saída A, 50% para Saída B).",
      "Conecte a Saída A a uma mensagem de oferta 1 e a Saída B a uma mensagem de oferta 2 para medir qual converte mais!"
    ]
  },
  {
    id: "fb_step14",
    title: "14. Nó Anti-Ban & Intervalos de Segurança",
    icon: <PhonelinkSetupIcon style={{ color: "#795548" }} />,
    summary: "Proteção de Número",
    description: "Aplica intervalos dinâmicos de segurança para evitar bloqueios em fluxos de alto volume.",
    steps: [
      "Configure intervalos variados (ex: entre 3 e 8 segundos).",
      "Utilize variações de texto (Spintax ex: '{Olá|Oi|Tudo bem}') para que o WhatsApp não identifique padrão repetitivo."
    ]
  }
];

const CHANGELOG_ITEMS = [
  {
    version: "18:08 - v7.0.19",
    date: "18/08/2026",
    title: "Prioridade de Gatilhos Explícitos em 2 Passadas & Invalidação Global ao Salvar Fluxos",
    changes: [
      "Seleção em 2 passadas no `ExecuteFlowService.ts`: prioridade absoluta para gatilhos explícitos (ex: 'suporte') sobre gatilhos curingas (`*`).",
      "Purga automática de cache do Redis ao salvar ou atualizar qualquer fluxo via `UpdateFlowService.ts` garantindo que o novo fluxo seja publicado sem resíduos."
    ]
  },
  {
    version: "18:03 - v7.0.18",
    date: "18/08/2026",
    title: "Unificação Universal de Conexões em Todos os Nós do FlowBuilder",
    changes: [
      "Substituição de todas as buscas manuais de conexões (`conn.sourceNodeId`) por `findTargetFromConnections` em todos os nós (`message`, `set_kanban`, `anti_ban`, `pix_payment`, `condition`, `webhook`, `delay`).",
      "Eliminação definitiva de interrupções de fluxo por imcompatibilidade de formato de bordas ReactFlow."
    ]
  },
  {
    version: "17:36 - v7.0.17",
    date: "18/08/2026",
    title: "Proteção Contra Loop Infinito de Gatilho Curinga (*) & Mapeamento por Número de Opção",
    changes: [
      "Proteção em `ExecuteFlowService.ts` para que o gatilho curinga `*` NUNCA reinicie um fluxo em andamento quando o usuário digita no menu.",
      "Suporte a mapeamento pelo número da opção (`optionNumber`) garantindo que nós com opções pontuais (ex: '2. Vai pra lista 2') avancem para o nó correto."
    ]
  },
  {
    version: "17:17 - v7.0.16",
    date: "18/08/2026",
    title: "Atualização da Tabela Flow para LONGTEXT & Limpeza de Cache de Nós Inexistentes",
    changes: [
      "Alteração do tipo de coluna `nodes` e `connections` no Model `Flow.ts` para `LONGTEXT` no Sequelize, prevenindo que fluxos grandes com mais de 64KB sofram truncamento de JSON no MySQL.",
      "Mecanismo de autolimpeza no Redis para descarte automático de chaves de fluxo desatualizadas quando o fluxo for editado no painel."
    ]
  },
  {
    version: "17:04 - v7.0.15",
    date: "18/08/2026",
    title: "Correção Crítica no Listener do WhatsApp & Garantia de Execução de Fluxos Ativos no Redis",
    changes: [
      "Remoção da trava em `wbotMessageListener.ts` que bloqueava a execução do FlowBuilder caso o status do ticket estivesse aberto ou com atendente.",
      "Garantia de que mensagens em turnos de menu (ex: opção '2') sejam SEMPRE processadas pelo FlowBuilder se houver estado ativo em cache no Redis.",
      "Validação com simulação de fluxo multinó em 3 turnos (Gatilho -> Mensagem -> Kanban -> Mensagem -> Menu -> Lista Interativa -> Fila)."
    ]
  },
  {
    version: "16:46 - v7.0.14",
    date: "18/08/2026",
    title: "Otimização Arquitetural Completa do FlowBuilder: Sincronização Dupla de Handles e Opções",
    changes: [
      "Preservação obrigatória de `sourceHandle` e `targetHandle` no salvamento de conexões em `builder.js`.",
      "Sincronização automática de `targetNodeId`, `targetNodeIdOption` e `targetNodeIdTag` diretamente no array de opções e botões dos nós.",
      "Garantia de continuidade total do fluxo independentemente da quantidade de opções encadeadas."
    ]
  },
  {
    version: "10:50 - v7.0.13",
    date: "18/08/2026",
    title: "Melhoria de Roteamento de Opções no Menu Numérico & Resolução de Conexões ReactFlow",
    changes: [
      "Refatoração de `findTargetFromConnections` no backend `ExecuteFlowService.ts` com suporte unificado a handles de conexão (`sourceHandle`, `option-1`, `opt-0`, `handle-0`).",
      "Garantia de transição sequencial imediata entre o Nó #5 (Menu Numérico) e os nós #6, #7, #8 e #10 sem travamento de opções."
    ]
  },
  {
    version: "21:04 - v7.0.12",
    date: "17/08/2026",
    title: "Remoção de Cache PWA Service Worker & Exibição de Horário no Menu Lateral",
    changes: [
      "Desregistramento automático do PWA Service Worker (`unregister()`) e limpeza de CacheStorage do navegador para evitar congelamento de telas antigas (`v7.0.0`).",
      "Formatação forçada de horário no selo visual do menu lateral ao lado da tag `latest`."
    ]
  },
  {
    version: "20:57 - v7.0.11",
    date: "17/08/2026",
    title: "Sincronização Definitiva de Versão & Horário em Todos os Menus e APIs",
    changes: [
      "Unificação do estado padrão e tratamento de fallback para `20:57 - v7.0.11` no menu lateral (`MainListItems.js`), na Central de Ajuda (`Helps/index.js`), no LogLauncher e na API (`VersionController.ts`).",
      "Garantia de exibição do horário e versão mesmo se o backend estiver em reinicialização."
    ]
  },
  {
    version: "20:05 - v7.0.9",
    date: "17/08/2026",
    title: "Correção de Permissões chown/chmod e Verificação de Usuário PM2 (root vs deploy)",
    changes: [
      "Inclusão de rotina de ajuste de propriedade e permissões de arquivos (`chown -R deploy:deploy` / `chmod -R 755`) para garantir leitura pelo Nginx.",
      "Instruções para reinicialização cruzada de daemons PM2 em ambiente multiusuário Linux (`root` e `deploy`)."
    ]
  },
  {
    version: "19:37 - v7.0.8",
    date: "17/08/2026",
    title: "Validação Final de Deploy VPS & PM2 Backend Online",
    changes: [
      "Confirmação da compilação e recarregamento Nginx com 100% de sucesso na VPS.",
      "Processo `whaticket-backend` reiniciado e rodando em estado ONLINE no PM2."
    ]
  },
  {
    version: "19:35 - v7.0.7",
    date: "17/08/2026",
    title: "Gravada a Regra Permanente de Deploy VPS Ubuntu em .agents/rules/vps_deployment_rule.md",
    changes: [
      "Persistência permanente da regra de deploy da VPS Ubuntu no ecossistema do assistente AI.",
      "Instruções fixadas para reset do git, build com alocação estendida de memória, restart de `whaticket-backend` no PM2 e `reload` do Nginx para estáticos do frontend."
    ]
  },
  {
    version: "19:30 - v7.0.6",
    date: "17/08/2026",
    title: "Suporte a Instalação Nginx Direta (sem o serviço whaticket-frontend no PM2)",
    changes: [
      "Identificação do padrão de arquitetura da VPS onde o Nginx serve diretamente a pasta `frontend/build` sem depender do PM2 no frontend.",
      "Comandos ajustados para recarregar o Nginx (`sudo systemctl reload nginx`) e atualizar estáticos."
    ]
  },
  {
    version: "19:15 - v7.0.5",
    date: "17/08/2026",
    title: "Guia Avançado de Diagnóstico VPS Ubuntu & Verificação de Caminhos PM2/Nginx",
    changes: [
      "Inclusão de roteiro profissional de diagnósticos de atualização para servidores Ubuntu VPS.",
      "Instruções para verificação de diretórios ativos do PM2 (`pm2 info`), Nginx (`root` vs `proxy_pass`) e reset forçado do repositório Git.",
      "Verificação de compilação explícita dos arquivos `dist/` do backend e `build/` do frontend."
    ]
  },
  {
    version: "19:07 - v7.0.4",
    date: "17/08/2026",
    title: "Invalidação de Cache de Build no Express/Nginx & Alocação de Memória no Build",
    changes: [
      "Adicionado suporte a `NODE_OPTIONS=--max-old-space-size=4096` no script de build do frontend para evitar falhas silenciosas de memória no servidor VPS.",
      "Configurados cabeçalhos de resposta `Cache-Control: no-cache, no-store, must-revalidate` no `server.js` do Express para impedir o cache do arquivo index.html no navegador.",
      "Atualização do indicador visual de versão e horário em tempo real na Central de Ajuda."
    ]
  },
  {
    version: "18:53 - v7.0.3",
    date: "17/08/2026",
    title: "Central de Ajuda Atualizada com Exibição de Versão & Horário em Tempo Real",
    changes: [
      "Integração da tag de Versão e Horário em tempo real na Central de Ajuda (Menu Ajuda).",
      "Garantia de atualização visual instantânea após executar git pull & build na VPS.",
      "Correção no avanço e transição resiliente de nós no FlowBuilder (ExecuteFlowService.ts)."
    ]
  },
  {
    version: "18:27 - v7.0.2",
    date: "17/08/2026",
    title: "Exibição de Horário do Build e Regra de Versionamento Incremental",
    changes: [
      "Inclusão do formato HH:mm junto com a versão v7.0.X no menu lateral e pacotes.",
      "Criação da diretriz permanente de versionamento em .agents/rules/versioning_rule.md."
    ]
  },
  {
    version: "v7.0.1",
    date: "17/08/2026",
    title: "Ordenação Visual Dinâmica Y/X dos Nós no Canvas do FlowBuilder",
    changes: [
      "Numeração automática sequencial de cima para baixo sem lacunas ao excluir nós.",
      "Identificação visual por badges [#1], [#2] em menus e dropdowns do construtor."
    ]
  }
];

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const { getVersion } = useVersion();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState("step1");
  const [systemVersion, setSystemVersion] = useState("18:08 - v7.0.19");

  useEffect(() => {
    async function fetchVersion() {
      try {
        const data = await getVersion();
        if (data && data.version) {
          setSystemVersion(data.version);
        }
      } catch (e) {
        setSystemVersion("18:08 - v7.0.19");
      }
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const helps = await list();
        setRecords(helps || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="Player de Treinamento"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Title>Central de Ajuda & Guia Completo do Sistema</Title>
          <Chip
            label={`⚡ Versão: ${systemVersion}`}
            style={{ backgroundColor: "#128C7E", color: "#fff", fontWeight: 800 }}
          />
        </Box>
        <MainHeaderButtonsWrapper />
      </MainHeader>

      <Paper className={classes.mainPaperContainer} variant="outlined">
        {/* Banner do Topo */}
        <Box className={classes.headerBox}>
          <Box display="flex" justifyContent="center" alignItems="center" mb={1.5}>
            <Chip
              label={`⚡ SISTEMA ATUALIZADO EM TEMPO REAL: ${systemVersion}`}
              style={{ backgroundColor: "#FFD700", color: "#000", fontWeight: 800, fontSize: "0.85rem", padding: "4px 8px" }}
            />
          </Box>
          <Typography variant="h4" style={{ fontWeight: 800, marginBottom: 8 }}>
            🚀 Guia de Configuração 100% & Conexão dos Canais
          </Typography>
          <Typography variant="subtitle1" style={{ opacity: 0.95, maxWidth: 840, margin: "0 auto" }}>
            Aprenda passo a passo a conectar seus canais de atendimento (WhatsApp e Instagram) e deixar todo o ecossistema do PJZap 100% configurado para rodar no piloto automático!
          </Typography>
        </Box>

        {/* Abas de Navegação */}
        <Box className={classes.tabsContainer}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="📋 1. Fluxo Sequencial (100% Configurado)" className={classes.tabButton} />
            <Tab label="📱 2. Guia de Conexão dos Canais (WhatsApp & Instagram)" className={classes.tabButton} />
            <Tab label="🤖 3. Manual Completo do FlowBuilder (Todas as Funções)" className={classes.tabButton} />
            <Tab label={`📜 4. Logs de Atualizações (${systemVersion})`} className={classes.tabButton} />
            {records.length > 0 && <Tab label={`🎥 5. Vídeo-Aulas (${records.length})`} className={classes.tabButton} />}
          </Tabs>
        </Box>

        {/* CONTEÚDO DA ABA 1: FLUXO SEQUENCIAL DE SETUP (100%) */}
        {activeTab === 0 && (
          <Box mb={4}>
            <Box mb={3} p={2} style={{ backgroundColor: "rgba(18,140,126,0.08)", borderRadius: 8, border: "1px solid rgba(18,140,126,0.2)" }}>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: "#128C7E", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircleOutlineIcon /> Roteiro Recomendado de Implantação do Zero:
              </Typography>
              <Typography variant="body2" style={{ color: "#444", marginTop: 4 }}>
                Siga a ordem dos 10 passos abaixo para configurar o sistema do início ao fim sem pular nenhuma etapa.
              </Typography>
            </Box>

            {SETUP_FLUXO_STEPS.map((section) => (
              <Accordion
                key={section.id}
                expanded={expandedSection === section.id}
                onChange={handleAccordionChange(section.id)}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className={classes.accordionSummary}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                    <Typography className={classes.accordionTitle}>
                      {section.icon}
                      {section.title}
                    </Typography>
                    <Chip
                      label={section.summary}
                      size="small"
                      className={classes.sectionBadge}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.contentBox}>
                    <Typography variant="body1" style={{ color: "#666", fontWeight: 500, marginBottom: 8 }}>
                      {section.description}
                    </Typography>
                    
                    <Divider />

                    <Box className={classes.stepBlock}>
                      <Typography variant="subtitle2" className={classes.stepTitle}>
                        <HelpOutlineIcon fontSize="small" /> Passo a Passo de Execução:
                      </Typography>
                      <Box component="ol" pl={2.5} style={{ margin: 0 }}>
                        {section.steps.map((step, idx) => (
                          <Box component="li" key={idx} mb={1.2}>
                            <Typography variant="body2" style={{ lineHeight: 1.6 }}>
                              {step}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* CONTEÚDO DA ABA 2: GUIA COMPLETO DE CONEXÃO DOS CANAIS */}
        {activeTab === 1 && (
          <Box mb={4}>
            {/* CANAL 1: WHATSAPP QR CODE */}
            <Paper className={classes.channelCard}>
              <Typography className={classes.channelTitle} style={{ color: "#25D366" }}>
                <QrCodeIcon fontSize="large" /> 1. Conexão WhatsApp QR Code (Baileys / Multi-Device)
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Recomendado para conectar qualquer número de WhatsApp pessoal ou WhatsApp Business lendo o código na tela. Permite que seu celular continue funcionando normalmente enquanto múltiplos atendentes operam no PJZap.
              </Typography>
              
              <Box className={classes.stepBlock} style={{ borderLeftColor: "#25D366" }}>
                <Typography variant="subtitle2" className={classes.stepTitle} style={{ color: "#25D366" }}>
                  <CheckCircleOutlineIcon fontSize="small" /> Passo a Passo para Conectar via QR Code:
                </Typography>
                <Box component="ol" pl={2.5} style={{ margin: 0 }}>
                  <Box component="li" mb={1}><Typography variant="body2">Acesse no menu lateral: <b>Conexões</b> > clique em <b>Adicionar Conexão</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">No campo <b>Canal / Plataforma</b>, selecione <b>WhatsApp (QR Code / Baileys)</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Digite o <b>Nome da Conexão</b> (ex: 'WhatsApp Comercial') e escolha as <b>Filas</b> associadas.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">No campo <b>Token</b>, crie uma palavra-chave secreta para autorizar Webhooks e clique em <b>Salvar</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Na lista de conexões, clique no botão azul <b>QR CODE</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Abra o aplicativo WhatsApp no seu celular > acesse o <b>Menu (três pontinhos ou Configurações)</b> > <b>Aparelhos conectados</b> > <b>Conectar um aparelho</b> e escaneie o código exibido na tela!</Typography></Box>
                </Box>
              </Box>
            </Paper>

            {/* CANAL 2: WHATSAPP CLOUD API OFICIAL META */}
            <Paper className={classes.channelCard}>
              <Typography className={classes.channelTitle} style={{ color: "#128C7E" }}>
                <CloudDoneIcon fontSize="large" /> 2. Conexão WhatsApp Cloud API Oficial Meta (WABA / Coexistência)
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Conexão oficial pelos servidores da Meta (sem leitura de QR Code). Permite a <b>Coexistência</b> (usar a API Cloud Oficial sem perder o aplicativo WhatsApp Business no celular).
              </Typography>
              
              <Box className={classes.stepBlock} style={{ borderLeftColor: "#128C7E" }}>
                <Typography variant="subtitle2" className={classes.stepTitle} style={{ color: "#128C7E" }}>
                  <CheckCircleOutlineIcon fontSize="small" /> Passo a Passo para Conectar a Cloud API Oficial Meta:
                </Typography>
                <Box component="ol" pl={2.5} style={{ margin: 0 }}>
                  <Box component="li" mb={1}><Typography variant="body2">Acesse <b>developers.facebook.com</b> e crie um Aplicativo do tipo <b>Negócios (Business)</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Adicione o produto <b>WhatsApp</b> > acesse <b>API Setup (Configuração da API)</b> e copie o <b>Phone Number ID</b> e o <b>WhatsApp Business Account ID (WABA ID)</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Acesse <b>business.facebook.com/settings</b> > <b>Usuários do Sistema</b> > crie um Usuário Administrador e gere o <b>Token Permanente</b> com as permissões <code>whatsapp_business_messaging</code> e <code>whatsapp_business_management</code>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">No PJZap, vá em <b>Conexões</b> > <b>Adicionar Conexão</b> > escolha <b>WhatsApp Cloud API Oficial (Meta WABA / Coexistência)</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Cole o <b>Phone Number ID</b>, o <b>WABA ID</b> e o <b>Token Permanente da Meta</b>. Defina um Verify Token no campo Token (ex: <code>pjzap_verify_123</code>) e salve.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">De volta ao portal da Meta (<i>WhatsApp > Configuration</i>), edite o Webhook, insira a URL <code>https://sua-vps.com/api/messages/send</code>, o Verify Token e clique em <b>Subscrever</b> no evento <b>messages</b>.</Typography></Box>
                </Box>
              </Box>
            </Paper>

            {/* CANAL 3: INSTAGRAM DIRECT API META */}
            <Paper className={classes.channelCard}>
              <Typography className={classes.channelTitle} style={{ color: "#e1306c" }}>
                <CameraAltIcon fontSize="large" /> 3. Conexão Instagram Direct (API Meta)
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Permite receber e responder todas as mensagens diretas (Direct) do seu perfil comercial do Instagram diretamente pela Central de Atendimento do PJZap.
              </Typography>
              
              <Box className={classes.stepBlock} style={{ borderLeftColor: "#e1306c" }}>
                <Typography variant="subtitle2" className={classes.stepTitle} style={{ color: "#e1306c" }}>
                  <CheckCircleOutlineIcon fontSize="small" /> Passo a Passo para Conectar o Instagram Direct:
                </Typography>
                <Box component="ol" pl={2.5} style={{ margin: 0 }}>
                  <Box component="li" mb={1}><Typography variant="body2">Certifique-se de que sua conta do Instagram é <b>Profissional/Comercial</b> e está vinculada à sua <b>Página do Facebook</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Em <b>business.facebook.com/settings > Páginas</b>, copie o <b>ID da Página do Facebook</b> (número longo).</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Em <b>Usuários do Sistema</b>, gere o Token Permanente com as permissões: <code>instagram_basic</code>, <code>instagram_manage_messages</code> e <code>pages_messaging</code>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">No PJZap, vá em <b>Conexões</b> > <b>Adicionar Conexão</b> > escolha <b>Instagram Direct (API Meta)</b>.</Typography></Box>
                  <Box component="li" mb={1}><Typography variant="body2">Cole o <b>ID da Página do Facebook</b> e o <b>Token de Acesso da Meta</b>, vincule às Filas desejadas e clique em <b>Salvar</b>!</Typography></Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* CONTEÚDO DA ABA 3: MANUAL COMPLETO DO FLOWBUILDER */}
        {activeTab === 2 && (
          <Box mb={4}>
            <Box mb={3} p={2} style={{ backgroundColor: "rgba(0,188,212,0.08)", borderRadius: 8, border: "1px solid rgba(0,188,212,0.2)" }}>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: "#00bcd4", display: "flex", alignItems: "center", gap: 8 }}>
                <AccountTreeIcon /> Manual Passo a Passo de Todas as Funções & Nós do FlowBuilder:
              </Typography>
              <Typography variant="body2" style={{ color: "#444", marginTop: 4 }}>
                Aprenda a utilizar cada um dos 14 componentes visuais do Construtor de Automação para criar robôs inteligentes de atendimento e vendas.
              </Typography>
            </Box>

            {FLOWBUILDER_MANUAL_STEPS.map((section) => (
              <Accordion
                key={section.id}
                expanded={expandedSection === section.id}
                onChange={handleAccordionChange(section.id)}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className={classes.accordionSummary}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                    <Typography className={classes.accordionTitle}>
                      {section.icon}
                      {section.title}
                    </Typography>
                    <Chip
                      label={section.summary}
                      size="small"
                      className={classes.sectionBadge}
                      style={{ backgroundColor: "#00bcd4" }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.contentBox}>
                    <Typography variant="body1" style={{ color: "#666", fontWeight: 500, marginBottom: 8 }}>
                      {section.description}
                    </Typography>
                    
                    <Divider />

                    <Box className={classes.stepBlock} style={{ borderLeftColor: "#00bcd4" }}>
                      <Typography variant="subtitle2" className={classes.stepTitle} style={{ color: "#00bcd4" }}>
                        <HelpOutlineIcon fontSize="small" /> Como Configurar e Utilizar Passo a Passo:
                      </Typography>
                      <Box component="ol" pl={2.5} style={{ margin: 0 }}>
                        {section.steps.map((step, idx) => (
                          <Box component="li" key={idx} mb={1.2}>
                            <Typography variant="body2" style={{ lineHeight: 1.6 }}>
                              {step}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* CONTEÚDO DA ABA 4: LOGS DE ATUALIZAÇÕES DO SISTEMA */}
        {activeTab === 3 && (
          <Box mb={4}>
            <Box mb={3} p={2} style={{ backgroundColor: "rgba(255,215,0,0.1)", borderRadius: 8, border: "1px solid rgba(255,215,0,0.3)" }}>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: "#128C7E", display: "flex", alignItems: "center", gap: 8 }}>
                <CloudDoneIcon /> Histórico de Atualizações do Sistema em Tempo Real
              </Typography>
              <Typography variant="body2" style={{ color: "#444", marginTop: 4 }}>
                Versão ativa no servidor: <strong>{systemVersion}</strong>. Confira abaixo o registro de todas as melhorias e alterações efetuadas.
              </Typography>
            </Box>

            {CHANGELOG_ITEMS.map((item, idx) => (
              <Accordion key={idx} defaultExpanded={idx === 0} className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                    <Typography className={classes.accordionTitle}>
                      <CodeIcon style={{ color: "#128C7E" }} />
                      {item.version} - {item.title}
                    </Typography>
                    <Chip label={item.date} size="small" className={classes.sectionBadge} style={{ backgroundColor: "#128C7E" }} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.contentBox}>
                    <Box component="ul" pl={2.5} style={{ margin: 0 }}>
                      {item.changes.map((change, cIdx) => (
                        <Box component="li" key={cIdx} mb={1}>
                          <Typography variant="body2" style={{ lineHeight: 1.6 }}>
                            {change}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* CONTEÚDO DA ABA 5: VÍDEOS */}
        {activeTab === 4 && records.length > 0 && (
          <Box mb={4}>
            <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 16 }}>
              🎥 Vídeo-Aulas de Treinamento ({records.length})
            </Typography>
            <div className={classes.videoGrid}>
              {records.map((record, key) => (
                <Paper
                  key={key}
                  className={classes.helpPaper}
                  onClick={() => openVideoModal(record.video)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                    alt="Thumbnail"
                    className={classes.videoThumbnail}
                  />
                  <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                    {record.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {record.description}
                  </Typography>
                </Paper>
              ))}
            </div>
          </Box>
        )}
      </Paper>

      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;