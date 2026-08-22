import Joi from "joi";
import  WasteType from "../../types/wastetype.js";
import BagSize from "../../types/bagsize.js";

export const createBookingSchema = Joi.object({
  waste_type: Joi.string()
    .valid(...Object.values(WasteType))
    .optional() 
    .messages({
      "any.only": `Waste type must be one of: ${Object.values(WasteType).join(", ")}`,
    }),

  pickup_address: Joi.string().trim().min(5).max(255).required(),

  quantity: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.positive": "Quantity must be greater than 0",
    }),

  pickup_date: Joi.date().iso().greater("now").required(),

  pickup_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/) // DB type is `time`, allow optional seconds
    .required()
    .messages({
      "string.pattern.base": "Pickup time must be in HH:mm or HH:mm:ss format",
    }),

  bagSize: Joi.string()
    .valid(...Object.values(BagSize))
    .required()
    .messages({
      "any.only": `Bag size must be one of: ${Object.values(BagSize).join(", ")}`,
    }),
});

