import React from 'react';
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  kanbanSquare: {
    width: "1.2rem",
    height: "1.2rem",
    borderRadius: "5px"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  topRow: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  quantity: {
    fontSize: ".75rem",
    fontWeight: "normal",
    color: "#000000DE",
    backgroundColor: "#d9d9d9",
    padding: "0 8px",
    borderRadius: "5px"
  },
  totalValue: {
    fontSize: "11px",
    color: "#2e7d32",
    fontWeight: 600,
    letterSpacing: "0.3px",
  }
}));

const formatCurrency = (value) => {
  if (!value && value !== 0) return null;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

const LaneTitle = ({ squareColor, firstLane, children, quantity, totalValue }) => {
  const classes = useStyles();
  const formattedTotal = formatCurrency(totalValue || 0);

  return (
    <div className={classes.container}>
      <div className={classes.topRow}>
        {!firstLane
          ? <div className={classes.kanbanSquare} style={{ backgroundColor: squareColor }}></div>
          : <div style={{ height: "1.2rem" }}></div>
        }
        {children}
        <div className={classes.quantity}>{quantity}</div>
      </div>
      <div className={classes.totalValue}>💰 {formattedTotal}</div>
    </div>
  );
};

export default LaneTitle;