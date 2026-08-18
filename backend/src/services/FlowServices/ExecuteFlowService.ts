import Flow from "../../models/Flow";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Setting from "../../models/Setting";
import CreateMessageService from "../MessageServices/CreateMessageService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import SendInstagramMessageService from "../InstagramServices/SendInstagramMessageService";
import { cacheLayer } from "../../libs/cache";

interface Request {
  ticket: Ticket;
  messageBody: string;
  companyId: number;
  flowId?: number;
}

interface FlowNode {
  id: string;
  type: 
    | "trigger" 
    | "message" 
    | "menu" 
    | "buttons" 
    | "list_menu" 
    | "carousel" 
    | "set_variable" 
    | "anti_ban" 
    | "transfer_queue" 
    | "close_ticket" 
    | "set_kanban" 
    | "pix_payment" 
    | "condition" 
    | "webhook" 
    | "delay" 
    | "randomizer";
  title?: string;
  content?: string;
  footer?: string;
  thumbnailUrl?: string;
  keyword?: string;
  queueId?: number;
  tagId?: number;
  pixValue?: number;
  pixCopyPaste?: string;
  conditionKeyword?: string;
  targetNodeIdTrue?: string;
  targetNodeIdFalse?: string;
  webhookUrl?: string;
  delaySeconds?: number;
  minDelaySeconds?: number;
  maxDelaySeconds?: number;
  variableName?: string;
  variablePrompt?: string;
  buttonLabel?: string;
  buttons?: Array<{ id: string; text: string; targetNodeId?: string }>;
  options?: Array<{ id: string; optionNumber: string; text: string; description?: string; targetNodeId: string; targetNodeIdOption?: string; }>;
  cards?: Array<{ title: string; description: string; imageUrl?: string; buttonText?: string }>;
  targetNodeId?: string;
  nodeIdTag?: string;
}

interface FlowConnection {
  sourceNodeId: string;
  targetNodeId: string;
  optionId?: string;
}

// Helper para encontrar um nó pelo ID primário ou pela Tag/ID de identificação visual
const findNodeById = (allNodes: FlowNode[], targetId?: string): FlowNode | undefined => {
  if (!targetId || !Array.isArray(allNodes)) return undefined;
  const cleanTarget = targetId.toString().trim().replace(/^#/, "").toLowerCase();

  return allNodes.find((n) => {
    const nid = (n.id || "").toString().trim().toLowerCase();
    const tag = (
      (n as any).nodeIdTag ||
      (n as any).customId ||
      (n as any).data?.nodeIdTag ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();

    return (
      nid === cleanTarget ||
      nid === `node_${cleanTarget}` ||
      cleanTarget === `node_${nid}` ||
      (tag && tag === cleanTarget)
    );
  });
};

// Helper para encontrar conexão de destino alternativa
const findTargetFromConnections = (
  connections: FlowConnection[],
  sourceId: string,
  handleOrOptionId?: string,
  optionIndex?: number
): string | undefined => {
  if (!connections || !Array.isArray(connections)) return undefined;

  const cleanSource = sourceId.toString().trim().toLowerCase();

  const isSourceMatch = (c: any) => {
    const src = (c.sourceNodeId || c.source || "").toString().trim().toLowerCase();
    return (
      src === cleanSource ||
      src === `node_${cleanSource}` ||
      cleanSource === `node_${src}`
    );
  };

  if (handleOrOptionId !== undefined || optionIndex !== undefined) {
    const handleStr = (handleOrOptionId || "").toString().trim().toLowerCase();
    const idxStr = optionIndex !== undefined ? optionIndex.toString() : "";

    const matchedConn = connections.find((c: any) => {
      if (!isSourceMatch(c)) return false;

      const optId = (c.optionId || "").toString().trim().toLowerCase();
      const srcHandle = (c.sourceHandle || c.handle || "").toString().trim().toLowerCase();

      return (
        (handleStr && (optId === handleStr || srcHandle === handleStr)) ||
        (handleStr &&
          (srcHandle === `option-${handleStr}` ||
            srcHandle === `opt-${handleStr}` ||
            srcHandle === `handle-${handleStr}`)) ||
        (idxStr &&
          (srcHandle === `option-${idxStr}` ||
            srcHandle === `opt-${idxStr}` ||
            srcHandle === `handle-${idxStr}` ||
            srcHandle === idxStr)) ||
        (handleStr && srcHandle.includes(handleStr))
      );
    });

    if (matchedConn) {
      return (
        matchedConn.targetNodeId ||
        (matchedConn as any).target ||
        ""
      ).toString().trim();
    }
  }

  const sourceConns = connections.filter((c: any) => isSourceMatch(c));
  if (sourceConns.length > 0) {
    return (
      sourceConns[0].targetNodeId ||
      (sourceConns[0] as any).target ||
      ""
    ).toString().trim();
  }

  return undefined;
};

const ExecuteFlowService = async ({
  ticket,
  messageBody,
  companyId,
  flowId
}: Request): Promise<boolean> => {
  try {
    const trimmedMsg = messageBody.trim().toLowerCase();
    const cacheKey = `ticket:${ticket.id}:flowState`;

    let activeState: { flowId: number; currentNodeId: string } | null = null;
    try {
      const rawState = await cacheLayer.get(cacheKey);
      if (rawState) {
        activeState = JSON.parse(rawState);
      }
    } catch (e) {}

    let flow: Flow | null = null;
    let nodes: FlowNode[] = [];
    let connections: FlowConnection[] = [];
    let currentNode: FlowNode | undefined = undefined;

    if (activeState) {
      flow = await Flow.findOne({
        where: { id: activeState.flowId, companyId }
      });
      if (flow) {
        try {
          nodes = typeof flow.nodes === "string" ? JSON.parse(flow.nodes) : flow.nodes;
          connections = typeof flow.connections === "string" ? JSON.parse(flow.connections) : flow.connections;
          currentNode = findNodeById(nodes, activeState!.currentNodeId);
        } catch (e) {}
      }
    }

    if (!currentNode) {
      const whereClause: any = { companyId };
      if (flowId) {
        whereClause.id = flowId;
      } else {
        whereClause.active = true;
      }

      const flows = await Flow.findAll({ where: whereClause });
      if (!flows || flows.length === 0) return false;

      for (const f of flows) {
        let fNodes: FlowNode[] = [];
        let fConns: FlowConnection[] = [];
        try {
          fNodes = typeof f.nodes === "string" ? JSON.parse(f.nodes) : f.nodes;
          fConns = typeof f.connections === "string" ? JSON.parse(f.connections) : f.connections;
        } catch (e) {
          continue;
        }

        if (!Array.isArray(fNodes) || fNodes.length === 0) continue;

        const triggerNode = fNodes.find(
          (n) => n.type === "trigger" && n.keyword && trimmedMsg.includes(n.keyword.toLowerCase())
        ) || fNodes.find((n) => n.type === "trigger" && (!n.keyword || n.keyword === "*"));

        if (triggerNode) {
          flow = f;
          nodes = fNodes;
          connections = fConns;
          let nextNodeId = triggerNode.targetNodeId;
          if (!nextNodeId) {
            const conn = connections.find((c) => c.sourceNodeId === triggerNode.id);
            if (conn) nextNodeId = conn.targetNodeId;
          }
          if (nextNodeId) {
            currentNode = findNodeById(nodes, nextNodeId);
            break;
          }
        }
      }
    }

    if (!currentNode || !flow) {
      return false;
    }

    // Classificar ticket como Lead no CRM
    const autoClassifySetting = await Setting.findOne({
      where: { key: "autoClassifyFlowBuilderLead", companyId }
    });
    const isAutoClassifyEnabled = autoClassifySetting ? autoClassifySetting.value === "enabled" : true;

    if (isAutoClassifyEnabled && !ticket.isLead) {
      const originLabel = ticket.channel === "instagram" ? "FlowBuilder - Instagram" : "FlowBuilder - WhatsApp";
      await ticket.update({
        isLead: true,
        leadOrigin: ticket.leadOrigin || originLabel,
        leadTemperature: ticket.leadTemperature || "warm"
      });
    }

    const visitedNodes = new Set<string>();
    let isOptionTransition = false;

    while (currentNode) {
      if (visitedNodes.has(currentNode.id)) {
        console.warn(`[FlowBuilder] Loop infinito detectado no nó ${currentNode.id}. Abortando execução.`);
        await cacheLayer.del(cacheKey);
        break;
      }
      visitedNodes.add(currentNode.id);

      if (currentNode.type === "message") {
        let textToSend = currentNode.content || "";
        textToSend = textToSend.replace(/{nome}/gi, ticket.contact.name || "Cliente");

        if (ticket.channel === "instagram") {
          await SendInstagramMessageService({
            body: textToSend,
            recipientId: ticket.contact.instagramId || ticket.contact.number,
            whatsapp: ticket.whatsapp
          });
        } else {
          await SendWhatsAppMessage({
            body: textToSend,
            ticket
          });
        }

        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

      } else if (currentNode.type === "buttons") {
        const buttonsList = currentNode.buttons || [];
        let matchedBtn: any = null;
        if (!isOptionTransition) {
          matchedBtn = buttonsList.find((btn, idx) => {
            const btnTxt = (btn.text || "").trim().toLowerCase();
            const num = (idx + 1).toString();
            return trimmedMsg === num || (btnTxt && trimmedMsg === btnTxt) || (btnTxt && trimmedMsg.includes(btnTxt));
          });
        }

        if (matchedBtn) {
          let btnTargetId = matchedBtn.targetNodeId;
          if (!btnTargetId) {
            btnTargetId = findTargetFromConnections(connections, currentNode.id, matchedBtn.id);
          }
          if (btnTargetId) {
            await cacheLayer.del(cacheKey);
            currentNode = findNodeById(nodes, btnTargetId);
            isOptionTransition = true;
            continue;
          }
        }

        let textToSend = "";
        if (currentNode.title) textToSend += `*${currentNode.title}*\n\n`;
        textToSend += currentNode.content || "Escolha uma opção:";
        if (currentNode.footer) textToSend += `\n\n_${currentNode.footer}_`;

        if (buttonsList && Array.isArray(buttonsList)) {
          textToSend += "\n\n";
          buttonsList.forEach((btn, idx) => {
            textToSend += `[ ${btn.text || `Opção ${idx + 1}`} ]\n`;
          });
        }

        textToSend = textToSend.replace(/{nome}/gi, ticket.contact.name || "Cliente");

        if (ticket.channel === "instagram") {
          await SendInstagramMessageService({
            body: textToSend,
            recipientId: ticket.contact.instagramId || ticket.contact.number,
            whatsapp: ticket.whatsapp
          });
        } else {
          await SendWhatsAppMessage({
            body: textToSend,
            ticket
          });
        }

        await cacheLayer.set(cacheKey, JSON.stringify({ flowId: flow.id, currentNodeId: currentNode.id }), "EX", 3600);
        return true;

      } else if (currentNode.type === "carousel") {
        if (currentNode.cards && Array.isArray(currentNode.cards)) {
          for (const card of currentNode.cards) {
            let cardMsg = `🎠 *${card.title}*\n${card.description}`;
            if (card.buttonText) cardMsg += `\n\n👉 [ ${card.buttonText} ]`;

            if (ticket.channel === "instagram") {
              await SendInstagramMessageService({
                body: cardMsg,
                recipientId: ticket.contact.instagramId || ticket.contact.number,
                whatsapp: ticket.whatsapp
              });
            } else {
              await SendWhatsAppMessage({
                body: cardMsg,
                ticket
              });
            }
          }
        }

        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "set_variable") {
        if (activeState && activeState.currentNodeId === currentNode.id) {
          await cacheLayer.del(cacheKey);
          let targetId = currentNode.targetNodeId;
          if (!targetId) {
            const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
            targetId = c?.targetNodeId;
          }
          currentNode = findNodeById(nodes, targetId);
          continue;
        }

        const varName = currentNode.variableName || "campo_personalizado";
        const varPrompt = currentNode.variablePrompt || `Por favor, digite o seu ${varName}:`;

        if (ticket.channel === "instagram") {
          await SendInstagramMessageService({
            body: varPrompt,
            recipientId: ticket.contact.instagramId || ticket.contact.number,
            whatsapp: ticket.whatsapp
          });
        } else {
          await SendWhatsAppMessage({
            body: varPrompt,
            ticket
          });
        }

        await cacheLayer.set(cacheKey, JSON.stringify({ flowId: flow.id, currentNodeId: currentNode.id }), "EX", 3600);
        return true;

      } else if (currentNode.type === "anti_ban") {
        const min = Number(currentNode.minDelaySeconds) || 3;
        const max = Number(currentNode.maxDelaySeconds) || 8;
        const randomDelaySec = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, randomDelaySec * 1000));

        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "menu" || currentNode.type === "list_menu") {
        const options = currentNode.options || [];
        let matchedOpt: any = null;
        let matchedOptIdx: number = -1;

        if (!isOptionTransition) {
          options.forEach((opt, idx) => {
            if (matchedOpt) return;
            const num = (opt.optionNumber || (idx + 1).toString()).trim().toLowerCase();
            const txt = (opt.text || "").trim().toLowerCase();
            const cleanIdx = (idx + 1).toString();

            if (
              trimmedMsg === num ||
              trimmedMsg === cleanIdx ||
              (txt && trimmedMsg === txt) ||
              (txt && trimmedMsg.includes(txt))
            ) {
              matchedOpt = opt;
              matchedOptIdx = idx;
            }
          });
        }

        if (matchedOpt) {
          let optTargetId = matchedOpt.targetNodeId || (matchedOpt as any).targetNodeIdOption;
          if (!optTargetId) {
            optTargetId = findTargetFromConnections(connections, currentNode.id, matchedOpt.id, matchedOptIdx);
          }
          if (optTargetId) {
            await cacheLayer.del(cacheKey);
            const nextNode = findNodeById(nodes, optTargetId);
            if (nextNode) {
              currentNode = nextNode;
              isOptionTransition = true;
              continue;
            }
          }
        }

        let menuText = currentNode.content ? `${currentNode.content}\n\n` : "Escolha uma opção:\n\n";
        if (options && Array.isArray(options)) {
          options.forEach((opt, idx) => {
            menuText += `${opt.optionNumber || idx + 1}. ${opt.text}\n`;
          });
        }

        if (ticket.channel === "instagram") {
          await SendInstagramMessageService({
            body: menuText,
            recipientId: ticket.contact.instagramId || ticket.contact.number,
            whatsapp: ticket.whatsapp
          });
        } else {
          await SendWhatsAppMessage({
            body: menuText,
            ticket
          });
        }

        await cacheLayer.set(cacheKey, JSON.stringify({ flowId: flow.id, currentNodeId: currentNode.id }), "EX", 3600);
        return true;

      } else if (currentNode.type === "transfer_queue") {
        await cacheLayer.del(cacheKey);
        if (currentNode.queueId) {
          await ticket.update({ queueId: currentNode.queueId, status: "pending" });
        }
        return true;

      } else if (currentNode.type === "close_ticket") {
        await cacheLayer.del(cacheKey);
        await ticket.update({ status: "closed" });
        return true;

      } else if (currentNode.type === "set_kanban") {
        if (currentNode.tagId) {
          await TicketTag.destroy({ where: { ticketId: ticket.id } });
          await TicketTag.create({ ticketId: ticket.id, tagId: currentNode.tagId });
        }
        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "pix_payment") {
        const val = Number(currentNode.pixValue) || 1.00;
        const pixCode = currentNode.pixCopyPaste || `00020126580014BR.GOV.BCB.PIX0136suporte@pjzap.com520400005303986540${val.toFixed(2)}5802BR5915PjZap Pagamento6009SAO PAULO62070503***6304`;
        const pixMsg = `📱 *Pagamento via Pix*\n\nValor: *R$ ${val.toFixed(2)}*\n\n*Copia e Cola:*\n\`\`\`${pixCode}\`\`\`\n\nApós realizar o pagamento, responda a esta mensagem para dar continuidade.`;
        
        if (ticket.channel === "instagram") {
          await SendInstagramMessageService({
            body: pixMsg,
            recipientId: ticket.contact.instagramId || ticket.contact.number,
            whatsapp: ticket.whatsapp
          });
        } else {
          await SendWhatsAppMessage({
            body: pixMsg,
            ticket
          });
        }

        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "condition") {
        const keyword = (currentNode.conditionKeyword || "").toLowerCase().trim();
        const match = Boolean(keyword && trimmedMsg.includes(keyword));
        let targetId = match ? currentNode.targetNodeIdTrue : currentNode.targetNodeIdFalse;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "webhook") {
        if (currentNode.webhookUrl) {
          try {
            const axios = require("axios");
            await axios.post(currentNode.webhookUrl, {
              contact: ticket.contact,
              ticket: {
                id: ticket.id,
                status: ticket.status,
                leadValue: ticket.leadValue,
                leadTemperature: ticket.leadTemperature,
                leadOrigin: ticket.leadOrigin,
                utmSource: ticket.utmSource,
                utmMedium: ticket.utmMedium,
                utmCampaign: ticket.utmCampaign
              },
              messageBody
            }, { timeout: 5000 });
          } catch (wErr: any) {
            console.error("Erro ao disparar Webhook no FlowBuilder:", wErr?.message || wErr);
          }
        }
        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "delay") {
        const ms = (Number(currentNode.delaySeconds) || 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, ms));

        let targetId = currentNode.targetNodeId;
        if (!targetId) {
          const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
          targetId = c?.targetNodeId;
        }
        currentNode = findNodeById(nodes, targetId);

        if (!currentNode) {
          await cacheLayer.del(cacheKey);
        }

      } else if (currentNode.type === "randomizer") {
        const outConnections = connections.filter((conn) => conn.sourceNodeId === currentNode?.id);
        if (outConnections.length > 0) {
          const randomConn = outConnections[Math.floor(Math.random() * outConnections.length)];
          currentNode = findNodeById(nodes, randomConn.targetNodeId);
        } else {
          await cacheLayer.del(cacheKey);
          break;
        }

      } else {
        await cacheLayer.del(cacheKey);
        break;
      }
    }

    return true;
  } catch (err) {
    console.error("Error executing flow:", err);
    return false;
  }
};

export default ExecuteFlowService;
