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
  AccountTree,
  ViewColumn,
  MonetizationOn,
  CallSplit,
  Http,
  HourglassEmpty,
  Shuffle,
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
//  ESTILOS GERAIS
// ─────────────────────────────────────────────
const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f0f2f5",
  },
  toolbar: {
    padding: "10px 20px",
    backgroundColor: "#1a1a2e",
    borderBottom: "1px solid #16213e",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  toolbarCenter: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  flowNameInput: {
    "& input": {
      color: "#ffffff",
      fontSize: "1.1rem",
      fontWeight: 600,
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: "rgba(255,255,255,0.3)",
    },
    "& .MuiInput-underline:hover:before": {
      borderBottomColor: "rgba(255,255,255,0.6)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#25D366",
    },
  },
  paletteBtn: {
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: "0.78rem",
    fontWeight: 600,
    textTransform: "none",
    display: "flex",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.12)",
    },
  },
  paletteBtnMsg: { borderColor: "#1976d2", color: "#64b5f6" },
  paletteBtnMenu: { borderColor: "#7b1fa2", color: "#ce93d8" },
  paletteBtnTransfer: { borderColor: "#ed6c02", color: "#ffb74d" },
  paletteBtnClose: { borderColor: "#d32f2f", color: "#ef9a9a" },
  paletteBtnKanban: { borderColor: "#2e7d32", color: "#81c784" },
  paletteBtnPix: { borderColor: "#f57c00", color: "#ffb74d" },
  paletteBtnCondition: { borderColor: "#00acc1", color: "#80deea" },
  paletteBtnWebhook: { borderColor: "#5c6bc0", color: "#9fa8da" },
  paletteBtnDelay: { borderColor: "#ffb300", color: "#ffd54f" },
  paletteBtnRandom: { borderColor: "#ec407a", color: "#f48fb1" },

  saveBtn: {
    background: "linear-gradient(135deg, #128C7E 0%, #075E54 100%)",
    color: "#fff",
    fontWeight: 700,
    padding: "7px 18px",
    borderRadius: 8,
    textTransform: "none",
    boxShadow: "0 4px 12px rgba(18,140,126,0.4)",
    "&:hover": {
      background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    },
  },
  canvas: {
    flex: 1,
  },
  // Painel lateral de edição
  drawerPaper: {
    width: 340,
    padding: 20,
    top: "64px",
    height: "calc(100% - 64px)",
    backgroundColor: "#1e1e2e",
    color: "#e0e0e0",
    borderLeft: "1px solid #2a2a3e",
  },
  drawerField: {
    "& .MuiOutlinedInput-root": {
      color: "#e0e0e0",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
      "&.Mui-focused fieldset": { borderColor: "#25D366" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#25D366" },
    "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.4)" },
    "& .MuiSelect-root": { color: "#e0e0e0" },
    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
  },
  drawerDivider: {
    backgroundColor: "rgba(255,255,255,0.1)",
    margin: "16px 0",
  },
}));

// ─────────────────────────────────────────────
//  ESTILOS DOS NÓS (inline, para o ReactFlow)
// ─────────────────────────────────────────────
const nodeBaseStyle = {
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  minWidth: 220,
  fontSize: 13,
  fontFamily: "'Roboto', sans-serif",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 14px",
  borderRadius: "10px 10px 0 0",
  fontWeight: 700,
  fontSize: 13,
  color: "#fff",
};

const bodyStyle = {
  padding: "10px 14px 12px",
  backgroundColor: "#ffffff",
  borderRadius: "0 0 10px 10px",
  color: "#333",
  fontSize: 12,
};

// Cores por tipo
const nodeColors = {
  trigger: { header: "linear-gradient(135deg, #128C7E, #075E54)", border: "#128C7E" },
  message: { header: "linear-gradient(135deg, #1565c0, #0d47a1)", border: "#1976d2" },
  menu: { header: "linear-gradient(135deg, #6a1b9a, #4a148c)", border: "#7b1fa2" },
  transfer_queue: { header: "linear-gradient(135deg, #e65100, #bf360c)", border: "#ed6c02" },
  close_ticket: { header: "linear-gradient(135deg, #b71c1c, #7f0000)", border: "#d32f2f" },
  set_kanban: { header: "linear-gradient(135deg, #1b5e20, #2e7d32)", border: "#4caf50" },
  pix_payment: { header: "linear-gradient(135deg, #e65100, #f57c00)", border: "#ff9800" },
  condition: { header: "linear-gradient(135deg, #00838f, #006064)", border: "#00acc1" },
  webhook: { header: "linear-gradient(135deg, #4527a0, #283593)", border: "#5c6bc0" },
  delay: { header: "linear-gradient(135deg, #ff8f00, #ffb300)", border: "#ffca28" },
  randomizer: { header: "linear-gradient(135deg, #c2185b, #d81b60)", border: "#ec407a" },
};

const NodeIcons = {
  trigger: <PlayArrow style={{ fontSize: 16 }} />,
  message: <Chat style={{ fontSize: 16 }} />,
  menu: <ListAlt style={{ fontSize: 16 }} />,
  transfer_queue: <TransferWithinAStation style={{ fontSize: 16 }} />,
  close_ticket: <CheckCircle style={{ fontSize: 16 }} />,
  set_kanban: <ViewColumn style={{ fontSize: 16 }} />,
  pix_payment: <MonetizationOn style={{ fontSize: 16 }} />,
  condition: <CallSplit style={{ fontSize: 16 }} />,
  webhook: <Http style={{ fontSize: 16 }} />,
  delay: <HourglassEmpty style={{ fontSize: 16 }} />,
  randomizer: <Shuffle style={{ fontSize: 16 }} />,
};

const NodeLabels = {
  trigger: "Gatilho",
  message: "Mensagem",
  menu: "Menu de Opções",
  transfer_queue: "Transferir Fila",
  close_ticket: "Encerrar",
  set_kanban: "Mover Kanban",
  pix_payment: "Cobrar Pix",
  condition: "Condição (If/Else)",
  webhook: "Webhook (HTTP)",
  delay: "Atraso (Delay)",
  randomizer: "Sorteio (A/B)",
};

// ─────────────────────────────────────────────
//  COMPONENTE DE NÓ CUSTOMIZADO
// ─────────────────────────────────────────────
const CustomNode = ({ data, selected }) => {
  const color = nodeColors[data.type] || nodeColors.message;
  const isFirst = data.type === "trigger";

  return (
    <div
      style={{
        ...nodeBaseStyle,
        border: `2px solid ${selected ? "#FFD700" : color.border}`,
        transform: selected ? "scale(1.02)" : "scale(1)",
        transition: "all 0.15s ease",
      }}
    >
      {/* Handle de entrada (não mostra no trigger) */}
      {!isFirst && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: color.border,
            width: 12,
            height: 12,
            border: "2px solid white",
            top: -6,
          }}
        />
      )}

      {/* Cabeçalho */}
      <div style={{ ...headerStyle, background: color.header }}>
        {NodeIcons[data.type]}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.label || NodeLabels[data.type]}
        </span>
      </div>

      {/* Corpo do nó */}
      <div style={bodyStyle}>
        {data.type === "trigger" && (
          <div>
            <span style={{ color: "#888", fontSize: 11 }}>Palavra-chave:</span>
            <div style={{ fontWeight: 600, marginTop: 2, color: "#075E54" }}>
              {data.keyword || "*"}
            </div>
          </div>
        )}
        {data.type === "message" && (
          <div
            style={{
              maxHeight: 60,
              overflow: "hidden",
              color: "#555",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {data.content || "Clique para editar..."}
          </div>
        )}
        {data.type === "menu" && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {data.content || "Título do menu"}
            </div>
            {(data.options || []).slice(0, 3).map((opt) => (
              <div key={opt.id} style={{ fontSize: 11, color: "#666", marginLeft: 4 }}>
                {opt.optionNumber}. {opt.text}
              </div>
            ))}
            {(data.options || []).length > 3 && (
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
                + {data.options.length - 3} opção(ões)
              </div>
            )}
          </div>
        )}
        {data.type === "transfer_queue" && (
          <div style={{ color: "#e65100", fontWeight: 600 }}>
            {data.queueName || "Selecionar fila..."}
          </div>
        )}
        {data.type === "set_kanban" && (
          <div style={{ color: "#2e7d32", fontWeight: 600 }}>
            {data.tagName ? `📌 Kanban: ${data.tagName}` : "Selecionar coluna do Kanban..."}
          </div>
        )}
        {data.type === "pix_payment" && (
          <div style={{ color: "#e65100", fontWeight: 600 }}>
            {data.pixValue ? `💳 Pix: R$ ${Number(data.pixValue).toFixed(2)}` : "Configurar cobrança Pix..."}
          </div>
        )}
        {data.type === "condition" && (
          <div style={{ color: "#00838f", fontWeight: 600 }}>
            {data.conditionKeyword ? `🔀 Se contiver: "${data.conditionKeyword}"` : "Configurar condição..."}
          </div>
        )}
        {data.type === "webhook" && (
          <div style={{ color: "#4527a0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.webhookUrl ? `🌐 POST: ${data.webhookUrl}` : "Configurar URL do Webhook..."}
          </div>
        )}
        {data.type === "delay" && (
          <div style={{ color: "#ff8f00", fontWeight: 600 }}>
            {data.delaySeconds ? `⏳ Aguardar: ${data.delaySeconds} seg` : "Configurar atraso..."}
          </div>
        )}
        {data.type === "randomizer" && (
          <div style={{ color: "#c2185b", fontWeight: 600 }}>
            🎲 Sorteia um dos caminhos
          </div>
        )}
        {data.type === "close_ticket" && (
          <div style={{ color: "#b71c1c", textAlign: "center", padding: "4px 0" }}>
            ✅ Encerra o ticket automaticamente
          </div>
        )}
      </div>

      {/* Handle de saída */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color.border,
          width: 12,
          height: 12,
          border: "2px solid white",
          bottom: -6,
        }}
      />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

// ─────────────────────────────────────────────
//  FUNÇÕES DE CONVERSÃO (dados DB ↔ ReactFlow)
// ─────────────────────────────────────────────
const dbNodesToRF = (dbNodes) => {
  return dbNodes.map((n, idx) => ({
    id: n.id,
    type: "custom",
    position: n.position || { x: 100 + (idx % 3) * 280, y: 100 + Math.floor(idx / 3) * 220 },
    data: { ...n },
  }));
};

const dbConnectionsToRF = (connections, dbNodes) => {
  if (connections && connections.length > 0) {
    return connections.map((c, idx) => ({
      id: `e_${idx}`,
      source: c.sourceNodeId,
      target: c.targetNodeId,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#128C7E" },
      style: { stroke: "#128C7E", strokeWidth: 2 },
      animated: true,
    }));
  }
  // Inferir conexões sequenciais pelos targetNodeId
  const edges = [];
  dbNodes.forEach((n) => {
    if (n.targetNodeId) {
      edges.push({
        id: `e_${n.id}_${n.targetNodeId}`,
        source: n.id,
        target: n.targetNodeId,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#128C7E" },
        style: { stroke: "#128C7E", strokeWidth: 2 },
        animated: true,
      });
    }
  });
  return edges;
};

const rfNodesToDb = (rfNodes) =>
  rfNodes.map((n) => ({ ...n.data, position: n.position }));

const rfEdgesToConnections = (rfEdges) =>
  rfEdges.map((e) => ({ sourceNodeId: e.source, targetNodeId: e.target }));

// ─────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const FlowBuilderCanvas = () => {
  const classes = useStyles();
  const history = useHistory();
  const { flowId } = useParams();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [flow, setFlow] = useState(null);
  const [queues, setQueues] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Carrega dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: flowData } = await api.get(`/flows/${flowId}`);
        setFlow(flowData);

        let dbNodes = [];
        let dbConnections = [];

        if (flowData.nodes) {
          dbNodes = typeof flowData.nodes === "string"
            ? JSON.parse(flowData.nodes)
            : flowData.nodes;
        }
        if (flowData.connections) {
          dbConnections = typeof flowData.connections === "string"
            ? JSON.parse(flowData.connections)
            : flowData.connections;
        }

        setNodes(dbNodesToRF(dbNodes));
        setEdges(dbConnectionsToRF(dbConnections, dbNodes));

        const { data: queueData } = await api.get("/queue");
        setQueues(queueData);

        try {
          const { data: tagData } = await api.get("/tags/list");
          setTags(Array.isArray(tagData) ? tagData : tagData?.tags || []);
        } catch (e) {
          console.error("Erro ao carregar tags do Kanban", e);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do fluxo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [flowId]);

  // ── Conectar nós
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#128C7E" },
            style: { stroke: "#128C7E", strokeWidth: 2 },
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  // ── Clique num nó → abrir painel de edição
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  }, []);

  // ── Fechar painel
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedNode(null);
  };

  // ── Atualizar campo de dado no nó selecionado
  const updateSelectedNodeData = (field, value) => {
    if (!selectedNode) return;
    setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, [field]: value } } : n
      )
    );
  };

  // ── Adicionar novo nó na tela
  const handleAddNode = (type) => {
    const id = `node_${Date.now()}`;
    const center = reactFlowInstance
      ? reactFlowInstance.project({
          x: (reactFlowWrapper.current?.offsetWidth || 600) / 2 - 110,
          y: (reactFlowWrapper.current?.offsetHeight || 400) / 2 - 80,
        })
      : { x: 200, y: 200 };

    const defaultData = {
      id,
      type,
      label: NodeLabels[type],
    };

    if (type === "message") {
      defaultData.content = "Digite aqui a mensagem...";
    } else if (type === "menu") {
      defaultData.content = "Escolha uma opção:";
      defaultData.options = [
        { id: "opt_1", optionNumber: "1", text: "Suporte" },
        { id: "opt_2", optionNumber: "2", text: "Vendas" },
      ];
    }

    const newNode = {
      id,
      type: "custom",
      position: center,
      data: defaultData,
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setDrawerOpen(true);
    toast.success(`Nó "${NodeLabels[type]}" adicionado!`);
  };

  // ── Deletar nó selecionado
  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    if (selectedNode.data.type === "trigger") {
      toast.error("O nó de gatilho não pode ser deletado.");
      return;
    }
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    closeDrawer();
    toast.success("Nó removido.");
  };

  // ── Salvar fluxo
  const handleSaveFlow = async () => {
    setSaving(true);
    try {
      const dbNodes = rfNodesToDb(nodes);
      const connections = rfEdgesToConnections(edges);
      await api.put(`/flows/${flowId}`, {
        name: flow.name,
        nodes: JSON.stringify(dbNodes),
        connections: JSON.stringify(connections),
      });
      toast.success("Fluxo salvo com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar o fluxo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className={classes.root} display="flex" justifyContent="center" alignItems="center">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      {/* ── TOOLBAR ── */}
      <div className={classes.toolbar}>
        <div className={classes.toolbarLeft}>
          <Tooltip title="Voltar à lista de fluxos">
            <IconButton size="small" style={{ color: "#fff" }} onClick={() => history.push("/flowbuilder")}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <AccountTree style={{ color: "#25D366", fontSize: 22, marginRight: 4 }} />
          <TextField
            value={flow?.name || ""}
            onChange={(e) => setFlow({ ...flow, name: e.target.value })}
            variant="standard"
            className={classes.flowNameInput}
            InputProps={{ disableUnderline: false }}
            style={{ minWidth: 200 }}
          />
        </div>

        {/* Paleta de nós */}
        <div className={classes.toolbarCenter}>
          {[
            { type: "message", icon: <Chat style={{ fontSize: 15 }} />, cls: classes.paletteBtnMsg, label: "+ Mensagem" },
            { type: "menu", icon: <ListAlt style={{ fontSize: 15 }} />, cls: classes.paletteBtnMenu, label: "+ Menu" },
            { type: "condition", icon: <CallSplit style={{ fontSize: 15 }} />, cls: classes.paletteBtnCondition, label: "+ Condição" },
            { type: "randomizer", icon: <Shuffle style={{ fontSize: 15 }} />, cls: classes.paletteBtnRandom, label: "+ Sorteio" },
            { type: "delay", icon: <HourglassEmpty style={{ fontSize: 15 }} />, cls: classes.paletteBtnDelay, label: "+ Atraso" },
            { type: "webhook", icon: <Http style={{ fontSize: 15 }} />, cls: classes.paletteBtnWebhook, label: "+ Webhook" },
            { type: "set_kanban", icon: <ViewColumn style={{ fontSize: 15 }} />, cls: classes.paletteBtnKanban, label: "+ Kanban" },
            { type: "pix_payment", icon: <MonetizationOn style={{ fontSize: 15 }} />, cls: classes.paletteBtnPix, label: "+ Cobrar Pix" },
            { type: "transfer_queue", icon: <TransferWithinAStation style={{ fontSize: 15 }} />, cls: classes.paletteBtnTransfer, label: "+ Transferir" },
            { type: "close_ticket", icon: <CheckCircle style={{ fontSize: 15 }} />, cls: classes.paletteBtnClose, label: "+ Encerrar" },
          ].map(({ type, icon, cls, label }) => (
            <button
              key={type}
              className={`${classes.paletteBtn} ${cls}`}
              onClick={() => handleAddNode(type)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className={classes.toolbarRight}>
          <Button
            className={classes.saveBtn}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
            onClick={handleSaveFlow}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar Fluxo"}
          </Button>
        </div>
      </div>

      {/* ── CANVAS REACTFLOW ── */}
      <div className={classes.canvas} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode="Delete"
          minZoom={0.3}
          maxZoom={2}
          style={{ background: "#0f0f1a" }}
        >
          <MiniMap
            style={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a3e" }}
            nodeColor={(n) => nodeColors[n.data?.type]?.border || "#888"}
            maskColor="rgba(0,0,0,0.5)"
          />
          <Controls style={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a3e" }} />
          <Background color="#2a2a3e" gap={20} size={1} />
        </ReactFlow>
      </div>

      {/* ── PAINEL LATERAL DE EDIÇÃO ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        variant="persistent"
        classes={{ paper: classes.drawerPaper }}
      >
        {selectedNode && (
          <Box>
            {/* Cabeçalho do painel */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <div style={{ color: nodeColors[selectedNode.data.type]?.border }}>
                  {NodeIcons[selectedNode.data.type]}
                </div>
                <Typography variant="subtitle1" style={{ color: "#fff", fontWeight: 700 }}>
                  {NodeLabels[selectedNode.data.type]}
                </Typography>
              </Box>
              <IconButton size="small" style={{ color: "#aaa" }} onClick={closeDrawer}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            <Divider className={classes.drawerDivider} />

            {/* Rótulo do nó */}
            <TextField
              label="Rótulo (título do nó)"
              variant="outlined"
              size="small"
              fullWidth
              className={classes.drawerField}
              style={{ marginBottom: 16 }}
              value={selectedNode.data.label || ""}
              onChange={(e) => updateSelectedNodeData("label", e.target.value)}
            />

            {/* Campos específicos por tipo */}
            {selectedNode.data.type === "trigger" && (
              <TextField
                label="Palavra-chave Gatilho"
                variant="outlined"
                size="small"
                fullWidth
                className={classes.drawerField}
                value={selectedNode.data.keyword || ""}
                onChange={(e) => updateSelectedNodeData("keyword", e.target.value)}
                helperText="Use * para acionar em qualquer mensagem inicial"
              />
            )}

            {selectedNode.data.type === "message" && (
              <TextField
                label="Conteúdo da Mensagem"
                variant="outlined"
                size="small"
                multiline
                rows={5}
                fullWidth
                className={classes.drawerField}
                value={selectedNode.data.content || ""}
                onChange={(e) => updateSelectedNodeData("content", e.target.value)}
                helperText="Suporta variáveis como {nome}, {protocolo}"
              />
            )}

            {selectedNode.data.type === "menu" && (
              <Box>
                <TextField
                  label="Título do Menu"
                  variant="outlined"
                  size="small"
                  fullWidth
                  className={classes.drawerField}
                  style={{ marginBottom: 12 }}
                  value={selectedNode.data.content || ""}
                  onChange={(e) => updateSelectedNodeData("content", e.target.value)}
                />
                <Typography variant="caption" style={{ color: "#aaa", fontWeight: 600, marginBottom: 8, display: "block" }}>
                  Opções do Menu
                </Typography>
                {(selectedNode.data.options || []).map((opt, idx) => (
                  <Box key={opt.id} display="flex" gap={1} mb={1} alignItems="center">
                    <TextField
                      variant="outlined"
                      size="small"
                      className={classes.drawerField}
                      style={{ width: 52 }}
                      value={opt.optionNumber}
                      disabled
                    />
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.drawerField}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...selectedNode.data.options];
                        newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                        updateSelectedNodeData("options", newOpts);
                      }}
                    />
                    <IconButton
                      size="small"
                      style={{ color: "#ef9a9a" }}
                      onClick={() => {
                        const newOpts = selectedNode.data.options.filter((_, i) => i !== idx);
                        updateSelectedNodeData("options", newOpts);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  size="small"
                  startIcon={<Add />}
                  style={{ color: "#ce93d8", marginTop: 4, textTransform: "none" }}
                  onClick={() => {
                    const opts = selectedNode.data.options || [];
                    const newOpt = {
                      id: `opt_${Date.now()}`,
                      optionNumber: String(opts.length + 1),
                      text: "Nova opção",
                    };
                    updateSelectedNodeData("options", [...opts, newOpt]);
                  }}
                >
                  Adicionar Opção
                </Button>
              </Box>
            )}

            {selectedNode.data.type === "transfer_queue" && (
              <FormControl variant="outlined" size="small" fullWidth className={classes.drawerField}>
                <InputLabel>Selecione a Fila</InputLabel>
                <Select
                  label="Selecione a Fila"
                  value={selectedNode.data.queueId || ""}
                  onChange={(e) => {
                    const queue = queues.find((q) => q.id === e.target.value);
                    updateSelectedNodeData("queueId", e.target.value);
                    updateSelectedNodeData("queueName", queue?.name || "");
                  }}
                  MenuProps={{ PaperProps: { style: { backgroundColor: "#1e1e2e", color: "#e0e0e0" } } }}
                >
                  {queues.map((q) => (
                    <MenuItem key={q.id} value={q.id} style={{ color: "#e0e0e0" }}>
                      {q.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedNode.data.type === "set_kanban" && (
              <FormControl variant="outlined" size="small" fullWidth className={classes.drawerField}>
                <InputLabel>Selecione a Coluna do Kanban (Tag)</InputLabel>
                <Select
                  label="Selecione a Coluna do Kanban (Tag)"
                  value={selectedNode.data.tagId || ""}
                  onChange={(e) => {
                    const tag = tags.find((t) => t.id === e.target.value);
                    updateSelectedNodeData("tagId", e.target.value);
                    updateSelectedNodeData("tagName", tag?.name || "");
                  }}
                  MenuProps={{ PaperProps: { style: { backgroundColor: "#1e1e2e", color: "#e0e0e0" } } }}
                >
                  {tags.map((t) => (
                    <MenuItem key={t.id} value={t.id} style={{ color: "#e0e0e0" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: t.color || "#888", display: "inline-block", marginRight: 8 }} />
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedNode.data.type === "pix_payment" && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Valor do Pix (R$)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  type="number"
                  className={classes.drawerField}
                  value={selectedNode.data.pixValue || ""}
                  onChange={(e) => updateSelectedNodeData("pixValue", e.target.value)}
                  helperText="Exemplo: 50.00"
                />
                <TextField
                  label="Chave / Copia e Cola Pix"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  fullWidth
                  className={classes.drawerField}
                  value={selectedNode.data.pixCopyPaste || ""}
                  onChange={(e) => updateSelectedNodeData("pixCopyPaste", e.target.value)}
                  helperText="Cole o código Pix Copia e Cola completo"
                />
              </Box>
            )}
            {selectedNode.data.type === "condition" && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Palavra / Termo para Match (Se contiver)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  className={classes.drawerField}
                  value={selectedNode.data.conditionKeyword || ""}
                  onChange={(e) => updateSelectedNodeData("conditionKeyword", e.target.value)}
                  helperText="Se a mensagem do cliente contiver este termo, o fluxo avança pelo caminho Verdadeiro."
                />
              </Box>
            )}

            {selectedNode.data.type === "webhook" && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="URL do Webhook (HTTP POST)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  className={classes.drawerField}
                  value={selectedNode.data.webhookUrl || ""}
                  onChange={(e) => updateSelectedNodeData("webhookUrl", e.target.value)}
                  helperText="Dispara dados do cliente e ticket via JSON POST para n8n, Make ou sistema próprio."
                />
              </Box>
            )}

            {selectedNode.data.type === "delay" && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Tempo de Atraso (em segundos)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  type="number"
                  className={classes.drawerField}
                  value={selectedNode.data.delaySeconds || ""}
                  onChange={(e) => updateSelectedNodeData("delaySeconds", e.target.value)}
                  helperText="Tempo em segundos que o sistema aguardará antes de passar para o próximo nó."
                />
              </Box>
            )}

            {selectedNode.data.type === "randomizer" && (
              <Paper style={{ backgroundColor: "rgba(236,64,122,0.12)", padding: 16, borderRadius: 8, border: "1px solid rgba(236,64,122,0.3)" }}>
                <Typography variant="body2" style={{ color: "#f48fb1", textAlign: "center" }}>
                  🎲 Este nó sorteia aleatoriamente entre as saídas conectadas a ele (Teste A/B ou Rodízio).
                </Typography>
              </Paper>
            )}

            {selectedNode.data.type === "close_ticket" && (
              <Paper style={{ backgroundColor: "rgba(183,28,28,0.12)", padding: 16, borderRadius: 8, border: "1px solid rgba(183,28,28,0.3)" }}>
                <Typography variant="body2" style={{ color: "#ef9a9a", textAlign: "center" }}>
                  Este nó encerra o ticket do cliente automaticamente ao ser atingido no fluxo.
                </Typography>
              </Paper>
            )}

            <Divider className={classes.drawerDivider} />

            {/* Deletar nó */}
            {selectedNode.data.type !== "trigger" && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Delete />}
                style={{ color: "#ef9a9a", borderColor: "rgba(183,28,28,0.5)", textTransform: "none", marginTop: 8 }}
                onClick={handleDeleteSelectedNode}
              >
                Remover este nó
              </Button>
            )}

            <Box mt={2}>
              <Typography variant="caption" style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                ID: {selectedNode.id}
              </Typography>
            </Box>
          </Box>
        )}
      </Drawer>
    </div>
  );
};

// Wrapper com ReactFlowProvider (obrigatório)
const FlowBuilderCanvasWithProvider = () => (
  <ReactFlowProvider>
    <FlowBuilderCanvas />
  </ReactFlowProvider>
);

export default FlowBuilderCanvasWithProvider;
