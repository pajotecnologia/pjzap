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
    name: Yup.string().min(1),
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

  if (name) {
    const nameExists = await Whatsapp.findOne({
      where: {
        name,
        id: { [Op.ne]: Number(whatsappId) },
        companyId
      }
    });
    if (nameExists) {
      throw new AppError("ERR_WAPP_NAME_EXISTS");
    }
  }

  const queueIdsList = Array.isArray(queueIds) ? queueIds : [];

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: {
        isDefault: true,
        id: { [Op.ne]: Number(whatsappId) },
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

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (status !== undefined) updateData.status = status;
  if (session !== undefined) updateData.session = session;
  if (greetingMessage !== undefined) updateData.greetingMessage = greetingMessage;
  if (complationMessage !== undefined) updateData.complationMessage = complationMessage;
  if (outOfHoursMessage !== undefined) updateData.outOfHoursMessage = outOfHoursMessage;
  if (ratingMessage !== undefined) updateData.ratingMessage = ratingMessage;
  if (isDefault !== undefined) updateData.isDefault = isDefault;
  if (token !== undefined) updateData.token = token;
  if (transferQueueId !== undefined) updateData.transferQueueId = cleanNumber(transferQueueId);
  if (timeToTransfer !== undefined) updateData.timeToTransfer = cleanNumber(timeToTransfer);
  if (promptId !== undefined) updateData.promptId = cleanNumber(promptId);
  if (maxUseBotQueues !== undefined) updateData.maxUseBotQueues = cleanNumber(maxUseBotQueues) ?? 3;
  if (timeUseBotQueues !== undefined) updateData.timeUseBotQueues = String(timeUseBotQueues || "0");
  if (expiresTicket !== undefined) updateData.expiresTicket = cleanNumber(expiresTicket) ?? 0;
  if (expiresInactiveMessage !== undefined) updateData.expiresInactiveMessage = expiresInactiveMessage;

  await whatsapp.update(updateData);

  await AssociateWhatsappQueue(whatsapp, queueIdsList);

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;
