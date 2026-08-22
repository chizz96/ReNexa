import Joi from "joi";
import { UserRole } from "../../types/user.js";



export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50),
  lastName: Joi.string().trim().min(1).max(50),
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^(\+234|0)[789][01]\d{8}$/)
    .message("Phone number must be a valid Nigerian phone number"),

  // Household fields
  lga: Joi.string().trim().max(100),
  city: Joi.string().trim().max(100),
  residentialAddress: Joi.string().trim().max(255),

  // Business fields
  businessName: Joi.string().trim().max(150),
  businessType: Joi.string().trim().max(100),
  businesscity: Joi.string().trim().max(100),
  businessLga: Joi.string().trim().max(100),
  businessAddress: Joi.string().trim().max(255),
})
  .min(1) // at least one field must be provided
  .messages({
    "object.min": "At least one field must be provided to update",
  });



// PATCH /users/account-type
export const setAccountTypeSchema = Joi.object({
  role: Joi.string()
    .valid(UserRole.HOUSEHOLD, UserRole.BUSINESS_OWNER)
    .required()
    .messages({
      "any.only": "role must be household or business_owner",
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
  role: Joi.string().valid(UserRole.BUSINESS_OWNER).required(),
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
      .conditional(Joi.object({ role: UserRole.BUSINESS_OWNER }).unknown(), {
        then: businessProfileSchema,
        otherwise: Joi.object({
          role: Joi.string()
            .valid(...Object.values(UserRole))
            .required()
            .messages({ "any.only": "role must be household or business" }),
        }),
      }),
  });
    