import { AppDataSource } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import logger from "../../utils/logger.js";

const pickerRepository = AppDataSource.getRepository("Picker");

export const createPicker = async (payload) => {
  const existing = await pickerRepository.findOne({
    where: { phoneNumber: payload.phoneNumber },
  });

  if (existing) {
    throw new AppError("A picker with this phone number already exists", 409, "PICKER_EXISTS");
  }

  const picker = pickerRepository.create({
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
    clientType: payload.clientType,
    zone: payload.zone,
  });

  const savedPicker = await pickerRepository.save(picker);

  logger.info("Picker created", { pickerId: savedPicker.id });

  return savedPicker;
};

export const listPickers = async (filters = {}) => {
  const where = {};

  if (filters.zone) where.zone = filters.zone;
  if (filters.clientType) where.clientType = filters.clientType;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return await pickerRepository.find({
    where,
    order: { createdAt: "DESC" },
  });
};

export const getPickerById = async (pickerId) => {
  const picker = await pickerRepository.findOne({ where: { id: pickerId } });

  if (!picker) {
    throw new AppError("Picker not found", 404, "PICKER_NOT_FOUND");
  }

  return picker;
};

export const updatePicker = async (pickerId, payload) => {
  const picker = await pickerRepository.findOne({ where: { id: pickerId } });

  if (!picker) {
    throw new AppError("Picker not found", 404, "PICKER_NOT_FOUND");
  }

  if (payload.phoneNumber && payload.phoneNumber !== picker.phoneNumber) {
    const existing = await pickerRepository.findOne({
      where: { phoneNumber: payload.phoneNumber },
    });

    if (existing) {
      throw new AppError("A picker with this phone number already exists", 409, "PICKER_EXISTS");
    }
  }

  Object.assign(picker, payload);

  const savedPicker = await pickerRepository.save(picker);

  logger.info("Picker updated", { pickerId: savedPicker.id });

  return savedPicker;
};

export const deletePicker = async (pickerId) => {
  const picker = await pickerRepository.findOne({ where: { id: pickerId } });

  if (!picker) {
    throw new AppError("Picker not found", 404, "PICKER_NOT_FOUND");
  }

  await pickerRepository.softDelete(pickerId);

  logger.info("Picker deleted", { pickerId });

  return { id: pickerId };
};