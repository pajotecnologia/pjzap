import { Router } from "express";
import * as InstagramWebhookController from "../controllers/InstagramWebhookController";

const instagramRoutes = Router();

instagramRoutes.get("/facebook/webhook", InstagramWebhookController.index);
instagramRoutes.post("/facebook/webhook", InstagramWebhookController.listen);

export default instagramRoutes;
