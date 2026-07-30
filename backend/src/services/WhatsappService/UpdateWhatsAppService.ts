import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface WhatsappData {
  name?: string;
  status?: string;
  session?: string;
  isDefault?: boolean;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  queueIds?: number[];
  token?: string;
  //sendIdQueue?: number;
  //timeSendQueue?: number;
  transferQueueId?: number; 
  timeToTransfer?: number;    
  promptId?: number;
  maxUseBotQueues?: number;
  timeUseBotQueues?: number;
  expiresTicket?: number;
  expiresInactiveMessage?: string;

}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  companyId: number;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  companyId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string(),
    isDefault: Yup.boolean()
  });

  const {
    name,
    status,
    isDefault,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    queueIds = [],
    token,
    //timeSendQueue,
    //sendIdQueue = null,
    transferQueueId,	
    timeToTransfer,	
    promptId,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    expiresInactiveMessage
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const queueIdsList = Array.isArray(queueIds) ? queueIds : [];

  if (queueIdsList.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: {
        isDefault: true,
        id: { [Op.not]: whatsappId },
        companyId
      }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  const cleanNumber = (val: any): number | null => {
    if (val === "" || val === null || val === undefined || isNaN(Number(val))) {
      return null;
    }
    return Number(val);
  };

  const parsedTransferQueueId = cleanNumber(transferQueueId);
  const parsedTimeToTransfer = cleanNumber(timeToTransfer);
  const parsedPromptId = cleanNumber(promptId);
  const parsedMaxUseBotQueues = cleanNumber(maxUseBotQueues) ?? 3;
  const parsedTimeUseBotQueues = cleanNumber(timeUseBotQueues) ?? 0;
  const parsedExpiresTicket = cleanNumber(expiresTicket) ?? 0;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  await whatsapp.update({
    name,
    status,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    isDefault,
    companyId,
    token,
    transferQueueId: parsedTransferQueueId,	
    timeToTransfer: parsedTimeToTransfer,	
    promptId: parsedPromptId,
    maxUseBotQueues: parsedMaxUseBotQueues,
    timeUseBotQueues: parsedTimeUseBotQueues,
    expiresTicket: parsedExpiresTicket,
    expiresInactiveMessage
  });

  await AssociateWhatsappQueue(whatsapp, queueIdsList);

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;
