import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Box,
  CircularProgress,
  Drawer,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@material-ui/core";
import {
  ArrowBack,
  Save,
  Delete,
  PlayArrow,
  Chat,
  ListAlt,
  TransferWithinAStation,
  CheckCircle,
  Add,
  Close,
  ViewColumn,
  MonetizationOn,
  CallSplit,
  Http,
  HourglassEmpty,
  Shuffle,
  RadioButtonChecked,
  FormatListBulleted,
  ViewCarousel,
  Code,
  Security,
  Send,
  Search,
} from "@material-ui/icons";

import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import api from "../../services/api";

// ─────────────────────────────────────────────
//  ESTILOS GERAIS DA PÁGINA E DA PALETA
// ─────────────────────────────────────────────
const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0f0f1a",
    overflow: "hidden",
  },
  header: {
    padding: "8px 16px",
    backgroundColor: "#161626",
    borderBottom: "1px solid #252538",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  flowNameInput: {
    "& input": {
      color: "#ffffff",
      fontSize: "1.05rem",
      fontWeight: 700,
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: "rgba(255,255,255,0.2)",
    },
    "& .MuiInput-underline:hover:before": {
      borderBottomColor: "rgba(255,255,255,0.5)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#128C7E",
    },
  },
  mainContent: {
    flex: 1,
    display: "flex",
    position: "relative",
    overflow: "hidden",
  },
  sidebar: {
    width: 240,
    backgroundColor: "#161626",
    borderRight: "1px solid #252538",
    display: "flex",
    flexDirection: "column",
    zIndex: 5,
    boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
  },
  sidebarHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid #252538",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarSearch: {
    padding: "8px 12px",
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      fontSize: "0.8rem",
      backgroundColor: "#0f0f1a",
      borderRadius: 8,
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&.Mui-focused fieldset": { borderColor: "#128C7E" },
    },
  },
  sidebarScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 12px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    "&::-webkit-scrollbar": { width: 4 },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2 },
  },
  categoryTitle: {
    fontSize: "0.72rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 8,
  },
  paletteCard: {
    backgroundColor: "#1e1e32",
    borderRadius: 8,
    padding: "8px 10px",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "all 0.15s ease-in-out",
    "&:hover": {
      backgroundColor: "#272742",
      transform: "translateX(2px)",
      borderColor: "rgba(255,255,255,0.25)",
      boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
    },
  },
  paletteIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
  },
  paletteLabel: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#e0e0e0",
  },
  canvas: {
    flex: 1,
    "& .react-flow__controls": {
      backgroundColor: "#161626",
      boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
      borderRadius: 8,
      border: "1px solid #252538",
      overflow: "hidden",
    },
    "& .react-flow__controls-button": {
      backgroundColor: "#161626 !important",
      borderBottom: "1px solid #252538 !important",
      color: "#ffffff !important",
      fill: "#ffffff !important",
      width: "32px !important",
      height: "32px !important",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#128C7E !important",
      },
      "& svg": {
        fill: "#ffffff !important",
        stroke: "#ffffff !important",
        width: "16px !important",
        height: "16px !important",
      },
      "& path": {
        fill: "#ffffff !important",
      },
    },
  },
  drawerPaper: {
    width: 340,
    padding: 18,
    top: "64px",
    height: "calc(100% - 64px)",
    backgroundColor: "#161626",
    color: "#e0e0e0",
    borderLeft: "1px solid #252538",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.4)",
    overflowY: "auto",
  },
  drawerField: {
    marginBottom: 14,
    "& .MuiOutlinedInput-root": {
      color: "#e0e0e0",
      fontSize: "0.85rem",
      backgroundColor: "#0f0f1a",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "#128C7E" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#128C7E" },
    "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" },
    "& .MuiSelect-root": { color: "#e0e0e0", fontSize: "0.85rem" },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
  },
  saveBtn: {
    background: "linear-gradient(135deg, #128C7E 0%, #075E54 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.82rem",
    padding: "6px 16px",
    borderRadius: 8,
    textTransform: "none",
    boxShadow: "0 4px 12px rgba(18,140,126,0.4)",
    "&:hover": {
      background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    },
  },
  testBtn: {
    borderColor: "#128C7E",
    color: "#25D366",
    fontWeight: 700,
    fontSize: "0.82rem",
    borderRadius: 8,
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgba(37, 211, 102, 0.1)",
    },
  },
}));

// ─────────────────────────────────────────────
//  ESTILOS E DEFINIÇÃO DE CORES DOS NÓS
// ─────────────────────────────────────────────
const nodeBaseStyle = {
  borderRadius: 10,
  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
  minWidth: 200,
  fontSize: 12,
  fontFamily: "'Roboto', sans-serif",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: "8px 8px 0 0",
  fontWeight: 700,
  fontSize: 12,
  color: "#fff",
};

const bodyStyle = {
  padding: "10px 12px",
  backgroundColor: "#ffffff",
  borderRadius: "0 0 8px 8px",
  color: "#333",
  fontSize: 11,
};

const nodeColors = {
  trigger: { header: "linear-gradient(135deg, #128C7E, #075E54)", border: "#128C7E", bg: "#128C7E" },
  message: { header: "linear-gradient(135deg, #1565c0, #0d47a1)", border: "#1976d2", bg: "#1976d2" },
  buttons: { header: "linear-gradient(135deg, #00897b, #004d40)", border: "#009688", bg: "#009688" },
  list_menu: { header: "linear-gradient(135deg, #5e35b1, #311b92)", border: "#673ab7", bg: "#673ab7" },
  carousel: { header: "linear-gradient(135deg, #d81b60, #880e4f)", border: "#e91e63", bg: "#e91e63" },
  set_variable: { header: "linear-gradient(135deg, #fb8c00, #e65100)", border: "#ff9800", bg: "#ff9800" },
  menu: { header: "linear-gradient(135deg, #6a1b9a, #4a148c)", border: "#7b1fa2", bg: "#7b1fa2" },
  condition: { header: "linear-gradient(135deg, #00838f, #006064)", border: "#00acc1", bg: "#00acc1" },
  randomizer: { header: "linear-gradient(135deg, #c2185b, #ad1457)", border: "#ec407a", bg: "#ec407a" },
  delay: { header: "linear-gradient(135deg, #ff8f00, #ff6f00)", border: "#ffca28", bg: "#ffca28" },
  anti_ban: { header: "linear-gradient(135deg, #43a047, #1b5e20)", border: "#4caf50", bg: "#4caf50" },
  webhook: { header: "linear-gradient(135deg, #3949ab, #1a237e)", border: "#5c6bc0", bg: "#5c6bc0" },
  set_kanban: { header: "linear-gradient(135deg, #2e7d32, #1b5e20)", border: "#4caf50", bg: "#4caf50" },
  pix_payment: { header: "linear-gradient(135deg, #ef6c00, #e65100)", border: "#ff9800", bg: "#ff9800" },
  transfer_queue: { header: "linear-gradient(135deg, #ed6c02, #bf360c)", border: "#ed6c02", bg: "#ed6c02" },
  close_ticket: { header: "linear-gradient(135deg, #c62828, #8e0000)", border: "#d32f2f", bg: "#d32f2f" },
};

const NodeIcons = {
  trigger: <PlayArrow style={{ fontSize: 16 }} />,
  message: <Chat style={{ fontSize: 16 }} />,
  buttons: <RadioButtonChecked style={{ fontSize: 16 }} />,
  list_menu: <FormatListBulleted style={{ fontSize: 16 }} />,
  carousel: <ViewCarousel style={{ fontSize: 16 }} />,
  set_variable: <Code style={{ fontSize: 16 }} />,
  menu: <ListAlt style={{ fontSize: 16 }} />,
  condition: <CallSplit style={{ fontSize: 16 }} />,
  randomizer: <Shuffle style={{ fontSize: 16 }} />,
  delay: <HourglassEmpty style={{ fontSize: 16 }} />,
  anti_ban: <Security style={{ fontSize: 16 }} />,
  webhook: <Http style={{ fontSize: 16 }} />,
  set_kanban: <ViewColumn style={{ fontSize: 16 }} />,
  pix_payment: <MonetizationOn style={{ fontSize: 16 }} />,
  transfer_queue: <TransferWithinAStation style={{ fontSize: 16 }} />,
  close_ticket: <CheckCircle style={{ fontSize: 16 }} />,
};

const NodeLabels = {
  trigger: "Gatilho Inicial",
  message: "Mensagem de Texto",
  buttons: "Botões Interativos",
  list_menu: "Lista Interativa",
  carousel: "Carrossel de Cards",
  set_variable: "Salvar Variável",
  menu: "Menu Numérico",
  condition: "Condição (If/Else)",
  randomizer: "Sorteio (A/B)",
  delay: "Atraso (Delay)",
  anti_ban: "Pausa Anti-Ban",
  webhook: "Webhook (HTTP)",
  set_kanban: "Mover Kanban",
  pix_payment: "Cobrar Pix",
  transfer_queue: "Transferir Fila",
  close_ticket: "Encerrar Ticket",
};

// Categorias para a Barra Lateral
const PALETTE_CATEGORIES = [
  {
    title: "Comunicação & Mídias",
    items: ["trigger", "message", "buttons", "list_menu", "carousel"],
  },
  {
    title: "Lógica & Condicionais",
    items: ["menu", "condition", "randomizer", "set_variable"],
  },
  {
    title: "Atrasos & Proteção",
    items: ["delay", "anti_ban", "webhook"],
  },
  {
    title: "CRM, Cobrança & Ações",
    items: ["set_kanban", "pix_payment", "transfer_queue", "close_ticket"],
  },
];

// ─────────────────────────────────────────────
//  CONTEXTO E COMPONENTE DE NÓ CUSTOMIZADO
// ─────────────────────────────────────────────
const NodesContext = React.createContext({ nodes: [] });

const CustomNode = ({ id, data, selected }) => {
  const { nodes } = React.useContext(NodesContext);
  const color = nodeColors[data.type] || nodeColors.message;
  const isFirst = data.type === "trigger";

  const currentNodeTag = data.nodeIdTag || id;

  const getTargetBadge = (targetId) => {
    if (!targetId) return "";
    const targetNode = (nodes || []).find((n) => n.id === targetId);
    if (!targetNode) return targetId;
    return targetNode.data?.nodeIdTag ? `#${targetNode.data.nodeIdTag}` : `#${targetId}`;
  };

  return (
    <div
      style={{
        ...nodeBaseStyle,
        border: `2px solid ${selected ? "#FFD700" : color.border}`,
        transform: selected ? "scale(1.02)" : "scale(1)",
        transition: "all 0.15s ease",
      }}
    >
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: color.border,
            width: 12,
            height: 12,
            border: "2px solid white",
          }}
        />
      )}

      <div style={{ ...headerStyle, background: color.header }}>
        <span
          style={{
            background: "rgba(0, 0, 0, 0.35)",
            color: "#FFD700",
            fontWeight: 900,
            padding: "2px 7px",
            borderRadius: 4,
            fontSize: 11,
            border: "1px solid rgba(255, 215, 0, 0.6)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            marginRight: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 20,
          }}
        >
          #{currentNodeTag}
        </span>
        {NodeIcons[data.type]}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {data.title || NodeLabels[data.type]}
        </span>
      </div>

      <div style={bodyStyle}>
        {data.type === "trigger" && (
          <div>
            <strong>Gatilho:</strong> {data.keyword ? `"${data.keyword}"` : "Todas (*)"}
          </div>
        )}
        {data.type === "message" && (
          <div style={{ color: "#555", wordBreak: "break-word" }}>
            {data.content ? (data.content.length > 50 ? `${data.content.substring(0, 50)}...` : data.content) : "Mensagem vazia..."}
          </div>
        )}
        {data.type === "buttons" && (
          <div>
            <div style={{ fontWeight: 600 }}>{data.title || "Mensagem c/ Botões"}</div>
            {(data.buttons || []).map((btn, idx) => (
              <div key={btn.id || idx} style={{ fontSize: 10, color: "#444", display: "flex", justifyContent: "space-between", gap: 4 }}>
                <span>🔘 {btn.text}</span>
                {btn.targetNodeId && (
                  <span style={{ fontSize: 9, color: "#9c27b0", fontWeight: 700 }}>
                    ➔ Nó {getTargetBadge(btn.targetNodeId)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {data.type === "list_menu" && (
          <div>
            <div style={{ fontWeight: 600 }}>{data.title || "Lista de Opções"}</div>
            {(data.options || []).map((opt, idx) => (
              <div key={opt.id || idx} style={{ fontSize: 10, color: "#444", display: "flex", justifyContent: "space-between", gap: 4 }}>
                <span>🔹 {opt.text}</span>
                {opt.targetNodeId && (
                  <span style={{ fontSize: 9, color: "#2196f3", fontWeight: 700 }}>
                    ➔ Nó {getTargetBadge(opt.targetNodeId)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {data.type === "carousel" && (
          <div>
            <div style={{ fontWeight: 600 }}>Carrossel</div>
            <div style={{ fontSize: 10, color: "#666" }}>
              {(data.cards || []).length} cards no carrossel
            </div>
          </div>
        )}
        {data.type === "set_variable" && (
          <div>
            <strong>Variável:</strong> {data.variableName || "campo"}
          </div>
        )}
        {data.type === "menu" && (
          <div>
            <div style={{ color: "#555", marginBottom: 4 }}>
              {data.content ? `${data.content.substring(0, 30)}...` : "Menu Numérico"}
            </div>
            {(data.options || []).map((opt, idx) => (
              <div key={opt.id || idx} style={{ fontSize: 10, color: "#444", display: "flex", justifyContent: "space-between", gap: 4 }}>
                <span>🔹 {opt.optionNumber || idx + 1}. {opt.text}</span>
                {opt.targetNodeId && (
                  <span style={{ fontSize: 9, color: "#128C7E", fontWeight: 700 }}>
                    ➔ Nó {getTargetBadge(opt.targetNodeId)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {data.type === "condition" && (
          <div>
            <div>Palavra: <strong>{data.conditionKeyword || "..."}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10 }}>
              <span style={{ color: "green", fontWeight: 700 }}>
                VERDADEIRO {data.targetNodeIdTrue ? `➔ ${getTargetBadge(data.targetNodeIdTrue)}` : ""}
              </span>
              <span style={{ color: "red", fontWeight: 700 }}>
                FALSO {data.targetNodeIdFalse ? `➔ ${getTargetBadge(data.targetNodeIdFalse)}` : ""}
              </span>
            </div>
          </div>
        )}
        {data.type === "randomizer" && (
          <div>Sorteio A/B entre conexões de saída</div>
        )}
        {data.type === "delay" && (
          <div>Aguardar <strong>{data.delaySeconds || 1}s</strong></div>
        )}
        {data.type === "anti_ban" && (
          <div>Pausa <strong>{data.minDelaySeconds || 3}s - {data.maxDelaySeconds || 8}s</strong> (Aleatório)</div>
        )}
        {data.type === "webhook" && (
          <div style={{ fontSize: 10, wordBreak: "break-all" }}>
            URL: {data.webhookUrl || "Não configurada"}
          </div>
        )}
        {data.type === "set_kanban" && (
          <div>Mover para Tag ID #{data.tagId || "---"}</div>
        )}
        {data.type === "pix_payment" && (
          <div>Valor: <strong>R$ {Number(data.pixValue || 1).toFixed(2)}</strong></div>
        )}
        {data.type === "transfer_queue" && (
          <div>Fila ID: #{data.queueId || "---"}</div>
        )}
        {data.type === "close_ticket" && (
          <div>Encerrar atendimento</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color.border,
          width: 12,
          height: 12,
          border: "2px solid white",
        }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// ─────────────────────────────────────────────
//  MODAL DE TESTAR FLUXO
// ─────────────────────────────────────────────
const TestFlowModal = ({ open, onClose, flowId }) => {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!number || number.length < 8) {
      toast.error("Por favor, informe um número de WhatsApp válido.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/flows/${flowId}/test`, { number });
      toast.success("🚀 Fluxo disparado com sucesso para o WhatsApp de teste!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erro ao testar fluxo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>▶️ Testar Fluxo no WhatsApp</DialogTitle>
      <DialogContent>
        <Typography variant="body2" style={{ marginBottom: 16, color: "#666" }}>
          Informe o seu número de WhatsApp com DDD para disparar a execução deste robô imediatamente (Certifique-se de ter um WhatsApp <b>Conectado</b> na aba Conexões):
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Número do WhatsApp (DDD + Número)"
          variant="outlined"
          placeholder="Ex: (87) 96540-5511 ou 5587965405511"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button
          onClick={handleTest}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Send />}
        >
          Disparar Teste
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const FlowBuilderInner = () => {
  const classes = useStyles();
  const { flowId } = useParams();
  const history = useHistory();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState("Novo Fluxo");
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [queues, setQueues] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openTestModal, setOpenTestModal] = useState(false);
  const reactFlowInstance = useRef(null);

  // Carrega dados do fluxo, filas e tags
  useEffect(() => {
    async function loadData() {
      try {
        const { data: queueData } = await api.get("/queue");
        setQueues(queueData || []);

        const { data: tagData } = await api.get("/tags");
        setTags(tagData.tags || tagData || []);

        if (flowId) {
          const { data: flowData } = await api.get(`/flows/${flowId}`);
          setFlowName(flowData.name || "Novo Fluxo");

          const parsedNodes = typeof flowData.nodes === "string" ? JSON.parse(flowData.nodes) : flowData.nodes;
          const parsedEdges = typeof flowData.connections === "string" ? JSON.parse(flowData.connections) : flowData.connections;

          if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
            setNodes(
              parsedNodes.map((n, idx) => ({
                id: n.id,
                type: "custom",
                position: n.position || { x: 250, y: 100 },
                data: {
                  nodeIdTag: `${idx + 1}`,
                  ...n,
                },
              }))
            );
          } else {
            setNodes([
              {
                id: "trigger_1",
                type: "custom",
                position: { x: 250, y: 100 },
                data: { id: "trigger_1", type: "trigger", title: "Gatilho Inicial", keyword: "*", nodeIdTag: "1" },
              },
            ]);
          }

          if (Array.isArray(parsedEdges)) {
            setEdges(
              parsedEdges.map((c, idx) => ({
                id: `e_${c.sourceNodeId}_${c.targetNodeId}_${idx}`,
                source: c.sourceNodeId,
                target: c.targetNodeId,
                type: "smoothstep",
                animated: true,
                style: { stroke: "#128C7E", strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#128C7E" },
              }))
            );
          }
        } else {
          setNodes([
            {
              id: "trigger_1",
              type: "custom",
              position: { x: 250, y: 100 },
              data: { id: "trigger_1", type: "trigger", title: "Gatilho Inicial", keyword: "*", nodeIdTag: "1" },
            },
          ]);
        }
      } catch (err) {
        toast.error("Erro ao carregar o fluxo.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [flowId, setNodes, setEdges]);

  // Salva o fluxo
  const handleSave = async () => {
    try {
      const formattedNodes = nodes.map((n) => ({
        ...n.data,
        id: n.id,
        position: n.position,
      }));

      const formattedConnections = edges.map((e) => ({
        sourceNodeId: e.source,
        targetNodeId: e.target,
      }));

      const payload = {
        name: flowName,
        nodes: JSON.stringify(formattedNodes),
        connections: JSON.stringify(formattedConnections),
        active: true,
      };

      if (flowId) {
        await api.put(`/flows/${flowId}`, payload);
        toast.success("✅ Fluxo salvo com sucesso!");
      } else {
        const { data } = await api.post("/flows", payload);
        toast.success("✅ Fluxo criado com sucesso!");
        history.push(`/flowbuilder/${data.id}`);
      }
    } catch (err) {
      toast.error("Erro ao salvar fluxo.");
    }
  };

  // Conectar nós por borda
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#128C7E", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#128C7E" },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Apagar conexão com clique na linha
  const onEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      toast.info("Linha de conexão removida!");
    },
    [setEdges]
  );

  // Adiciona novo nó
  const handleAddNode = (type) => {
    const newId = `${type}_${Date.now()}`;
    const count = nodes.length + 1;
    const newNode = {
      id: newId,
      type: "custom",
      position: {
        x: 250 + Math.random() * 80,
        y: 150 + Math.random() * 80,
      },
      data: {
        id: newId,
        type,
        nodeIdTag: `${count}`,
        title: NodeLabels[type],
        content: type === "message" ? "Olá! Como posso ajudar?" : (type === "menu" ? "Escolha uma opção:" : ""),
        buttons: type === "buttons" ? [{ id: "btn_1", text: "Opção 1" }] : [],
        options: type === "list_menu" ? [{ id: "opt_1", optionNumber: "1", text: "Item 1" }] : (type === "menu" ? [{ id: "opt_1", optionNumber: "1", text: "Opção 1" }] : []),
        cards: type === "carousel" ? [{ title: "Card 1", description: "Descrição do card 1", buttonText: "Ver mais" }] : [],
        conditionKeyword: type === "condition" ? "sim" : "",
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  };

  // Clique no nó para abrir editor no Drawer
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  // Atualizar dados do nó no state
  const updateNodeData = (key, value) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedData = { ...n.data, [key]: value };
          setSelectedNode({ ...n, data: updatedData });
          return { ...n, data: updatedData };
        }
        return n;
      })
    );
  };

  // Sincronizar linhas de conexão visuais ao vincular nós de destino
  const syncOptionEdge = (sourceId, targetId) => {
    if (!targetId) return;
    setEdges((eds) => {
      const exists = eds.some((e) => e.source === sourceId && e.target === targetId);
      if (exists) return eds;
      return [
        ...eds,
        {
          id: `e_${sourceId}_${targetId}_${Date.now()}`,
          source: sourceId,
          target: targetId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#128C7E", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#128C7E" },
        },
      ];
    });
  };

  // Excluir nó selecionado (Permite excluir QUALQUER nó selecionado)
  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
    toast.info("Nó excluído com sucesso.");
  };

  const renderTargetNodeOptions = (allNodes, currentSelectedNodeId) => {
    return allNodes
      .filter((n) => n.id !== currentSelectedNodeId)
      .map((n) => {
        const tag = n.data?.nodeIdTag ? `#${n.data.nodeIdTag}` : `#${n.id}`;
        const typeLabel = n.data?.title || NodeLabels[n.data?.type] || n.id;
        const snippet = n.data?.content
          ? ` - "${n.data.content.length > 20 ? n.data.content.substring(0, 20) + "..." : n.data.content}"`
          : n.data?.keyword
          ? ` - Gatilho "${n.data.keyword}"`
          : "";

        return (
          <MenuItem key={n.id} value={n.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
              <span
                style={{
                  background: "#FFD700",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                {tag}
              </span>
              {NodeIcons[n.data?.type]}
              <span style={{ fontWeight: 600, fontSize: 12 }}>{typeLabel}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {snippet}
              </span>
            </div>
          </MenuItem>
        );
      });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#0f0f1a">
        <CircularProgress style={{ color: "#128C7E" }} />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      {/* ─────────────────────────────────────────────
          1. HEADER DA PÁGINA
      ───────────────────────────────────────────── */}
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <Tooltip title="Voltar para lista de fluxos">
            <IconButton onClick={() => history.push("/flowbuilder")} style={{ color: "#fff" }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <TextField
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className={classes.flowNameInput}
          />
        </div>

        <div className={classes.headerRight}>
          <Button
            variant="outlined"
            className={classes.testBtn}
            onClick={() => setOpenTestModal(true)}
            startIcon={<PlayArrow />}
          >
            Testar Fluxo
          </Button>

          <Button
            variant="contained"
            className={classes.saveBtn}
            onClick={handleSave}
            startIcon={<Save />}
          >
            Salvar Fluxo
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          2. CONTEÚDO PRINCIPAL (PALETA + CANVAS)
      ───────────────────────────────────────────── */}
      <div className={classes.mainContent}>
        {/* PALETA LATERAL DE COMPONENTES */}
        <div className={classes.sidebar}>
          <div className={classes.sidebarHeader}>
            <Typography variant="button" style={{ fontWeight: 800, color: "#fff" }}>
              COMPONENTES
            </Typography>
          </div>

          <div className={classes.sidebarSearch}>
            <TextField
              placeholder="Pesquisar nó..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className={classes.sidebarScroll}>
            {PALETTE_CATEGORIES.map((cat, idx) => {
              const filteredItems = cat.items.filter((itemKey) =>
                NodeLabels[itemKey].toLowerCase().includes(searchTerm)
              );
              if (filteredItems.length === 0) return null;

              return (
                <div key={idx}>
                  <div className={classes.categoryTitle}>{cat.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {filteredItems.map((itemKey) => {
                      const color = nodeColors[itemKey] || nodeColors.message;
                      return (
                        <div
                          key={itemKey}
                          className={classes.paletteCard}
                          onClick={() => handleAddNode(itemKey)}
                        >
                          <div className={classes.paletteIconBox} style={{ background: color.header }}>
                            {NodeIcons[itemKey]}
                          </div>
                          <span className={classes.paletteLabel}>{NodeLabels[itemKey]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CANVAS REACTFLOW */}
        <div className={classes.canvas}>
          <NodesContext.Provider value={{ nodes }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                deleteKeyCode={["Backspace", "Delete"]}
                fitView
                attributionPosition="bottom-right"
                ref={reactFlowInstance}
              >
                <Background color="#252538" gap={20} size={1} />
                <Controls style={{ backgroundColor: "#161626", fill: "#fff", borderColor: "#252538" }} />
                <MiniMap style={{ backgroundColor: "#161626" }} nodeColor={(n) => nodeColors[n.data?.type]?.bg || "#128C7E"} />
              </ReactFlow>
            </ReactFlowProvider>
          </NodesContext.Provider>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          3. DRAWER DE CONFIGURAÇÃO DO NÓ ("Configurar Node")
      ───────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        classes={{ paper: classes.drawerPaper }}
      >
        {selectedNode && (
          <div>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" style={{ fontWeight: 700, color: "#fff" }}>
                Configurar Node
              </Typography>
              <IconButton size="small" onClick={() => setSelectedNode(null)} style={{ color: "#fff" }}>
                <Close />
              </IconButton>
            </Box>

            <div
              style={{
                backgroundColor: "#1e1e32",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255, 215, 0, 0.3)",
                marginBottom: 14,
              }}
            >
              <TextField
                label="ID / Tag de Identificação do Nó"
                fullWidth
                variant="outlined"
                size="small"
                value={selectedNode.data.nodeIdTag || ""}
                onChange={(e) => updateNodeData("nodeIdTag", e.target.value)}
                placeholder="Ex: 1, 2, MENU_VENDAS, ATENDIMENTO"
                helperText="Identificação visual única exibida no canvas e nas opções de destino."
                className={classes.drawerField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 14 }}>#</span>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <Divider className={classes.drawerDivider} />

            {/* GATILHO */}
            {selectedNode.data.type === "trigger" && (
              <div className={classes.drawerField}>
                <TextField
                  label="Palavra-chave Gatilho"
                  fullWidth
                  variant="outlined"
                  value={selectedNode.data.keyword || ""}
                  onChange={(e) => updateNodeData("keyword", e.target.value)}
                  helperText="Digite a palavra-chave para disparar este fluxo. Use '*' para acionar em qualquer mensagem inicial."
                />
              </div>
            )}

            {/* MENSAGEM DE TEXTO */}
            {selectedNode.data.type === "message" && (
              <div className={classes.drawerField}>
                <TextField
                  label="Texto da mensagem"
                  multiline
                  rows={5}
                  fullWidth
                  variant="outlined"
                  value={selectedNode.data.content || ""}
                  onChange={(e) => updateNodeData("content", e.target.value)}
                  helperText="Você pode usar as variáveis: {nome}"
                />
              </div>
            )}

            {/* MENU NUMÉRICO */}
            {selectedNode.data.type === "menu" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Texto de Apresentação do Menu"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.content || ""}
                    onChange={(e) => updateNodeData("content", e.target.value)}
                    helperText="Ex: Escolha uma das opções abaixo digitando o número:"
                  />
                </div>
                <Typography variant="subtitle2" style={{ color: "#fff", marginBottom: 8 }}>
                  Opções Numéricas do Menu:
                </Typography>
                {(selectedNode.data.options || []).map((opt, idx) => (
                  <Paper key={opt.id || idx} style={{ padding: 10, marginBottom: 10, backgroundColor: "#1e1e32" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <TextField
                        size="small"
                        label="Número"
                        style={{ width: 80 }}
                        variant="outlined"
                        value={opt.optionNumber || `${idx + 1}`}
                        onChange={(e) => {
                          const newOpts = [...(selectedNode.data.options || [])];
                          newOpts[idx].optionNumber = e.target.value;
                          updateNodeData("options", newOpts);
                        }}
                        className={classes.drawerField}
                      />
                      <TextField
                        size="small"
                        label="Texto da Opção"
                        fullWidth
                        variant="outlined"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...(selectedNode.data.options || [])];
                          newOpts[idx].text = e.target.value;
                          updateNodeData("options", newOpts);
                        }}
                        className={classes.drawerField}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newOpts = selectedNode.data.options.filter((_, i) => i !== idx);
                          updateNodeData("options", newOpts);
                        }}
                        style={{ color: "#ff5252" }}
                      >
                        <Delete />
                      </IconButton>
                    </div>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel style={{ color: "#aaa" }}>Ir para (Nó de Destino)</InputLabel>
                      <Select
                        value={opt.targetNodeId || ""}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          const newOpts = [...(selectedNode.data.options || [])];
                          newOpts[idx].targetNodeId = targetId;
                          updateNodeData("options", newOpts);
                          if (targetId) syncOptionEdge(selectedNode.id, targetId);
                        }}
                        label="Ir para (Nó de Destino)"
                        style={{ color: "#fff" }}
                      >
                        <MenuItem value="">
                          <em>Nenhum (Finalizar nesta opção)</em>
                        </MenuItem>
                        {renderTargetNodeOptions(nodes, selectedNode.id)}
                      </Select>
                    </FormControl>
                  </Paper>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  style={{ color: "#128C7E", borderColor: "#128C7E" }}
                  startIcon={<Add />}
                  onClick={() => {
                    const newOpts = [
                      ...(selectedNode.data.options || []),
                      { id: `opt_${Date.now()}`, optionNumber: `${(selectedNode.data.options || []).length + 1}`, text: `Opção ${(selectedNode.data.options || []).length + 1}` },
                    ];
                    updateNodeData("options", newOpts);
                  }}
                >
                  Adicionar Opção no Menu
                </Button>
              </div>
            )}

            {/* CONDIÇÃO (IF/ELSE) */}
            {selectedNode.data.type === "condition" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Palavra-chave a verificar (If/Else)"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.conditionKeyword || ""}
                    onChange={(e) => updateNodeData("conditionKeyword", e.target.value)}
                    helperText="Se a mensagem do cliente contiver esta palavra, seguirá o caminho VERDADEIRO (True); caso contrário, o FALSO (False)."
                  />
                </div>
                <div className={classes.drawerField} style={{ marginTop: 12 }}>
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel style={{ color: "#4caf50" }}>Caminho VERDADEIRO (Se contiver)</InputLabel>
                    <Select
                      value={selectedNode.data.targetNodeIdTrue || ""}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        updateNodeData("targetNodeIdTrue", targetId);
                        if (targetId) syncOptionEdge(selectedNode.id, targetId);
                      }}
                      label="Caminho VERDADEIRO (Se contiver)"
                      style={{ color: "#4caf50" }}
                    >
                      <MenuItem value="">
                        <em>Nenhum (Finalizar)</em>
                      </MenuItem>
                      {renderTargetNodeOptions(nodes, selectedNode.id)}
                    </Select>
                  </FormControl>
                </div>
                <div className={classes.drawerField} style={{ marginTop: 12 }}>
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel style={{ color: "#f44336" }}>Caminho FALSO (Se NÃO contiver)</InputLabel>
                    <Select
                      value={selectedNode.data.targetNodeIdFalse || ""}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        updateNodeData("targetNodeIdFalse", targetId);
                        if (targetId) syncOptionEdge(selectedNode.id, targetId);
                      }}
                      label="Caminho FALSO (Se NÃO contiver)"
                      style={{ color: "#f44336" }}
                    >
                      <MenuItem value="">
                        <em>Nenhum (Finalizar)</em>
                      </MenuItem>
                      {renderTargetNodeOptions(nodes, selectedNode.id)}
                    </Select>
                  </FormControl>
                </div>
              </div>
            )}

            {/* SORTEIO (A/B) */}
            {selectedNode.data.type === "randomizer" && (
              <div style={{ color: "#aaa", fontSize: 13, marginBottom: 12 }}>
                <Typography variant="body2" style={{ color: "#aaa" }}>
                  🎲 Este nó sorteia aleatoriamente a execução entre os caminhos de saída conectados a ele. Conecte duas ou mais linhas para realizar um teste A/B de ofertas.
                </Typography>
              </div>
            )}

            {/* CARROSSEL DE CARDS */}
            {selectedNode.data.type === "carousel" && (
              <div>
                <Typography variant="subtitle2" style={{ color: "#fff", marginBottom: 8 }}>
                  Cards do Carrossel:
                </Typography>
                {(selectedNode.data.cards || []).map((card, idx) => (
                  <Paper key={idx} style={{ padding: 10, marginBottom: 10, backgroundColor: "#1e1e32" }}>
                    <div className={classes.drawerField}>
                      <TextField
                        size="small"
                        label="Título do Card"
                        fullWidth
                        variant="outlined"
                        value={card.title}
                        onChange={(e) => {
                          const newCards = [...(selectedNode.data.cards || [])];
                          newCards[idx].title = e.target.value;
                          updateNodeData("cards", newCards);
                        }}
                      />
                    </div>
                    <div className={classes.drawerField}>
                      <TextField
                        size="small"
                        label="Descrição"
                        multiline
                        rows={2}
                        fullWidth
                        variant="outlined"
                        value={card.description}
                        onChange={(e) => {
                          const newCards = [...(selectedNode.data.cards || [])];
                          newCards[idx].description = e.target.value;
                          updateNodeData("cards", newCards);
                        }}
                      />
                    </div>
                    <div className={classes.drawerField}>
                      <TextField
                        size="small"
                        label="Texto do Botão"
                        fullWidth
                        variant="outlined"
                        value={card.buttonText || ""}
                        onChange={(e) => {
                          const newCards = [...(selectedNode.data.cards || [])];
                          newCards[idx].buttonText = e.target.value;
                          updateNodeData("cards", newCards);
                        }}
                      />
                    </div>
                    <Button
                      size="small"
                      style={{ color: "#ff5252" }}
                      onClick={() => {
                        const newCards = selectedNode.data.cards.filter((_, i) => i !== idx);
                        updateNodeData("cards", newCards);
                      }}
                    >
                      Excluir Card
                    </Button>
                  </Paper>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  style={{ color: "#128C7E", borderColor: "#128C7E" }}
                  startIcon={<Add />}
                  onClick={() => {
                    const newCards = [
                      ...(selectedNode.data.cards || []),
                      { title: `Card ${(selectedNode.data.cards || []).length + 1}`, description: "Descrição...", buttonText: "Saiba mais" },
                    ];
                    updateNodeData("cards", newCards);
                  }}
                >
                  Adicionar Card
                </Button>
              </div>
            )}

            {/* BOTÕES INTERATIVOS */}
            {selectedNode.data.type === "buttons" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Título da Mensagem"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.title || ""}
                    onChange={(e) => updateNodeData("title", e.target.value)}
                  />
                </div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Texto Principal"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.content || ""}
                    onChange={(e) => updateNodeData("content", e.target.value)}
                  />
                </div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Rodapé (Footer)"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.footer || ""}
                    onChange={(e) => updateNodeData("footer", e.target.value)}
                  />
                </div>
                <Typography variant="subtitle2" style={{ color: "#fff", marginBottom: 8 }}>
                  Botões de Clique:
                </Typography>
                {(selectedNode.data.buttons || []).map((btn, idx) => (
                  <Paper key={btn.id || idx} style={{ padding: 8, marginBottom: 8, backgroundColor: "#1e1e32" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <TextField
                        size="small"
                        fullWidth
                        variant="outlined"
                        value={btn.text}
                        onChange={(e) => {
                          const newBtns = [...(selectedNode.data.buttons || [])];
                          newBtns[idx].text = e.target.value;
                          updateNodeData("buttons", newBtns);
                        }}
                        className={classes.drawerField}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newBtns = selectedNode.data.buttons.filter((_, i) => i !== idx);
                          updateNodeData("buttons", newBtns);
                        }}
                        style={{ color: "#ff5252" }}
                      >
                        <Delete />
                      </IconButton>
                    </div>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel style={{ color: "#aaa" }}>Ir para (Nó de Destino)</InputLabel>
                      <Select
                        value={btn.targetNodeId || ""}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          const newBtns = [...(selectedNode.data.buttons || [])];
                          newBtns[idx].targetNodeId = targetId;
                          updateNodeData("buttons", newBtns);
                          if (targetId) syncOptionEdge(selectedNode.id, targetId);
                        }}
                        label="Ir para (Nó de Destino)"
                        style={{ color: "#fff" }}
                      >
                        <MenuItem value="">
                          <em>Nenhum (Parar neste botão)</em>
                        </MenuItem>
                        {renderTargetNodeOptions(nodes, selectedNode.id)}
                      </Select>
                    </FormControl>
                  </Paper>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  style={{ color: "#128C7E", borderColor: "#128C7E" }}
                  startIcon={<Add />}
                  onClick={() => {
                    const newBtns = [
                      ...(selectedNode.data.buttons || []),
                      { id: `btn_${Date.now()}`, text: `Botão ${(selectedNode.data.buttons || []).length + 1}` },
                    ];
                    updateNodeData("buttons", newBtns);
                  }}
                >
                  Adicionar Botão
                </Button>
              </div>
            )}

            {/* LISTA INTERATIVA */}
            {selectedNode.data.type === "list_menu" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Título do Menu"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.title || ""}
                    onChange={(e) => updateNodeData("title", e.target.value)}
                  />
                </div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Texto de Apresentação"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.content || ""}
                    onChange={(e) => updateNodeData("content", e.target.value)}
                  />
                </div>
                <Typography variant="subtitle2" style={{ color: "#fff", marginBottom: 8 }}>
                  Itens da Lista:
                </Typography>
                {(selectedNode.data.options || []).map((opt, idx) => (
                  <Paper key={opt.id || idx} style={{ padding: 8, marginBottom: 8, backgroundColor: "#1e1e32" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <TextField
                        size="small"
                        label="Título do Item"
                        fullWidth
                        variant="outlined"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...(selectedNode.data.options || [])];
                          newOpts[idx].text = e.target.value;
                          updateNodeData("options", newOpts);
                        }}
                        className={classes.drawerField}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newOpts = selectedNode.data.options.filter((_, i) => i !== idx);
                          updateNodeData("options", newOpts);
                        }}
                        style={{ color: "#ff5252" }}
                      >
                        <Delete />
                      </IconButton>
                    </div>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <InputLabel style={{ color: "#aaa" }}>Ir para (Nó de Destino)</InputLabel>
                      <Select
                        value={opt.targetNodeId || ""}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          const newOpts = [...(selectedNode.data.options || [])];
                          newOpts[idx].targetNodeId = targetId;
                          updateNodeData("options", newOpts);
                          if (targetId) syncOptionEdge(selectedNode.id, targetId);
                        }}
                        label="Ir para (Nó de Destino)"
                        style={{ color: "#fff" }}
                      >
                        <MenuItem value="">
                          <em>Nenhum (Parar neste item)</em>
                        </MenuItem>
                        {renderTargetNodeOptions(nodes, selectedNode.id)}
                      </Select>
                    </FormControl>
                  </Paper>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  style={{ color: "#128C7E", borderColor: "#128C7E" }}
                  startIcon={<Add />}
                  onClick={() => {
                    const newOpts = [
                      ...(selectedNode.data.options || []),
                      { id: `opt_${Date.now()}`, optionNumber: `${(selectedNode.data.options || []).length + 1}`, text: `Item ${(selectedNode.data.options || []).length + 1}` },
                    ];
                    updateNodeData("options", newOpts);
                  }}
                >
                  Adicionar Item na Lista
                </Button>
              </div>
            )}

            {/* SALVAR VARIÁVEL */}
            {selectedNode.data.type === "set_variable" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Nome da Variável"
                    fullWidth
                    variant="outlined"
                    placeholder="Ex: cpf, email, cidade"
                    value={selectedNode.data.variableName || ""}
                    onChange={(e) => updateNodeData("variableName", e.target.value)}
                  />
                </div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Mensagem de Pergunta ao Cliente"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    placeholder="Ex: Por favor, digite o seu CPF:"
                    value={selectedNode.data.variablePrompt || ""}
                    onChange={(e) => updateNodeData("variablePrompt", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* PAUSA ANTI-BAN */}
            {selectedNode.data.type === "anti_ban" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Tempo Mínimo de Espera (segundos)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.minDelaySeconds || 3}
                    onChange={(e) => updateNodeData("minDelaySeconds", Number(e.target.value))}
                  />
                </div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Tempo Máximo de Espera (segundos)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.maxDelaySeconds || 8}
                    onChange={(e) => updateNodeData("maxDelaySeconds", Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* DELAY */}
            {selectedNode.data.type === "delay" && (
              <div className={classes.drawerField}>
                <TextField
                  label="Tempo de Atraso (segundos)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={selectedNode.data.delaySeconds || 1}
                  onChange={(e) => updateNodeData("delaySeconds", Number(e.target.value))}
                />
              </div>
            )}

            {/* WEBHOOK */}
            {selectedNode.data.type === "webhook" && (
              <div className={classes.drawerField}>
                <TextField
                  label="URL do Webhook (HTTP POST)"
                  fullWidth
                  variant="outlined"
                  placeholder="https://sua-api.com/webhook"
                  value={selectedNode.data.webhookUrl || ""}
                  onChange={(e) => updateNodeData("webhookUrl", e.target.value)}
                />
              </div>
            )}

            {/* COBRAR PIX */}
            {selectedNode.data.type === "pix_payment" && (
              <div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Valor da Cobrança (R$)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.pixValue || 1.00}
                    onChange={(e) => updateNodeData("pixValue", e.target.value)}
                  />
                </div>
                <div className={classes.drawerField}>
                  <TextField
                    label="Chave Pix / Código Copia e Cola"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={selectedNode.data.pixCopyPaste || ""}
                    onChange={(e) => updateNodeData("pixCopyPaste", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* MOVER KANBAN */}
            {selectedNode.data.type === "set_kanban" && (
              <div className={classes.drawerField}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Coluna do Kanban (Tag)</InputLabel>
                  <Select
                    value={selectedNode.data.tagId || ""}
                    onChange={(e) => updateNodeData("tagId", e.target.value)}
                    label="Coluna do Kanban (Tag)"
                  >
                    <MenuItem value=""><em>Nenhuma</em></MenuItem>
                    {tags.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            {/* TRANSFERIR FILA */}
            {selectedNode.data.type === "transfer_queue" && (
              <div className={classes.drawerField}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Fila de Destino</InputLabel>
                  <Select
                    value={selectedNode.data.queueId || ""}
                    onChange={(e) => updateNodeData("queueId", e.target.value)}
                    label="Fila de Destino"
                  >
                    <MenuItem value=""><em>Nenhuma</em></MenuItem>
                    {queues.map((q) => (
                      <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            <Divider className={classes.drawerDivider} />

            <Button
              fullWidth
              variant="outlined"
              style={{ color: "#ff5252", borderColor: "#ff5252" }}
              startIcon={<Delete />}
              onClick={handleDeleteSelectedNode}
            >
              Excluir Nó
            </Button>
          </div>
        )}
      </Drawer>

      {/* MODAL DE TESTE */}
      <TestFlowModal
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        flowId={flowId}
      />
    </div>
  );
};

export default FlowBuilderInner;
