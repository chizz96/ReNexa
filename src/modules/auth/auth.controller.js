import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "../auth/auth.services.js";
import * as googleProvider from "../Googleoauthservices/google.provider.js";

// Register controller function
export const register = asyncHandler(async (req, res) => {
  const user = await authService.register (req.body);
  return sendSuccess(res, 201, "User created successfully", { user });
});

// Email verification controller function
export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body);
  return sendSuccess(res, 200, "Email verified successfully", null);
});

// Login controller function
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, 200, "User login successfully", result);
});

export const resendotp = asyncHandler(async (req, res) => {
  const result = await authService.resendotp(req.body);
  return sendSuccess(res, 200, "OTP resent successfully", result);
});

// Forgot password controller function
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return sendSuccess(res, 200, "Password reset link sent successfully", result);
});

// Reset password controller function
export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({token: req.params.token, ...req.body,});
  return sendSuccess(res, 200, "Password reset successfully", result);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body);

  return sendSuccess(
    res,
    200,
    "Access token refreshed successfully",
    result
  );
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout({
    userId: req.user.sub,
  });

  return sendSuccess(
    res,
    200,
    "Logged out successfully",
    null
  );
});

// Google OAuth controller functions
export const googleLogin = asyncHandler(async (req, res) => {
  const { url } = googleProvider.createGoogleAuthUrl();

  return res.redirect(url);
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) 
  {
    throw new AppError("Google authorization code is missing", 400, "GOOGLE_CODE_MISSING");
  }

  const result = await authService.handleGoogleOAuthCallback(code);

  return sendSuccess(res, 200, "Google authentication successful", result);
});


