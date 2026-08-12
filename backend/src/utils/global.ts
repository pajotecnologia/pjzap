import { WAMessage, WASocket } from "baileys";
import { LIDMappingStore } from "baileys/lib/Signal/lid-mapping";

import { Store } from "../libs/store";
import { logger } from "./logger";
type Session = WASocket & {
  id?: number;
  store?: Store;
  lidMappingStore?: LIDMappingStore; // LIDMappingStore da v7.0.0-rc.2
};

export const map_msg = new Map<any, any>();


export const getContactIdentifier = (contact: any): string => {
  const num = (contact?.number || "").replace(/\D/g, "");
  console.log('Usando JID para envio:', num);
  return num;
};

// Função helper para construir o endereço de envio
export const buildContactAddress = (contact: any, isGroup: boolean): string => {
  if (!contact) return "";
  if (isGroup) {
    const num = contact.number || "";
    return num.includes("@g.us") ? num : `${num}@g.us`;
  }
  const contactId = getContactIdentifier(contact);
  if (contactId.includes("@")) {
    return contactId;
  }
  return `${contactId}@s.whatsapp.net`;
};

export const getJidFromMessage = async (message: WAMessage, wbot: Session): Promise<string> => {
  const { key } = message;
  const { remoteJid, remoteJidAlt, participantAlt, participant } = key;
  let jid = '';

  // Prioridade: JID > LID > PN
  if (remoteJid && remoteJid.includes('@s.whatsapp.net')) {
    jid = remoteJid;
  }
  if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
    jid = remoteJidAlt;
  }
  if (participant && participant.includes('@s.whatsapp.net')) {
    jid = participant;
  }

  if (participantAlt && participantAlt.includes('@s.whatsapp.net')) {
    jid = participantAlt;
  }

  const lidMappingStore = getLIDMappingStore(wbot);
  if (lidMappingStore) {
    const jidForPN = await lidMappingStore.getPNForLID(remoteJid);
    if (jidForPN && jidForPN.includes('@s.whatsapp.net')) {
      jid = jidForPN;
      console.log('JID encontrado via LIDMappingStore:', jid);
    } else {
      console.log('JID não encontrado na LIDMappingStore para o PN:', remoteJid);
    }
  } else {
    logger.error(`LIDMappingStore nao disponivel ou JID nao encontrado na mensagem, jid: ${!!jid}, lidMappingStore: ${!!lidMappingStore}`);
  }
  const jidSplitedPontos = jid.split(':')[0];
  const jidSplitedArroba = jid.split('@')[1];
  jid = jidSplitedPontos.includes('@') ? jid : `${jidSplitedPontos}@${jidSplitedArroba}`;
  console.log('JID final para envio:', jid);
  return jid;
};

// Função para acessar LIDMappingStore de forma segura
const getLIDMappingStore = (wbot: Session): any => {
  try {
    // Tentar acessar o LIDMappingStore de diferentes formas
    return wbot.lidMappingStore ||
      (wbot as any).lidMappingStore ||
      null;
  } catch (error) {
    logger.warn(`Erro ao acessar LIDMappingStore: ${error.message}`);
    return null;
  }
};
export const getLidFromMessage = async (message: WAMessage, wbot: Session): Promise<string> => {
  const { key } = message;
  const { remoteJid, remoteJidAlt, participantAlt, participant } = key;

  let lid = '';

  // Prioridade: LID > JID > PN
  if (remoteJid && remoteJid.includes('@lid')) {
    lid = remoteJid;
  }
  if (remoteJidAlt && remoteJidAlt.includes('@lid')) {
    lid = remoteJidAlt;
  }
  if (participant && participant.includes('@lid')) {
    lid = participant;
  }

  if (participantAlt && participantAlt.includes('@lid')) {
    lid = participantAlt;
  }

  const lidMappingStore = getLIDMappingStore(wbot);
  if (lidMappingStore && lid) {
    const lidForPN = await lidMappingStore.getLIDForPN(remoteJid);
    if (lidForPN && lidForPN.includes('@lid')) {
      lid = lidForPN;
      console.log('LID encontrado via LIDMappingStore:', lid);
    } else {
      console.log('LID não encontrado na LIDMappingStore para o PN:', remoteJid);
    }
  } else {
    logger.error(`LIDMappingStore nao disponivel ou LID nao encontrado na mensagem, lid: ${!!lid}, lidMappingStore: ${!!lidMappingStore}`);
  }
  return lid;
};