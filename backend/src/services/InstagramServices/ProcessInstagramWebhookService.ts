import Whatsapp from "../../models/Whatsapp";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";

interface WebhookMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{ type: string; payload: { url: string } }>;
  };
}

const ProcessInstagramWebhookService = async (
  messaging: WebhookMessaging
): Promise<void> => {
  const senderId = messaging?.sender?.id;
  const recipientId = messaging?.recipient?.id;
  const messageData = messaging?.message;

  if (!senderId || !recipientId || !messageData) {
    return;
  }

  // Encontra a conexão do Instagram vinculada ao ID receptor (Página do Facebook / Instagram ID)
  let whatsapp = await Whatsapp.findOne({
    where: {
      channel: "instagram",
      facebookPageUserId: recipientId
    }
  });

  if (!whatsapp) {
    whatsapp = await Whatsapp.findOne({
      where: {
        channel: "instagram"
      }
    });
  }

  if (!whatsapp) {
    console.error("ProcessInstagramWebhookService: Nenhuma conexão de Instagram encontrada no sistema.");
    return;
  }

  const companyId = whatsapp.companyId;

  // Busca ou cria o contato do Instagram
  let contact = await Contact.findOne({
    where: {
      instagramId: senderId,
      companyId
    }
  });

  if (!contact) {
    contact = await Contact.create({
      name: `Instagram (${senderId.substring(0, 6)})`,
      number: senderId,
      instagramId: senderId,
      companyId,
      profilePicUrl: ""
    });
  }

  // Localiza ou cria o Ticket do canal Instagram
  const ticket = await FindOrCreateTicketService(
    contact,
    whatsapp.id,
    1,
    companyId,
    null
  );

  if (ticket.channel !== "instagram") {
    await ticket.update({ channel: "instagram" });
  }

  // Prepara o corpo da mensagem
  let body = messageData.text || "";
  if (messageData.attachments && messageData.attachments.length > 0) {
    const attachUrl = messageData.attachments[0]?.payload?.url || "";
    body = attachUrl ? attachUrl : "[Mídia do Instagram]";
  }

  // Salva a mensagem no banco de dados
  const messageCreated = await Message.create({
    id: messageData.mid || `ig_${Date.now()}`,
    ticketId: ticket.id,
    contactId: contact.id,
    body,
    fromMe: false,
    read: false,
    mediaType: messageData.attachments ? "image" : "chat",
    companyId
  });

  await ticket.update({
    lastMessage: body,
    unreadMessages: (ticket.unreadMessages || 0) + 1
  });

  // Executa o Flow Builder se houver fluxo ativo para esta empresa
  try {
    const ExecuteFlowService = require("../FlowServices/ExecuteFlowService").default;
    await ExecuteFlowService({ ticket, messageBody: body, companyId });
  } catch (err) {
    console.error("Erro ao executar flow no webhook do Instagram:", err);
  }

  // Emite eventos de Socket para atualização da tela em tempo real
  const io = getIO();

  io.to(`company-${companyId}-${ticket.status}`).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket
  });

  io.to(`company-${companyId}-${ticket.id}`).emit(`company-${companyId}-appMessage`, {
    action: "create",
    message: messageCreated,
    ticket,
    contact
  });
};

export default ProcessInstagramWebhookService;
