import Flow from "../../models/Flow";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Setting from "../../models/Setting";
import CreateMessageService from "../MessageServices/CreateMessageService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import SendInstagramMessageService from "../InstagramServices/SendInstagramMessageService";

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
  buttons?: Array<{ id: string; text: string }>;
  options?: Array<{ id: string; optionNumber: string; text: string; description?: string; targetNodeId: string }>;
  cards?: Array<{ title: string; description: string; imageUrl?: string; buttonText?: string }>;
  targetNodeId?: string;
}

interface FlowConnection {
  sourceNodeId: string;
  targetNodeId: string;
  optionId?: string;
}

const ExecuteFlowService = async ({
  ticket,
  messageBody,
  companyId,
  flowId
}: Request): Promise<boolean> => {
  try {
    const whereClause: any = { companyId };
    if (flowId) {
      whereClause.id = flowId;
    } else {
      whereClause.active = true;
    }

    const flows = await Flow.findAll({
      where: whereClause
    });

    if (!flows || flows.length === 0) {
      return false;
    }

    const trimmedMsg = messageBody.trim().toLowerCase();

    for (const flow of flows) {
      let nodes: FlowNode[] = [];
      let connections: FlowConnection[] = [];

      try {
        nodes = typeof flow.nodes === "string" ? JSON.parse(flow.nodes) : flow.nodes;
        connections = typeof flow.connections === "string" ? JSON.parse(flow.connections) : flow.connections;
      } catch (e) {
        continue;
      }

      if (!Array.isArray(nodes) || nodes.length === 0) continue;

      // 1. Procurar por nó Trigger que dê match com a mensagem de entrada
      const triggerNode = nodes.find(
        (n) => n.type === "trigger" && n.keyword && trimmedMsg.includes(n.keyword.toLowerCase())
      ) || nodes.find((n) => n.type === "trigger" && (!n.keyword || n.keyword === "*"));

      if (!triggerNode) continue;

      // 2. Classificar ticket como Lead no CRM se a opcao estiver ativada
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

      // Encontra próximo nó conectado ao Trigger
      let nextNodeId = triggerNode.targetNodeId;
      if (!nextNodeId) {
        const conn = connections.find((c) => c.sourceNodeId === triggerNode.id);
        if (conn) nextNodeId = conn.targetNodeId;
      }

      if (!nextNodeId) continue;

      let currentNode = nodes.find((n) => n.id === nextNodeId);
      const visitedNodes = new Set<string>();

      while (currentNode) {
        if (visitedNodes.has(currentNode.id)) {
          console.warn(`[FlowBuilder] Loop infinito detectado no nó ${currentNode.id}. Abortando execução.`);
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

          const messageData = {
            id: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            ticketId: ticket.id,
            contactId: ticket.contactId,
            body: textToSend,
            fromMe: true,
            read: true,
            mediaType: "chat"
          };
          await CreateMessageService({ messageData, companyId });

          let targetId = currentNode.targetNodeId;
          if (!targetId) {
            const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
            targetId = c?.targetNodeId;
          }
          currentNode = nodes.find((n) => n.id === targetId);

        } else if (currentNode.type === "buttons") {
          const buttonsList = currentNode.buttons || [];
          const matchedBtn = buttonsList.find((btn, idx) => {
            const btnTxt = (btn.text || "").trim().toLowerCase();
            const num = (idx + 1).toString();
            return trimmedMsg === num || (btnTxt && trimmedMsg === btnTxt) || (btnTxt && trimmedMsg.includes(btnTxt));
          });

          if (matchedBtn) {
            let btnTargetId = matchedBtn.targetNodeId;
            if (!btnTargetId) {
              const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id && conn.optionId === matchedBtn.id);
              btnTargetId = c?.targetNodeId;
            }
            if (btnTargetId) {
              currentNode = nodes.find((n) => n.id === btnTargetId);
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

          const messageData = {
            id: `flow_btn_${Date.now()}`,
            ticketId: ticket.id,
            contactId: ticket.contactId,
            body: textToSend,
            fromMe: true,
            read: true,
            mediaType: "chat"
          };
          await CreateMessageService({ messageData, companyId });
          return true;

        } else if (currentNode.type === "list_menu") {
          let listText = "";
          if (currentNode.title) listText += `📋 *${currentNode.title}*\n\n`;
          listText += currentNode.content || "Selecione um item da lista:\n\n";
          
          if (currentNode.options && Array.isArray(currentNode.options)) {
            currentNode.options.forEach((opt, idx) => {
              listText += `🔹 *${opt.optionNumber || idx + 1}. ${opt.text}*\n`;
              if (opt.description) listText += `   _${opt.description}_\n`;
            });
          }
          if (currentNode.footer) listText += `\n_${currentNode.footer}_`;

          if (ticket.channel === "instagram") {
            await SendInstagramMessageService({
              body: listText,
              recipientId: ticket.contact.instagramId || ticket.contact.number,
              whatsapp: ticket.whatsapp
            });
          } else {
            await SendWhatsAppMessage({
              body: listText,
              ticket
            });
          }

          const messageData = {
            id: `flow_list_${Date.now()}`,
            ticketId: ticket.id,
            contactId: ticket.contactId,
            body: listText,
            fromMe: true,
            read: true,
            mediaType: "chat"
          };
          await CreateMessageService({ messageData, companyId });
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
          currentNode = nodes.find((n) => n.id === targetId);

        } else if (currentNode.type === "set_variable") {
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
          currentNode = nodes.find((n) => n.id === targetId);

        } else if (currentNode.type === "menu" || currentNode.type === "list_menu") {
          // Verificar se a mensagem do cliente é uma resposta a uma das opções do menu
          const options = currentNode.options || [];
          const matchedOpt = options.find((opt, idx) => {
            const num = (opt.optionNumber || (idx + 1).toString()).trim().toLowerCase();
            const txt = (opt.text || "").trim().toLowerCase();
            return trimmedMsg === num || (txt && trimmedMsg === txt) || (txt && trimmedMsg.includes(txt));
          });

          if (matchedOpt) {
            let optTargetId = matchedOpt.targetNodeId;
            if (!optTargetId) {
              const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id && conn.optionId === matchedOpt.id);
              optTargetId = c?.targetNodeId;
            }
            if (optTargetId) {
              currentNode = nodes.find((n) => n.id === optTargetId);
              continue;
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

          const messageData = {
            id: `flow_menu_${Date.now()}`,
            ticketId: ticket.id,
            contactId: ticket.contactId,
            body: menuText,
            fromMe: true,
            read: true,
            mediaType: "chat"
          };
          await CreateMessageService({ messageData, companyId });
          return true;

        } else if (currentNode.type === "transfer_queue") {
          if (currentNode.queueId) {
            await ticket.update({ queueId: currentNode.queueId, status: "pending" });
          }
          return true;

        } else if (currentNode.type === "close_ticket") {
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
          currentNode = nodes.find((n) => n.id === targetId);

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
          currentNode = nodes.find((n) => n.id === targetId);

        } else if (currentNode.type === "condition") {
          const keyword = (currentNode.conditionKeyword || "").toLowerCase().trim();
          const match = Boolean(keyword && trimmedMsg.includes(keyword));
          let targetId = match ? currentNode.targetNodeIdTrue : currentNode.targetNodeIdFalse;
          if (!targetId) {
            const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
            targetId = c?.targetNodeId;
          }
          currentNode = nodes.find((n) => n.id === targetId);

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
          currentNode = nodes.find((n) => n.id === targetId);

        } else if (currentNode.type === "delay") {
          const ms = (Number(currentNode.delaySeconds) || 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, ms));

          let targetId = currentNode.targetNodeId;
          if (!targetId) {
            const c = connections.find((conn) => conn.sourceNodeId === currentNode?.id);
            targetId = c?.targetNodeId;
          }
          currentNode = nodes.find((n) => n.id === targetId);

        } else if (currentNode.type === "randomizer") {
          const outConnections = connections.filter((conn) => conn.sourceNodeId === currentNode?.id);
          if (outConnections.length > 0) {
            const randomConn = outConnections[Math.floor(Math.random() * outConnections.length)];
            currentNode = nodes.find((n) => n.id === randomConn.targetNodeId);
          } else {
            break;
          }

        } else {
          break;
        }
      }

      return true;
    }

    return false;
  } catch (err) {
    console.error("Error executing flow:", err);
    return false;
  }
};

export default ExecuteFlowService;
