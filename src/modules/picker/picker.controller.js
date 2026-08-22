import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as pickerService from "./picker.service.js";

export const createPicker = asyncHandler(async (req, res) => {
  const picker = await pickerService.createPicker(req.body);

  return sendSuccess(res, 201, "Picker created successfully", picker);
});

export const listPickers = asyncHandler(async (req, res) => {
  const pickers = await pickerService.listPickers(req.query);

  return sendSuccess(res, 200, "Pickers retrieved successfully", pickers);
});

export const getPicker = asyncHandler(async (req, res) => {
  const picker = await pickerService.getPickerById(req.params.pickerId);

  return sendSuccess(res, 200, "Picker retrieved successfully", picker);
});

export const updatePicker = asyncHandler(async (req, res) => {
  const picker = await pickerService.updatePicker(req.params.pickerId, req.body);

  return sendSuccess(res, 200, "Picker updated successfully", picker);
});

export const deletePicker = asyncHandler(async (req, res) => {
  const result = await pickerService.deletePicker(req.params.pickerId);

  return sendSuccess(res, 200, "Picker deleted successfully", result);
});