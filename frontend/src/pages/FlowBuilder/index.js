import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Switch,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Box,
  CircularProgress
} from "@material-ui/core";
import {
  Add,
  Edit,
  Delete,
  AccountTree,
  Search,
  PlayArrow,
  FileCopy
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f4f6f8",
    minHeight: "calc(100vh - 64px)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3)
  },
  card: {
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    border: "1px solid #eef2f6",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
    }
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1)
  },
  flowTitle: {
    fontWeight: 600,
    fontSize: "1.1rem"
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem"
  },
  createBtn: {
    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 20px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #128C7E 0%, #075E54 100%)"
    }
  }
}));

const FlowBuilderList = () => {
  const classes = useStyles();
  const history = useHistory();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/flows");
      setFlows(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar fluxos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) {
      toast.error("Insira o nome do fluxo");
      return;
    }
    try {
      const initialNodes = [
        {
          id: "node_1",
          type: "trigger",
          title: "Início do Fluxo",
          keyword: "olá",
          targetNodeId: "node_2"
        },
        {
          id: "node_2",
          type: "message",
          title: "Mensagem de Boas-Vindas",
          content: "Olá {nome}! Seja bem-vindo ao nosso atendimento."
        }
      ];

      const { data } = await api.post("/flows", {
        name: newFlowName,
        nodes: JSON.stringify(initialNodes),
        connections: JSON.stringify([{ sourceNodeId: "node_1", targetNodeId: "node_2" }]),
        active: true
      });

      toast.success("Fluxo criado com sucesso!");
      setOpenModal(false);
      setNewFlowName("");
      history.push(`/flowbuilder/${data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar fluxo");
    }
  };

  const handleToggleActive = async (flow) => {
    try {
      await api.put(`/flows/${flow.id}`, { active: !flow.active });
      toast.success(`Fluxo ${!flow.active ? "ativado" : "desativado"} com sucesso!`);
      fetchFlows();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao alterar status do fluxo.");
    }
  };

  const handleDeleteFlow = async (id) => {
    if (window.confirm("Deseja realmente excluir este fluxo?")) {
      try {
        await api.delete(`/flows/${id}`);
        toast.success("Fluxo removido com sucesso!");
        fetchFlows();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao deletar fluxo.");
      }
    }
  };

  const filteredFlows = flows.filter((f) =>
    f.name.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <MainContainer className={classes.root}>
      <MainHeader>
        <Title>
          <AccountTree style={{ marginRight: 8, verticalAlign: "middle" }} />
          Flow Builder - Automação de Chatbot
        </Title>
        <Button
          className={classes.createBtn}
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
        >
          Novo Fluxo
        </Button>
      </MainHeader>

      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Pesquisar fluxo..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: <Search style={{ color: "#888", marginRight: 8 }} />
          }}
          style={{ width: 300, backgroundColor: "#fff", borderRadius: 8 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFlows.map((flow) => {
            let parsedNodes = [];
            try {
              parsedNodes = typeof flow.nodes === "string" ? JSON.parse(flow.nodes) : flow.nodes;
            } catch (e) {}

            return (
              <Grid item xs={12} sm={6} md={4} key={flow.id}>
                <Card className={classes.card}>
                  <CardContent>
                    <div className={classes.cardHeader}>
                      <Typography className={classes.flowTitle}>{flow.name}</Typography>
                      <Switch
                        checked={flow.active}
                        onChange={() => handleToggleActive(flow)}
                        color="primary"
                      />
                    </div>
                    <Box display="flex" gap={1} mt={1} alignItems="center">
                      <Chip
                        label={flow.active ? "Ativo" : "Inativo"}
                        size="small"
                        color={flow.active ? "primary" : "default"}
                        className={classes.statusChip}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {parsedNodes.length || 0} nó(s) no fluxo
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions style={{ justifyContent: "flex-end", padding: "8px 16px" }}>
                    <Tooltip title="Editar no Builder Visual">
                      <IconButton
                        color="primary"
                        onClick={() => history.push(`/flowbuilder/${flow.id}`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton color="secondary" onClick={() => handleDeleteFlow(flow.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
          {filteredFlows.length === 0 && !loading && (
            <Grid item xs={12}>
              <Paper style={{ padding: 32, textAlign: "center", borderRadius: 12 }}>
                <AccountTree style={{ fontSize: 48, color: "#ccc", marginBottom: 12 }} />
                <Typography variant="h6" color="textSecondary">
                  Nenhum fluxo de automação encontrado
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Clique em "Novo Fluxo" para criar seu primeiro robô de atendimento.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Modal para criar novo fluxo */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Criar Novo Fluxo de Automação</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome do Fluxo"
            variant="outlined"
            margin="dense"
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            placeholder="Ex: Boas-Vindas e Triagem Inicial"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={handleCreateFlow} color="primary" variant="contained">
            Criar & Abrir Builder
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default FlowBuilderList;
