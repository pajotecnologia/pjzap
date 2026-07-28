import { Avatar, makeStyles, Tooltip } from '@material-ui/core';
import React from 'react';

const TEMPERATURE_CONFIG = {
  hot: { icon: '🔥', label: 'Quente', color: '#e53935' },
  warm: { icon: '🟡', label: 'Morno', color: '#fb8c00' },
  cold: { icon: '❄️', label: 'Frio', color: '#1e88e5' },
};

const useStyles = makeStyles(theme => ({
  container: {
    position: "relative",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    width: "100%",
    flexDirection: "column",
  },
  topRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    width: "100%",
  },
  titleAndSubtitleContainer: {
    maxWidth: "160px",
    display: "flex",
    flexShrink: 1,
    flexDirection: "column",
  },
  subtitle: {
    fontSize: "12px",
    fontWeight: "normal",
    color: "#4d4d4d",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  title: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontWeight: 600,
    fontSize: "14px",
  },
  leadInfoRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "2px",
  },
  leadBadge: {
    fontSize: "11px",
    padding: "2px 7px",
    borderRadius: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  valueBadge: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  temperatureBadge: {
    backgroundColor: "#fff8e1",
    color: "#f57f17",
  },
  originBadge: {
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
  },
  closedAtBadge: {
    backgroundColor: "#fce4ec",
    color: "#c62828",
  },
}));

const formatCurrency = (value) => {
  if (!value && value !== 0) return null;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const CardTitle = ({ ticket, userProfile }) => {
  const classes = useStyles();
  const temp = ticket.leadTemperature ? TEMPERATURE_CONFIG[ticket.leadTemperature] : null;
  const formattedValue = formatCurrency(ticket.leadValue);
  const formattedDate = formatDate(ticket.leadClosedAt);

  return (
    <div className={classes.container}>
      <div className={classes.topRow}>
        <Avatar
          alt={ticket.contact.name}
          src={ticket.contact.profilePicUrl}
          style={{ width: 36, height: 36 }}
        />
        <div className={classes.titleAndSubtitleContainer}>
          <span className={classes.title}>{ticket.contact.name}</span>
          <span className={classes.subtitle}>{ticket.contact.number}</span>
        </div>
      </div>

      {(ticket.isLead || formattedValue || temp || ticket.leadOrigin || formattedDate) && (
        <div className={classes.leadInfoRow}>
          {formattedValue && (
            <Tooltip title="Valor estimado">
              <span className={`${classes.leadBadge} ${classes.valueBadge}`}>
                💰 {formattedValue}
              </span>
            </Tooltip>
          )}
          {temp && (
            <Tooltip title={`Temperatura: ${temp.label}`}>
              <span className={`${classes.leadBadge} ${classes.temperatureBadge}`}>
                {temp.icon} {temp.label}
              </span>
            </Tooltip>
          )}
          {ticket.leadOrigin && (
            <Tooltip title="Origem do lead">
              <span className={`${classes.leadBadge} ${classes.originBadge}`}>
                📍 {ticket.leadOrigin}
              </span>
            </Tooltip>
          )}
          {formattedDate && (
            <Tooltip title="Previsão de fechamento">
              <span className={`${classes.leadBadge} ${classes.closedAtBadge}`}>
                📅 {formattedDate}
              </span>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default CardTitle;