import Joi from "joi";
import { UserRole } from "../../types/user.js";

export const updateProfileSchema = Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    phoneNumber: Joi.string()
      .trim()
      .pattern(/^[0-9]{10,15}$/)
      .optional()
      .messages({
        "string.pattern.base": "Phone number must be between 10 and 15 digits.",
      }),

    businessName: Joi.string()
      .trim()
      .max(150)
      .optional(),

    businessType: Joi.string()
      .trim()
      .max(100)
      .optional(),


    lga: Joi.string().trim().max(100).optional(),

    city: Joi.string().trim().max(100).optional(),
    
    addressText: Joi.string().trim().max(255).optional(),
  
    
    preferredLanguage: Joi.string()
      .trim()
      .max(50)
      .optional(),

    notificationsEnabled: Joi.boolean()
      .optional(),
  }).min(1);


// PATCH /users/account-type
export const setAccountTypeSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      "any.only": `role must be one of: ${Object.values(UserRole).join(", ")}`,
      "any.required": "role is required",
    }),
});

// PATCH /users/profile — household branch
const householdProfileSchema = Joi.object({
  role: Joi.string().valid(UserRole.HOUSEHOLD).required(),
  lga: Joi.string().max(100).required(),
  city: Joi.string().max(100).required(),
  residentialAddress: Joi.string().max(1000).required(),
});

// PATCH /users/profile — business branch
const businessProfileSchema = Joi.object({
  role: Joi.string().valid(UserRole.BUSINESS).required(),
  businessName: Joi.string().max(150).required(),
  businessType: Joi.string().max(100).required(),
  businesscity: Joi.string().max(100).required(),
  businessLga: Joi.string().max(100).required(),
  businessAddress: Joi.string().max(1000).required(),
});

// Picks the right schema based on payload.role, then validates against it
export const completeProfileSchema = Joi.alternatives()
  .conditional(Joi.object({ role: UserRole.HOUSEHOLD }).unknown(), {
    then: householdProfileSchema,
    otherwise: Joi.alternatives()
      .conditional(Joi.object({ role: UserRole.BUSINESS }).unknown(), {
        then: businessProfileSchema,
        otherwise: Joi.object({
          role: Joi.string()
            .valid(...Object.values(UserRole))
            .required()
            .messages({ "any.only": "role must be household or business" }),
        }),
      }),
  });
    