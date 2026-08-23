import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "../auth/auth.services.js";
import * as googleProvider from "../Googleoauthservices/google.provider.js";

// Register controller function
export const register = asyncHandler(async (req, res) => {
   await authService.register (req.body);
  return sendSuccess(res, 201, "User created successfully", null);
});

// Email verification controller function
export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body);
  return sendSuccess(res, 200, "Email verified successfully", result);
});

// Login controller function
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, 200, "User login successfully", result);
});

export const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body);
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

// Refresh access token controller function
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body);

  return sendSuccess(
    res,
    200,
    "Access token refreshed successfully",
    result
  );
});

// Logout controller function
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
  const { code, state } = req.query;
  const redirectBase = googleProvider.getGoogleSuccessRedirect();

  if (!code) {
    return res.redirect(`${redirectBase}/oauth/callback#error=missing_code`);
  }

  try {
    googleProvider.verifyState(state);

    const result = await authService.handleGoogleOAuthCallback(code);
    const { accessToken, refreshToken, user } = result;

    const redirectUrl =
      `${redirectBase}/oauth/callback#accessToken=${encodeURIComponent(accessToken)}` +
      `&refreshToken=${encodeURIComponent(refreshToken)}` +
      `&user=${encodeURIComponent(JSON.stringify(user))}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    const message = error?.message || "google_auth_failed";
    return res.redirect(`${redirectBase}/oauth/callback#error=${encodeURIComponent(message)}`);
  }
});