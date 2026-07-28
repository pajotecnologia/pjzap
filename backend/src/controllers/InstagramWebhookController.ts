import { Request, Response } from "express";
import ProcessInstagramWebhookService from "../services/InstagramServices/ProcessInstagramWebhookService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || "whaticket";

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  return res.sendStatus(400);
};

export const listen = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { body } = req;

    if (body.object === "page" || body.object === "instagram") {
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          const messagingEvents = entry.messaging || entry.standby;
          if (messagingEvents && Array.isArray(messagingEvents)) {
            for (const messaging of messagingEvents) {
              await ProcessInstagramWebhookService(messaging);
            }
          }
        }
      }
      return res.status(200).send("EVENT_RECEIVED");
    }

    return res.sendStatus(404);
  } catch (error) {
    console.error("InstagramWebhookController error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
