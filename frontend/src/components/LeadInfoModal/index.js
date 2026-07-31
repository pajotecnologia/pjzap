import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  makeStyles,
  Typography,
  Chip,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiPaper-root": {
      borderRadius: 12,
    },
  },
  title: {
    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    color: "#fff",
    padding: "16px 24px",
    "& h2": { fontWeight: 700, fontSize: "1.1rem" },
  },
  content: {
    padding: "20px 24px",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 8,
    marginTop: 12,
  },
  contactChip: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    fontWeight: 600,
    marginBottom: 12,
  },
  temperatureHot: { backgroundColor: "#ffebee", color: "#c62828" },
  temperatureWarm: { backgroundColor: "#fff8e1", color: "#f57f17" },
  temperatureCold: { backgroundColor: "#e3f2fd", color: "#1565c0" },
  saveBtn: {
    background: "linear-gradient(135deg, #1976d2, #42a5f5)",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 8,
    padding: "8px 24px",
    "&:hover": { background: "linear-gradient(135deg, #1565c0, #1976d2)" },
  },
}));

const ORIGINS = ["WhatsApp", "Instagram", "Site", "Indicação", "Manual", "E-mail", "Outro"];

const LeadInfoModal = ({ open, onClose, ticket, onSaved }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    isLead: true,
    leadValue: "",
    leadTemperature: "",
    leadOrigin: "",
    leadClosedAt: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  useEffect(() => {
    if (ticket && open) {
      setForm({
        isLead: ticket.isLead || true,
        leadValue: ticket.leadValue || "",
        leadTemperature: ticket.leadTemperature || "",
        leadOrigin: ticket.leadOrigin || "",
        leadClosedAt: ticket.leadClosedAt
          ? new Date(ticket.leadClosedAt).toISOString().split("T")[0]
          : "",
        utmSource: ticket.utmSource || "",
        utmMedium: ticket.utmMedium || "",
        utmCampaign: ticket.utmCampaign || "",
      });
    }
  }, [ticket, open]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!ticket) return;
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        ...form,
        isLead: true,
        leadValue: form.leadValue !== "" ? parseFloat(form.leadValue) : null,
        leadClosedAt: form.leadClosedAt || null,
      });
      toast.success("Dados do lead salvos!");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar dados do lead");
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className={classes.dialog}>
      <DialogTitle className={classes.title}>
        ✏️ Editar Dados do Lead
      </DialogTitle>

      <DialogContent className={classes.content}>
        <Typography className={classes.sectionLabel}>Contato</Typography>
        <Chip
          label={`${ticket.contact?.name} · ${ticket.contact?.number}`}
          className={classes.contactChip}
        />

        <Typography className={classes.sectionLabel}>Informações do Lead</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor Estimado (R$)"
              variant="outlined"
              fullWidth
              size="small"
              type="number"
              value={form.leadValue}
              onChange={handleChange("leadValue")}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel>Temperatura</InputLabel>
              <Select
                value={form.leadTemperature}
                onChange={handleChange("leadTemperature")}
                label="Temperatura"
              >
                <MenuItem value=""><em>Nenhuma</em></MenuItem>
                <MenuItem value="hot">🔥 Quente</MenuItem>
                <MenuItem value="warm">🟡 Morno</MenuItem>
                <MenuItem value="cold">❄️ Frio</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel>Origem</InputLabel>
              <Select
                value={form.leadOrigin}
                onChange={handleChange("leadOrigin")}
                label="Origem"
              >
                <MenuItem value=""><em>Nenhuma</em></MenuItem>
                {ORIGINS.map((o) => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Previsão de Fechamento"
              variant="outlined"
              fullWidth
              size="small"
              type="date"
              value={form.leadClosedAt}
              onChange={handleChange("leadClosedAt")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* 🎯 Rastreamento de Tráfego Pago / UTMs */}
          <Grid item xs={12}>
            <Typography className={classes.sectionLabel}>🎯 Rastreamento de Anúncios / UTMs</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="UTM Source (Fonte)"
              placeholder="ex: facebook / google"
              variant="outlined"
              fullWidth
              size="small"
              value={form.utmSource || ""}
              onChange={handleChange("utmSource")}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="UTM Medium (Meio)"
              placeholder="ex: cpc / Stories"
              variant="outlined"
              fullWidth
              size="small"
              value={form.utmMedium || ""}
              onChange={handleChange("utmMedium")}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="UTM Campaign (Campanha)"
              placeholder="ex: BlackFriday_2026"
              variant="outlined"
              fullWidth
              size="small"
              value={form.utmCampaign || ""}
              onChange={handleChange("utmCampaign")}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions style={{ padding: "12px 24px" }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          className={classes.saveBtn}
          onClick={handleSave}
          disabled={loading}
          variant="contained"
        >
          {loading ? "Salvando..." : "Salvar Lead"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadInfoModal;
