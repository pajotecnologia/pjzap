import * as Sentry from "@sentry/node";
import { WAMessage } from "baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import formatBody from "../../helpers/Mustache";

import { map_msg, buildContactAddress } from "../../utils/global";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  isForwarded?: boolean;  
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  isForwarded = false
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  let number = buildContactAddress(ticket.contact, ticket.isGroup);
  if (!ticket.isGroup && ticket.contact?.number) {
    try {
      const cleanNum = ticket.contact.number.replace(/\D/g, "");
      const [onWapp] = await wbot.onWhatsApp(`${cleanNum}@s.whatsapp.net`);
      if (onWapp && onWapp.exists && onWapp.jid) {
        number = onWapp.jid;
        console.log("JID resolvido dinamicamente via onWhatsApp:", number);
      }
    } catch (e: any) {
      console.warn("Aviso ao consultar onWhatsApp em SendWhatsAppMessage:", e?.message || e);
    }
  }
  console.log("number final para envio:", number);
  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: {
        id: quotedMsg.id
      }
    });

    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);

      options = {
        quoted: {
          key: msgFound.key,
          message: {
            extendedTextMessage: msgFound.message.extendedTextMessage
          }
        }
      };
    }

  }

  try {
    console.log('body:::::::::::::::::::::::::::', body)
    map_msg.set(ticket.contact.number, { lastSystemMsg: body })
    console.log('lastSystemMsg:::::::::::::::::::::::::::', ticket.contact.number)
    const sentMessage = await wbot.sendMessage(number, {
      text: formatBody(body, ticket.contact),
	  contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded ? true : false }
    },
      {
        ...options
      }
    );
    try {
      const msgDB = require("../../libs/wbot").default;
      msgDB().save(sentMessage);
    } catch (e) {}

    await ticket.update({ lastMessage: formatBody(body, ticket.contact) });
    console.log("Message sent", sentMessage);
    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
