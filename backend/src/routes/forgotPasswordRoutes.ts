import express from "express";
import * as ForgotController from "../controllers/ForgotController";
import { forgotPasswordRateLimiter } from "../middleware/loginRateLimiter";
const forgotsRoutes = express.Router();
forgotsRoutes.post(
  "/forgetpassword",
  forgotPasswordRateLimiter,
  ForgotController.store
);
forgotsRoutes.post(
  "/resetpasswords",
  forgotPasswordRateLimiter,
  ForgotController.resetPasswords
);
export default forgotsRoutes;
