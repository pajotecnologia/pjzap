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
  Grid
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

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import useHelps from "../../hooks/useHelps";

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
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing(3),
    marginTop: theme.spacing(4),
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

const MANUAL_SECTIONS = [
  {
    id: "step1",
    title: "1. Personalização da Marca & Aparência (White-Label)",
    icon: <PaletteIcon style={{ color: "#e91e63" }} />,
    summary: "Como deixar o sistema com as cores, logotipos e fontes da sua empresa.",
    description: "Permite customizar a identidade visual completa da plataforma desde a tela de login até o painel interno.",
    steps: [
      "Acesse no menu lateral esquerdo: Configurações > Aparência.",
      "Faça upload da imagem do Logo da Tela de Login e do Logo Interno (exibido na barra superior).",
      "Defina a Cor Primária (ex: tom verde da sua empresa) e Cor Secundária para destacar botões e ícones.",
      "Ajuste o Tamanho da Fonte Global para a melhor legibilidade da sua equipe.",
      "Alterne entre Tema Claro e Tema Escuro (Dark Mode) conforme sua preferência.",
      "Clique em Salvar para aplicar as alterações em tempo real."
    ]
  },
  {
    id: "step2",
    title: "2. Setores & Filas de Atendimento (Queues)",
    icon: <DeviceHubIcon style={{ color: "#ff9800" }} />,
    summary: "Organização por departamentos com horários de funcionamento.",
    description: "As filas segregam os atendimentos em setores específicos (ex: Comercial, Suporte Técnico, Financeiro).",
    steps: [
      "Acesse o menu Filas > Adicionar Fila.",
      "Digite o Nome da Fila (ex: Vendas) e selecione a Cor de identificação.",
      "Digite a Mensagem de Saudação enviada automaticamente assim que o cliente entra na fila.",
      "Configure o Horário de Atendimento (dias da semana e intervalos de horário).",
      "Configure a Mensagem Fora de Expediente enviada caso o cliente envie mensagem à noite ou finais de semana.",
      "Clique em Salvar."
    ]
  },
  {
    id: "step3",
    title: "3. Cadastro de Usuários & Permissões da Equipe",
    icon: <PeopleIcon style={{ color: "#2196f3" }} />,
    summary: "Gestão de acessos para atendentes e administradores.",
    description: "Cadastre sua equipe dando acesso restrito a setores e funções específicas.",
    steps: [
      "Acesse o menu Usuários > Adicionar Usuário.",
      "Preencha o Nome, E-mail de login e Senha inicial do atendente.",
      "Defina o Perfil: escolha 'User' para atendente comum ou 'Admin' para acesso total a relatórios e configurações.",
      "Em Filas, selecione quais departamentos este atendente terá permissão para visualizar e responder.",
      "Clique em Salvar."
    ]
  },
  {
    id: "step4",
    title: "4. Conexões de WhatsApp & Instagram Direct",
    icon: <PhonelinkSetupIcon style={{ color: "#4caf50" }} />,
    summary: "Conecte seus números de WhatsApp e páginas do Instagram.",
    description: "Vincule seus canais de comunicação para receber e responder todas as mensagens em um único lugar.",
    steps: [
      "Acesse o menu Conexões > Adicionar Conexão.",
      "Selecione o Canal desejado: 'WhatsApp (QR Code)' ou 'Instagram Direct (API Meta)'.",
      "Digite o Nome da Conexão e selecione as Filas associadas a este número.",
      "No campo Token, crie uma chave secreta da sua escolha (ex: 'token_api_123') para autorizar integrações externas.",
      "Clique em Salvar.",
      "Na lista de conexões, clique no botão QR CODE e escaneie com o WhatsApp do seu celular (Menu > Aparelhos conectados > Conectar um aparelho)."
    ]
  },
  {
    id: "step5",
    title: "5. Funil de Vendas Kanban, Tags & Disparos Automáticos",
    icon: <ViewColumnIcon style={{ color: "#9c27b0" }} />,
    summary: "Gestão visual de leads, métricas financeiras e automações de coluna.",
    description: "Transforme suas Tags em colunas do Kanban CRM para acompanhar o progresso de cada oportunidade de negócio.",
    steps: [
      "Acesse o menu Tags > Adicionar Tag.",
      "Digite o Nome da etapa (ex: '1. Novo Lead', '2. Proposta Enviada', '3. Fechado').",
      "Escolha a Cor da Tag e marque o campo 'Marcar como Kanban = Sim'.",
      "Em Mensagem de Automação, escreva um texto para ser enviado automaticamente ao cliente assim que o card for movido para esta coluna.",
      "Em Disparar Fluxo, selecione um robô do FlowBuilder para ser executado ao arrastar o card.",
      "No menu Kanban, visualize o quadro de colunas, o faturamento acumulado por etapa e os dados de UTMs dos leads."
    ]
  },
  {
    id: "step6",
    title: "6. Construtor Visual de Chatbots (FlowBuilder)",
    icon: <AccountTreeIcon style={{ color: "#00bcd4" }} />,
    summary: "Automação inteligente de triagem, menus, cobranças Pix e Webhooks.",
    description: "Crie fluxos de atendimento automatizados completos usando um editor visual 'drag and drop'.",
    steps: [
      "Acesse o menu FlowBuilder > Criar Novo Fluxo.",
      "Gatilho: Configure a palavra-chave no nó inicial (use '*' para responder a qualquer mensagem inicial).",
      "Adicionar Nós: Arraste nós da barra superior: + Mensagem, + Menu, + Condição, + Webhook, + Atraso, + Sorteio, + Cobrar Pix, + Kanban.",
      "Conectar Bloco a Bloco: Clique na bolinha de saída de um nó e arraste até o nó de destino para criar o fio de conexão.",
      "Remover Conexão: Para excluir uma linha, basta clicar com o mouse sobre ela ou selecioná-la e pressionar a tecla Delete no teclado.",
      "Configuração dos Nós: Clique no nó para abrir o painel lateral e preencher os textos, valores ou URLs.",
      "Clique em Salvar Fluxo e ative a chave Status."
    ]
  },
  {
    id: "step7",
    title: "7. Respostas Rápidas (Quick Answers)",
    icon: <FlashOnIcon style={{ color: "#ffc107" }} />,
    summary: "Atalhos por barra '/' para agilizar respostas repetitivas.",
    description: "Cadastre respostas padrão para que sua equipe envie informações completas com apenas dois cliques.",
    steps: [
      "Acesse o menu Respostas Rápidas > Adicionar.",
      "No campo Atalho, digite a palavra sem espaços (ex: 'pix', 'endereco', 'horario').",
      "Digite o texto completo da resposta e anexe arquivos/mídias se necessário.",
      "Durante o atendimento no chat, o atendente digita '/' para abrir a lista de atalhos e clica na resposta desejada."
    ]
  },
  {
    id: "step8",
    title: "8. Disparos em Massa & Campanhas",
    icon: <SendIcon style={{ color: "#3f51b5" }} />,
    summary: "Envio de mensagens em lote para listas ou segmentos do Kanban.",
    description: "Realize transmissões ativas de marketing e avisos para milhares de contatos com segurança.",
    steps: [
      "Para enviar para uma planilha: Acesse Listas de Contatos e importe seu arquivo CSV/Excel.",
      "Para enviar por segmento: Certifique-se de que seus contatos possuem uma Tag do Kanban atribuída.",
      "Acesse o menu Campanhas > Nova Campanha.",
      "Digite o Nome da Campanha e selecione a Conexão do WhatsApp emissora.",
      "Selecione a Lista de Contatos ou a Tag do Kanban de destino.",
      "Escreva as variações de mensagem (suporta spintax ex: '{Olá|Oi|Tudo bem}') e escolha a data/hora do disparo.",
      "Clique em Salvar."
    ]
  },
  {
    id: "step9",
    title: "9. Central de Atendimento ao Vivo",
    icon: <HeadsetMicIcon style={{ color: "#4caf50" }} />,
    summary: "Operação diária da equipe de atendimento em tempo real.",
    description: "Gerencie conversas simultâneas de WhatsApp e Instagram Direct com recursos avançados.",
    steps: [
      "Aba Aguardando: Onde entram novas conversas ou clientes triados pelo robô. Clique em 'Aceitar' para iniciar.",
      "Aba Atendendo: Onde ficam os chamados ativos do seu usuário.",
      "Envio de Mídias: Envie áudios simulando gravação em tempo real, fotos, vídeos ou PDFs de até 50MB.",
      "Transferência: Clique em 'Transferir' para passar o chamado para outro atendente ou fila.",
      "Encerrar: Clique no ícone de Check verde (✅) para resolver e arquivar a conversa."
    ]
  },
  {
    id: "step10",
    title: "10. API Externa Exclusiva & Webhooks",
    icon: <CodeIcon style={{ color: "#607d8b" }} />,
    summary: "Integração HTTP REST com n8n, Make, CRMs e plataformas externas.",
    description: "Dispare mensagens automatizadas via código ou sistemas terceiros de forma simples.",
    steps: [
      "Acesse o menu API.",
      "Copie a URL do Endpoint de Envio: 'https://seu-dominio.com/api/messages/send'.",
      "No cabeçalho HTTP da sua requisição, inclua: 'Authorization: Bearer SEU_TOKEN' (o token cadastrado na Conexão do WhatsApp).",
      "No corpo (Body JSON), envie: { \"number\": \"5511999999999\", \"body\": \"Sua mensagem\" }.",
      "Utilize o painel de 'Teste de Envio' na própria aba API para validar suas credenciais."
    ]
  }
];

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedSection, setExpandedSection] = useState("step1");

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
        <Title>Central de Ajuda & Manual Completo do Sistema</Title>
        <MainHeaderButtonsWrapper />
      </MainHeader>

      <Paper className={classes.mainPaperContainer} variant="outlined">
        {/* Cabeçalho do Manual */}
        <Box className={classes.headerBox}>
          <Typography variant="h4" style={{ fontWeight: 800, marginBottom: 8 }}>
            📘 Manual Passo a Passo de Configuração
          </Typography>
          <Typography variant="subtitle1" style={{ opacity: 0.95, maxWidth: 780, margin: "0 auto" }}>
            Aprenda a configurar todas as funções do PJZap, desde os cadastros iniciais de marca e filas até a operação completa de atendimento multicanal e automação visual!
          </Typography>
        </Box>

        {/* Sanfona / Accordions do Manual */}
        <Box mb={4}>
          {MANUAL_SECTIONS.map((section) => (
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
                      <HelpOutlineIcon fontSize="small" /> Passo a Passo de Configuração:
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

        {/* Vídeos de Treinamento (Se houver no banco) */}
        {records.length > 0 && (
          <Box mt={4}>
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