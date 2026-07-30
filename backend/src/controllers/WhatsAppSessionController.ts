import { Request, Response } from "express";
import {
  clearManualShutdown,
  markManualShutdown,
  removeWbot
} from "../libs/wbot";
import { getIO } from "../libs/socket";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  // Reconexao pedida pelo usuario: libera o reconnect automatico de novo.
  clearManualShutdown(whatsapp.id);

  await StartWhatsAppSession(whatsapp, companyId);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  clearManualShutdown(whatsapp.id);

  await whatsapp.update({ session: "" });

  await StartWhatsAppSession(whatsapp, companyId);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  // Marcar antes de derrubar o socket: o handler de "close" do wbot precisa
  // saber que a desconexao foi pedida pelo usuario e nao reagendar a sessao.
  markManualShutdown(whatsapp.id);

  try {
    await removeWbot(whatsapp.id, true);

    await whatsapp.update({
      status: "DISCONNECTED",
      session: "",
      qrcode: "",
      number: ""
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(
      `company-${companyId}-whatsappSession`,
      {
        action: "update",
        session: whatsapp
      }
    );
  } finally {
    clearManualShutdown(whatsapp.id);
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
