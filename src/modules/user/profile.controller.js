import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as profileService from "./profile.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.sub);

  return sendSuccess(res, 200, "Profile retrieved successfully", profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.sub, req.body);

  return sendSuccess(res, 200, "Profile updated successfully",profile);
});


export const setAccountType = asyncHandler(async (req, res) => {
  const profile = await profileService.setAccountType(req.user.sub, req.body);
  return sendSuccess(res, 200, "Account type updated successfully", profile);
});

export const completeProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.completeProfile(req.user.sub, req.body);
  return sendSuccess(res, 200, "Profile completed successfully", profile);
});
