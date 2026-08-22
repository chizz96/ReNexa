import Joi from "joi";
import { ClientType } from "../../types/clienttype.js";
import { Zone } from "../../types/zone.js";

export const createPickerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Full name is required",
  }),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "string.empty": "Phone number is required",
    }),

  clientType: Joi.string()
    .valid(...Object.values(ClientType))
    .required()
    .messages({
      "any.only": `Client type must be one of: ${Object.values(ClientType).join(", ")}`,
      "any.required": "Client type is required",
    }),

  zone: Joi.string()
    .valid(...Object.values(Zone))
    .required()
    .messages({
      "any.only": `Zone must be one of: ${Object.values(Zone).join(", ")}`,
      "any.required": "Zone is required",
    }),
});

export const updatePickerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^\+?[0-9]{7,15}$/)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),

  clientType: Joi.string()
    .valid(...Object.values(ClientType))
    .messages({
      "any.only": `Client type must be one of: ${Object.values(ClientType).join(", ")}`,
    }),

  zone: Joi.string()
    .valid(...Object.values(Zone))
    .messages({
      "any.only": `Zone must be one of: ${Object.values(Zone).join(", ")}`,
    }),

  isActive: Joi.boolean(),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update the picker",
  });

export const listPickersQuerySchema = Joi.object({
  zone: Joi.string().valid(...Object.values(Zone)),
  clientType: Joi.string().valid(...Object.values(ClientType)),
  isActive: Joi.boolean(),
});