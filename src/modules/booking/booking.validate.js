import Joi from "joi";
import { ConfirmationStatus } from "../../types/bookingstatus.js";

export const createBookingSchema = Joi.object({
  waste_type: Joi.string()
    .trim()
    .max(50)
    .optional(),

  quantity: Joi.number()
    .positive()
    .optional(),

  lga: Joi.string()
    .trim()
    .max(50)
    .required(),

  area: Joi.string()
    .trim()
    .max(100)
    .required(),

  address_text: Joi.string()
    .trim()
    .required(),

  time_window_start: Joi.date()
    .required(),

  time_window_end: Joi.date()
    .greater(Joi.ref("time_window_start"))
    .required()
    .messages({
      "date.greater":
        "End time must be after start time",
    }),
});

export const confirmBookingSchema = Joi.object({
  confirmationStatus: Joi.string()
    .valid( 
      ConfirmationStatus.HOUSEHOLD_CONFIRMED,
      ConfirmationStatus.DISPUTED)
    .required()
    .messages({
      "any.only": "Invalid confirmation status",
      "any.required": "Confirmation status is required",
    }),
});