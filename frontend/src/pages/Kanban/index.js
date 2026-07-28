import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import LaneTitle from "../../components/Kanban/LaneTitle";
import CardTitle from "../../components/Kanban/CardTitle";
import FooterButtons from "../../components/Kanban/FooterButtons";
import LeadInfoModal from "../../components/LeadInfoModal";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from "@material-ui/core";
import { MoreVert, Archive, Edit } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    padding: theme.spacing(2),
    height: "calc(100vh - 64px)",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Roboto', sans-serif",
    overflow: "hidden",
    [theme.breakpoints.down('sm')]: {
      height: "auto",
      minHeight: "100vh",
      padding: theme.spacing(1),
    }
  },
  boardContainer: {
    width: "100%",
    "& .smooth-dnd-container": { minHeight: "60vh" },
    "& .react-trello-lane": {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      margin: "0 8px",
      [theme.breakpoints.down('sm')]: { margin: "8px 0", width: "100% !important" }
    },
    "& .react-trello-card": {
      borderRadius: "6px",
      marginBottom: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      transition: "all 0.2s ease",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }
    },
    "& .react-trello-card-draggable": { cursor: "grab" },
    "& .react-trello-card-title": { fontSize: "14px", fontWeight: "500", color: "#333" },
    "& .react-trello-lane-header": { padding: "12px 16px", fontWeight: "600", fontSize: "16px" },
    cardActions: { display: "flex", justifyContent: "flex-end", padding: "8px 0 0 0" },
  }
}));

const Kanban = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [laneQuantities, setLaneQuantities] = useState({});
  const [laneTotals, setLaneTotals] = useState({});
  const [file, setFile] = useState({ lanes: [] });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [openLeadModal, setOpenLeadModal] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao carregar tags");
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: { queueIds: JSON.stringify(jsonString), teste: true }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      toast.error("Erro ao carregar tickets");
      setTickets([]);
    }
  };

  const handleMenuClick = (event, ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleActionClick = (type) => {
    if (type === 'editLead') {
      setOpenLeadModal(true);
      handleMenuClose();
    } else {
      setActionType(type);
      setOpenDialog(true);
      handleMenuClose();
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedTicket(null);
  };

  const confirmAction = async () => {
    try {
      if (actionType === 'archive') {
        await api.delete(`/ticket-tags/${selectedTicket.id}`);
        toast.success('Ticket arquivado com sucesso');
      }
      fetchTickets();
      fetchTags();
    } catch (err) {
      console.log(err);
      toast.error('Erro ao processar ação');
    } finally {
      handleDialogClose();
    }
  };

  useEffect(() => {
    fetchTags();
    fetchTickets();
  }, []);

  useEffect(() => {
    const newQuantities = {};
    const newTotals = {};

    const calcLane = (laneId, laneTickets) => {
      newQuantities[laneId] = laneTickets.length;
      newTotals[laneId] = laneTickets.reduce((sum, t) => sum + (parseFloat(t.leadValue) || 0), 0);
    };

    calcLane("0", tickets.filter(t => t.tags.length === 0));
    tags.forEach(tag => {
      calcLane(tag.id.toString(), tickets.filter(t => t.tags.some(tg => tg.id === tag.id)));
    });

    setLaneQuantities(newQuantities);
    setLaneTotals(newTotals);
  }, [tags, tickets]);

  const buildCard = (ticket) => ({
    id: ticket.id.toString(),
    title: <CardTitle ticket={ticket} userProfile={user.profile} />,
    label: (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Ações">
          <IconButton size="small" onClick={(e) => handleMenuClick(e, ticket)}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    ),
    description: <FooterButtons ticket={ticket} />,
    draggable: true,
    href: "/tickets/" + ticket.uuid,
  });

  useEffect(() => {
    const lanes = [
      {
        id: "0",
        title: <LaneTitle firstLane quantity={laneQuantities["0"]} totalValue={laneTotals["0"]}>Em aberto</LaneTitle>,
        style: { backgroundColor: "#f0f2f5", borderTop: "4px solid #6c757d" },
        cards: tickets.filter(t => t.tags.length === 0).map(buildCard),
      },
      ...tags.map(tag => ({
        id: tag.id.toString(),
        title: (
          <LaneTitle
            squareColor={tag.color}
            quantity={laneQuantities[tag.id.toString()]}
            totalValue={laneTotals[tag.id.toString()]}
          >
            {tag.name}
          </LaneTitle>
        ),
        style: { backgroundColor: `${tag.color}10`, borderTop: `4px solid ${tag.color}` },
        cards: tickets.filter(t => t.tags.some(tg => tg.id === tag.id)).map(buildCard),
      })),
    ];
    setFile({ lanes });
  }, [tags, tickets, laneQuantities, laneTotals]);

  const handleCardMove = async (sourceLaneId, targetLaneId, cardId) => {
    try {
      await api.delete(`/ticket-tags/${cardId}`);
      if (targetLaneId !== "0") {
        await api.put(`/ticket-tags/${cardId}/${targetLaneId}`);
      }
      toast.success('Ticket movido com sucesso');
      fetchTickets();
      fetchTags();
    } catch (err) {
      console.log(err);
      toast.error('Erro ao mover ticket');
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.boardContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          laneStyle={{ maxHeight: "80vh", minWidth: "280px", width: "280px" }}
          cardStyle={{ backgroundColor: "white", padding: "12px", marginBottom: "12px" }}
          hideCardDeleteIcon
          style={{ backgroundColor: 'transparent', height: "100%", fontFamily: "'Roboto', sans-serif" }}
          responsive
          collapsibleLanes
        />
      </div>

      {/* Menu de ações */}
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleActionClick('editLead')}>
          <Edit fontSize="small" style={{ marginRight: 8, color: "#1976d2" }} />
          Editar Lead
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('archive')}>
          <Archive fontSize="small" style={{ marginRight: 8 }} />
          Finalizar
        </MenuItem>
      </Menu>

      {/* Dialog de confirmação */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Desvincular Ticket</DialogTitle>
        <DialogContent>
          <p>Tem certeza que deseja desvincular este ticket de todas as tags kanban? O chat permanecerá intacto.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancelar</Button>
          <Button onClick={confirmAction} color="secondary" variant="contained">Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edição de lead */}
      <LeadInfoModal
        open={openLeadModal}
        onClose={() => { setOpenLeadModal(false); setSelectedTicket(null); }}
        ticket={selectedTicket}
        onSaved={() => { fetchTickets(); fetchTags(); }}
      />
    </div>
  );
};

export default Kanban;