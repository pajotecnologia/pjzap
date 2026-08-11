import Flow from "../../models/Flow";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ExecuteFlowService from "./ExecuteFlowService";
import AppError from "../../errors/AppError";

interface Request {
  flowId: number;
  number: string;
  companyId: number;
}

const TestFlowService = async ({ flowId, number, companyId }: Request): Promise<boolean> => {
  const flow = await Flow.findOne({ where: { id: flowId, companyId } });
  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { companyId, isDefault: true }
  }) || await Whatsapp.findOne({
    where: { companyId }
  });

  if (!defaultWhatsapp) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND", 400);
  }

  if (defaultWhatsapp.status !== "CONNECTED") {
    throw new AppError("A conexão do WhatsApp precisa estar CONECTADA na página de Conexões para testar o fluxo.", 400);
  }

  let cleanNumber = number.replace(/\D/g, "");
  if (!cleanNumber || cleanNumber.length < 8) {
    throw new AppError("ERR_INVALID_NUMBER", 400);
  }

  // Prepend 55 for Brazilian numbers missing country code (10 or 11 digits: DDD + Number)
  if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith("55")) {
    cleanNumber = `55${cleanNumber}`;
  }

  let contact = await Contact.findOne({
    where: { number: cleanNumber, companyId }
  });

  if (!contact) {
    contact = await Contact.create({
      name: `Teste Flow (${cleanNumber})`,
      number: cleanNumber,
      companyId
    });
  }

  const ticket = await FindOrCreateTicketService(
    contact,
    defaultWhatsapp.id,
    0,
    companyId
  );

  let triggerKeyword = "*";
  try {
    const nodes = typeof flow.nodes === "string" ? JSON.parse(flow.nodes) : flow.nodes;
    const trigNode = Array.isArray(nodes) ? nodes.find((n: any) => n.type === "trigger") : null;
    if (trigNode && trigNode.keyword) {
      triggerKeyword = trigNode.keyword === "*" ? "ola" : trigNode.keyword;
    }
  } catch (e) {}

  return await ExecuteFlowService({
    ticket,
    messageBody: triggerKeyword,
    companyId,
    flowId: flow.id
  });
};

export default TestFlowService;
