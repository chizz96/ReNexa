import express from "express";
import { Router } from "express";
import * as authController from "../auth/auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { registerSchema, verifyEmailSchema, loginSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from "../auth/auth.validate.js";

const router = Router();



router.post("/register", validate(registerSchema), authController.register); 

router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);

router.post("/login", validate(loginSchema), authController.login);

router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);

router.post("/forgot-password",validate(forgotPasswordSchema),authController.forgotPassword);

router.post("/reset-password/:token",validate(resetPasswordSchema),authController.resetPassword);

router.post("/refresh-token",validate(refreshTokenSchema), authController.refreshAccessToken);

router.post("/logout", authController.logout);

router.get("/google", authController.googleLogin);

router.get("/google/callback", authController.googleCallback);




export default router
