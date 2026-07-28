import React, { useState, useEffect, useContext } from "react";
import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Avatar,
  Tooltip,
} from "@material-ui/core";
import {
  Search,
  Edit,
  TrendingUp,
  FilterList,
  GetApp,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import LeadInfoModal from "../../components/LeadInfoModal";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    minHeight: "calc(100vh - 64px)",
    backgroundColor: "#f5f7fa",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 140px",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "16px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statLabel: { fontSize: 12, color: "#757575", fontWeight: 600, textTransform: "uppercase" },
  statValue: { fontSize: 22, fontWeight: 800, color: "#1976d2" },
  statSub: { fontSize: 11, color: "#9e9e9e" },
  filtersRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  tableContainer: {
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tableHeader: {
    backgroundColor: "#1976d2",
    "& th": { color: "#fff", fontWeight: 700, fontSize: 13 },
  },
  tableRow: {
    "&:hover": { backgroundColor: "#f5f9ff" },
    cursor: "pointer",
    transition: "background 0.15s",
  },
  temperatureChip: { fontSize: 11, fontWeight: 600, height: 22 },
  hot: { backgroundColor: "#ffebee", color: "#c62828" },
  warm: { backgroundColor: "#fff8e1", color: "#f57f17" },
  cold: { backgroundColor: "#e3f2fd", color: "#1565c0" },
  valuePill: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    padding: "2px 10px",
    borderRadius: 12,
    display: "inline-block",
  },
  contactCell: { display: "flex", alignItems: "center", gap: 10 },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "#9e9e9e",
  },
}));

const TEMPERATURE_LABEL = { hot: "🔥 Quente", warm: "🟡 Morno", cold: "❄️ Frio" };
const TEMPERATURE_CLASS = { hot: "hot", warm: "warm", cold: "cold" };

const formatCurrency = (v) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
    : "—";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const Leads = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [search, setSearch] = useState("");
  const [filterTemp, setFilterTemp] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queueIds = user.queues.map((q) => q.UserQueue.queueId);
      const { data } = await api.get("/ticket/kanban", {
        params: { queueIds: JSON.stringify(queueIds), teste: true },
      });
      const allTickets = data.tickets || [];
      setTickets(allTickets);

      const { data: tagData } = await api.get("/tags/kanban");
      setTags(tagData.lista || []);
    } catch (err) {
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = [...tickets];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.contact?.name?.toLowerCase().includes(s) ||
          t.contact?.number?.toLowerCase().includes(s)
      );
    }
    if (filterTemp) result = result.filter((t) => t.leadTemperature === filterTemp);
    if (filterTag) {
      if (filterTag === "0") result = result.filter((t) => t.tags.length === 0);
      else result = result.filter((t) => t.tags.some((tg) => tg.id.toString() === filterTag));
    }
    if (filterOrigin) result = result.filter((t) => t.leadOrigin === filterOrigin);
    setFiltered(result);
    setPage(0);
  }, [tickets, search, filterTemp, filterTag, filterOrigin]);

  const totalValue = filtered.reduce((s, t) => s + (parseFloat(t.leadValue) || 0), 0);
  const hotCount = filtered.filter((t) => t.leadTemperature === "hot").length;
  const origins = [...new Set(tickets.map((t) => t.leadOrigin).filter(Boolean))];

  const handleEditLead = (e, ticket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setOpenModal(true);
  };

  const handleExportCSV = () => {
    const header = ["Nome", "Número", "Etapa", "Valor", "Temperatura", "Origem", "Previsão"];
    const rows = filtered.map((t) => [
      t.contact?.name,
      t.contact?.number,
      t.tags[0]?.name || "Em aberto",
      t.leadValue || "",
      t.leadTemperature || "",
      t.leadOrigin || "",
      t.leadClosedAt ? formatDate(t.leadClosedAt) : "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className={classes.root}>
      <MainHeader>
        <Title>
          <TrendingUp style={{ marginRight: 8, verticalAlign: "middle", color: "#1976d2" }} />
          CRM — Leads
        </Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            size="small"
            startIcon={<GetApp />}
            onClick={handleExportCSV}
          >
            Exportar CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => history.push("/kanban")}
          >
            Ver Kanban
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {/* Cards de estatísticas */}
      <div className={classes.statsRow}>
        <div className={classes.statCard}>
          <span className={classes.statLabel}>Total de Leads</span>
          <span className={classes.statValue}>{filtered.length}</span>
          <span className={classes.statSub}>no funil</span>
        </div>
        <div className={classes.statCard}>
          <span className={classes.statLabel}>Valor Total</span>
          <span className={classes.statValue} style={{ fontSize: 18 }}>{formatCurrency(totalValue)}</span>
          <span className={classes.statSub}>estimado</span>
        </div>
        <div className={classes.statCard}>
          <span className={classes.statLabel}>🔥 Quentes</span>
          <span className={classes.statValue} style={{ color: "#c62828" }}>{hotCount}</span>
          <span className={classes.statSub}>leads prioritários</span>
        </div>
        <div className={classes.statCard}>
          <span className={classes.statLabel}>Etapas</span>
          <span className={classes.statValue} style={{ color: "#6a1b9a" }}>{tags.length + 1}</span>
          <span className={classes.statSub}>no kanban</span>
        </div>
      </div>

      {/* Filtros */}
      <div className={classes.filtersRow}>
        <TextField
          placeholder="Buscar por nome ou número..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        />
        <FormControl variant="outlined" size="small" style={{ minWidth: 140 }}>
          <InputLabel>Temperatura</InputLabel>
          <Select value={filterTemp} onChange={(e) => setFilterTemp(e.target.value)} label="Temperatura">
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="hot">🔥 Quente</MenuItem>
            <MenuItem value="warm">🟡 Morno</MenuItem>
            <MenuItem value="cold">❄️ Frio</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Etapa</InputLabel>
          <Select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} label="Etapa">
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="0">Em aberto</MenuItem>
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id.toString()}>{tag.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {origins.length > 0 && (
          <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
            <InputLabel>Origem</InputLabel>
            <Select value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)} label="Origem">
              <MenuItem value="">Todas</MenuItem>
              {origins.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {(search || filterTemp || filterTag || filterOrigin) && (
          <Button
            size="small"
            onClick={() => { setSearch(""); setFilterTemp(""); setFilterTag(""); setFilterOrigin(""); }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small">
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell>Contato</TableCell>
              <TableCell>Etapa</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Temperatura</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>Previsão</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className={classes.emptyState}>
                    <Typography variant="h6">Nenhum lead encontrado</Typography>
                    <Typography variant="body2">
                      Adicione tickets ao Kanban e marque-os como lead pelo botão "Editar Lead"
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className={classes.tableRow}
                  onClick={() => history.push(`/tickets/${ticket.uuid}`)}
                >
                  <TableCell>
                    <div className={classes.contactCell}>
                      <Avatar
                        src={ticket.contact?.profilePicUrl}
                        alt={ticket.contact?.name}
                        style={{ width: 30, height: 30 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.contact?.name}</div>
                        <div style={{ fontSize: 11, color: "#9e9e9e" }}>{ticket.contact?.number}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ticket.tags[0]
                      ? <Chip label={ticket.tags[0].name} size="small" style={{ backgroundColor: ticket.tags[0].color + "22", color: ticket.tags[0].color, fontWeight: 600, fontSize: 11 }} />
                      : <span style={{ color: "#9e9e9e", fontSize: 12 }}>Em aberto</span>}
                  </TableCell>
                  <TableCell>
                    {ticket.leadValue
                      ? <span className={classes.valuePill}>{formatCurrency(ticket.leadValue)}</span>
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {ticket.leadTemperature ? (
                      <Chip
                        label={TEMPERATURE_LABEL[ticket.leadTemperature]}
                        size="small"
                        className={`${classes.temperatureChip} ${classes[TEMPERATURE_CLASS[ticket.leadTemperature]]}`}
                      />
                    ) : "—"}
                  </TableCell>
                  <TableCell>{ticket.leadOrigin || "—"}</TableCell>
                  <TableCell>{formatDate(ticket.leadClosedAt)}</TableCell>
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar dados do lead">
                      <IconButton size="small" onClick={(e) => handleEditLead(e, ticket)}>
                        <Edit fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Por página:"
        />
      </TableContainer>

      <LeadInfoModal
        open={openModal}
        onClose={() => { setOpenModal(false); setSelectedTicket(null); }}
        ticket={selectedTicket}
        onSaved={fetchData}
      />
    </div>
  );
};

export default Leads;
