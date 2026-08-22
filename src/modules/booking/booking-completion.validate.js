import Joi from "joi";
import { CompletionStatus } from "../../types/bookingstatus.js";

export const completeBookingSchema = Joi.object({
  bagSize: Joi.string()
    .valid(...Object.values(BagSize))
    .optional()
    .messages({
      "any.only": `Bag size must be one of: ${Object.values(BagSize).join(", ")}`,
    }),

  completion_status: Joi.string()
    .valid(...Object.values(CompletionStatus))
    .required(),
});