import React, { useState, useEffect, useContext } from "react";
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Divider,
  makeStyles,
  Tooltip
} from "@material-ui/core";
import { ColorLens, TextFields, Restore } from "@material-ui/icons";
import { toast } from "react-toastify";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    width: "100%",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  colorOption: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "scale(1.15)",
    },
  },
  colorInput: {
    width: 50,
    height: 38,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  previewBox: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: `1px solid ${theme.palette.borderPrimary || "#ccc"}`,
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  btnSave: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
  }
}));

const PRESET_COLORS = [
  { name: "Verde Esmeralda (Padrão)", color: "#10B981" },
  { name: "Azul Real", color: "#1976D2" },
  { name: "Roxo Moderno", color: "#8B5CF6" },
  { name: "Vermelho Carmim", color: "#E11D48" },
  { name: "Laranja Âmbar", color: "#F59E0B" },
  { name: "Azul Turquesa", color: "#0284C7" },
  { name: "Rosa Choque", color: "#DB2777" },
  { name: "Grafite Escuro", color: "#334155" },
];

const Appearance = () => {
  const classes = useStyles();
  const { setCustomTheme, primaryColor: currentPrimary, secondaryColor: currentSecondary, fontSize: currentFontSize } = useContext(ColorModeContext);
  const { update } = useSettings();

  const [primaryColor, setPrimaryColorState] = useState(currentPrimary || "#10B981");
  const [secondaryColor, setSecondaryColorState] = useState(currentSecondary || "#6366F1");
  const [fontSize, setFontSizeState] = useState(currentFontSize || 14);

  useEffect(() => {
    if (currentPrimary) setPrimaryColorState(currentPrimary);
    if (currentSecondary) setSecondaryColorState(currentSecondary);
    if (currentFontSize) setFontSizeState(currentFontSize);
  }, [currentPrimary, currentSecondary, currentFontSize]);

  const handleApplyColors = async () => {
    try {
      if (setCustomTheme) {
        setCustomTheme({
          primaryColor,
          secondaryColor,
          fontSize: Number(fontSize)
        });
      }
      localStorage.setItem("primaryColor", primaryColor);
      localStorage.setItem("secondaryColor", secondaryColor);
      localStorage.setItem("fontSize", fontSize);

      await update({ key: "primaryColor", value: primaryColor });
      await update({ key: "secondaryColor", value: secondaryColor });
      await update({ key: "fontSize", value: String(fontSize) });

      toast.success("Aparência e cores atualizadas com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar personalização.");
    }
  };

  const handleResetDefaults = async () => {
    const defaultPrimary = "#10B981";
    const defaultSecondary = "#6366F1";
    const defaultFont = 14;

    setPrimaryColorState(defaultPrimary);
    setSecondaryColorState(defaultSecondary);
    setFontSizeState(defaultFont);

    if (setCustomTheme) {
      setCustomTheme({
        primaryColor: defaultPrimary,
        secondaryColor: defaultSecondary,
        fontSize: defaultFont
      });
    }

    localStorage.removeItem("primaryColor");
    localStorage.removeItem("secondaryColor");
    localStorage.removeItem("fontSize");

    await update({ key: "primaryColor", value: defaultPrimary });
    await update({ key: "secondaryColor", value: defaultSecondary });
    await update({ key: "fontSize", value: String(defaultFont) });

    toast.info("Aparência restaurada para o padrão do sistema.");
  };

  return (
    <Paper className={classes.container} elevation={0}>
      <Typography variant="h6" className={classes.sectionTitle}>
        <ColorLens /> Personalização de Cores da Empresa
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Escolha as cores primária e secundária da sua marca para personalizar todo o painel, botões, barras de navegação e destaques do sistema.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Cor Primária (Destaques, Botões e Barras)
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColorState(e.target.value)}
              className={classes.colorInput}
            />
            <Typography variant="body2" style={{ fontWeight: 600 }}>
              {primaryColor}
            </Typography>
          </Box>

          <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
            Paletas Sugeridas:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
            {PRESET_COLORS.map((preset) => (
              <Tooltip key={preset.color} title={preset.name} arrow>
                <div
                  className={classes.colorOption}
                  style={{ backgroundColor: preset.color }}
                  onClick={() => setPrimaryColorState(preset.color)}
                />
              </Tooltip>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Cor Secundária (Gradientes e Elementos Secundários)
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColorState(e.target.value)}
              className={classes.colorInput}
            />
            <Typography variant="body2" style={{ fontWeight: 600 }}>
              {secondaryColor}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider style={{ margin: "24px 0" }} />

      <Typography variant="h6" className={classes.sectionTitle}>
        <TextFields /> Tamanho da Fonte do Sistema
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Ajuste o tamanho de fonte de todo o sistema para melhorar a leitura ou aumentar a densidade de informações na tela.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="font-size-label">Tamanho da Fonte</InputLabel>
            <Select
              labelId="font-size-label"
              value={fontSize}
              onChange={(e) => setFontSizeState(Number(e.target.value))}
              label="Tamanho da Fonte"
            >
              <MenuItem value={12}>12px — Pequena (Compacta)</MenuItem>
              <MenuItem value={14}>14px — Média (Padrão)</MenuItem>
              <MenuItem value={16}>16px — Grande (Legível)</MenuItem>
              <MenuItem value={18}>18px — Extra Grande</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Caixa de pré-visualização */}
      <Box className={classes.previewBox}>
        <Typography variant="subtitle2" style={{ color: primaryColor, fontWeight: 700 }}>
          Pré-visualização em Tempo Real
        </Typography>
        <Typography variant="body2" style={{ fontSize: Number(fontSize) }}>
          Este é um texto de exemplo para testar a cor primária e o tamanho da fonte ({fontSize}px) configurados para sua empresa.
        </Typography>
        <Box mt={1.5} display="flex" gap={1}>
          <Button variant="contained" style={{ backgroundColor: primaryColor, color: "#fff" }} size="small">
            Botão Primário
          </Button>
          <Button variant="outlined" style={{ color: secondaryColor, borderColor: secondaryColor }} size="small">
            Botão Secundário
          </Button>
        </Box>
      </Box>

      <Box display="flex" justifyContent="flex-start" mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyColors}
          className={classes.btnSave}
          style={{ backgroundColor: primaryColor, color: "#fff" }}
        >
          Salvar Personalização
        </Button>
        <Button
          variant="outlined"
          onClick={handleResetDefaults}
          className={classes.btnSave}
          startIcon={<Restore />}
        >
          Restaurar Padrão
        </Button>
      </Box>
    </Paper>
  );
};

export default Appearance;
