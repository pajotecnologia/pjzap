import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TicketTag from '../models/TicketTag';
import Tag from '../models/Tag';
import Ticket from '../models/Ticket';
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import StartFlowService from "../services/FlowServices/StartFlowService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.params;

  try {
    const ticketTag = await TicketTag.create({ ticketId, tagId });

    const tag = await Tag.findByPk(tagId);
    if (tag && tag.kanban === 1) {
      const ticket = await Ticket.findByPk(ticketId, { include: ["contact"] });
      if (ticket) {
        if (tag.msgMsg) {
          const body = tag.msgMsg.replace(/{nome}/gi, ticket.contact.name || "Cliente");
          
          await SendWhatsAppMessage({ body, ticket });

          const messageData = {
            id: `kanban_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            ticketId: ticket.id,
            contactId: ticket.contactId,
            body,
            fromMe: true,
            read: true,
            mediaType: "chat"
          };
          await CreateMessageService({ messageData, companyId: ticket.companyId });
        }

        if (tag.flowId) {
          await StartFlowService({ ticket, flowId: tag.flowId, companyId: ticket.companyId });
        }
      }
    }

    return res.status(201).json(ticketTag);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to store ticket tag.' });
  }
};

/*
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;



  try {
    await TicketTag.destroy({ where: { ticketId } });
    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};
*/
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;


  try {
    // Retrieve tagIds associated with the provided ticketId from TicketTags
    const ticketTags = await TicketTag.findAll({ where: { ticketId } });
    const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

    // Find the tagIds with kanban = 1 in the Tags table
    const tagsWithKanbanOne = await Tag.findAll({
      where: {
        id: tagIds,
        kanban: 1,
      },
    });

    // Remove the tagIds with kanban = 1 from TicketTags
    const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
    if (tagIdsWithKanbanOne)
    await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });

    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};
