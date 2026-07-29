import { Op } from "sequelize";
import Ticket from "../../models/Ticket"
import Whatsapp from "../../models/Whatsapp"
import { getIO } from "../../libs/socket"
import formatBody from "../../helpers/Mustache";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { verifyMessage } from "./wbotMessageListener";
import TicketTraking from "../../models/TicketTraking";

export const ClosedAllOpenTickets = async (companyId: number): Promise<void> => {

  // @ts-ignore: Unreachable code error
  const closeTicket = async (ticket: any, currentStatus: any, body: any) => {
    if (currentStatus === 'nps') {

      await ticket.update({
        status: "closed",
        //userId: ticket.userId || null,
        lastMessage: body,
        unreadMessages: 0,
        amountUseBotQueues: 0
      });

    } else if (currentStatus === 'open') {

      await ticket.update({
        status: "closed",
        //  userId: ticket.userId || null,
        lastMessage: body,
        unreadMessages: 0,
        amountUseBotQueues: 0
      });

    } else {

      await ticket.update({
        status: "closed",
        //userId: ticket.userId || null,
        unreadMessages: 0
      });
    }
  };

  const io = getIO();
  try {

    const { rows: tickets } = await Ticket.findAndCountAll({
      where: { status: { [Op.in]: ["open"] }, companyId },
      order: [["updatedAt", "DESC"]]
    });

    tickets.forEach(async ticket => {
      const showTicket = await ShowTicketService(ticket.id, companyId);
      const whatsapp = await Whatsapp.findByPk(showTicket?.whatsappId);
      const ticketTraking = await TicketTraking.findOne({
        where: {
          ticketId: ticket.id,
          finishedAt: null,
        }
      })

      if (!whatsapp) return;

      let {
        expiresInactiveMessage, //mensage de encerramento por inatividade      
        expiresTicket //tempo em horas para fechar ticket automaticamente
      } = whatsapp


      // @ts-ignore: Unreachable code error
      if (expiresTicket && expiresTicket !== "" &&
        // @ts-ignore: Unreachable code error
        expiresTicket !== "0" && Number(expiresTicket) > 0) {

        //mensagem de encerramento por inatividade
        const bodyExpiresMessageInactive = formatBody(`\u200e ${expiresInactiveMessage}`, showTicket.contact);

        const dataLimite = new Date();
        dataLimite.setMinutes(dataLimite.getMinutes() - Number(expiresTicket));

        // Data intermediária para mensagem de Follow-up (Reengajamento automático)
        const dataMetadeTempo = new Date();
        dataMetadeTempo.setMinutes(dataMetadeTempo.getMinutes() - Math.floor(Number(expiresTicket) / 2));

        if (showTicket.status === "open" && !showTicket.isGroup) {
          const dataUltimaInteracaoChamado = new Date(showTicket.updatedAt);

          // 1. Reengajamento intermediário (Follow-up automático)
          if (
            dataUltimaInteracaoChamado < dataMetadeTempo &&
            showTicket.fromMe &&
            (showTicket.amountUsedBotQueues === 0 || !showTicket.amountUsedBotQueues)
          ) {
            const followUpMsg = formatBody(
              `\u200e Olá {firstName}, notei que você não respondeu. Ainda podemos dar continuidade ao seu atendimento?`,
              showTicket.contact
            );
            const sentMsg = await SendWhatsAppMessage({ body: followUpMsg, ticket: showTicket });
            await verifyMessage(sentMsg, showTicket, showTicket.contact);
            await showTicket.update({ amountUsedBotQueues: 1 });
          }

          // 2. Encerramento por inatividade após expirar o tempo limite total
          if (dataUltimaInteracaoChamado < dataLimite && showTicket.fromMe) {
            closeTicket(showTicket, showTicket.status, bodyExpiresMessageInactive);

            if (expiresInactiveMessage !== "" && expiresInactiveMessage !== undefined) {
              const sentMessage = await SendWhatsAppMessage({ body: bodyExpiresMessageInactive, ticket: showTicket });
              await verifyMessage(sentMessage, showTicket, showTicket.contact);
            }

            if (ticketTraking) {
              await ticketTraking.update({
                finishedAt: moment().toDate(),
                closedAt: moment().toDate(),
                whatsappId: ticket.whatsappId,
                userId: ticket.userId,
              });
            }

            io.to("open").emit(`company-${companyId}-ticket`, {
              action: "delete",
              ticketId: showTicket.id
            });
          }
        }
      }
    });

  } catch (e: any) {
    console.log('e', e)
  }

}
