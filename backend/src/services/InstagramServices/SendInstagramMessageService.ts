import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
  body: string;
  recipientId: string;
  whatsapp: Whatsapp;
}

const SendInstagramMessageService = async ({
  body,
  recipientId,
  whatsapp
}: Request): Promise<any> => {
  try {
    const token = whatsapp.facebookUserToken;
    if (!token) {
      throw new AppError("Token da API do Facebook/Instagram não configurado na conexão.");
    }

    const payload = {
      recipient: { id: recipientId },
      message: { text: body }
    };

    const response = await fetch("https://graph.facebook.com/v18.0/me/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar mensagem no Instagram:", data);
      throw new AppError(data?.error?.message || "Erro no envio via Instagram Graph API");
    }

    return data;
  } catch (err: any) {
    console.error("SendInstagramMessageService error:", err);
    throw new AppError(err.message || "ERR_SENDING_INSTAGRAM_MSG");
  }
};

export default SendInstagramMessageService;
