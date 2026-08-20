import { AppDataSource } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { User } from "../../database/entities/user.entities.js"
import  logger  from "../../utils/logger.js";
import { UserRole } from "../../types/user.js";

const userRepo = AppDataSource.getRepository("User");

import { UserRole } from "../../types/user.js";

export const getProfile = async (targetUserId) => {
  const user = await userRepo.findOne({
    where: { id: targetUserId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      // household fields
      lga: true,
      city: true,
      residentialAddress: true,
      // business fields
      businessName: true,
      businessType: true,
      businessLga: true,
      businesscity: true,
      businessAddress: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  // Shape the response based on role, rather than dumping every column
  const userDetails = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.role === UserRole.HOUSEHOLD) {
    return {
      ...userDetails,
      lga: user.lga,
      city: user.city,
      residentialAddress: user.residentialAddress,
    };
  }

  if (user.role === UserRole.BUSINESS) {
    return {
      ...userDetails,
      businessName: user.businessName,
      businessType: user.businessType,
      businessLga: user.businessLga,
      businesscity: user.businesscity,
      businessAddress: user.businessAddress,
    };
  }

  // fallback for any other role (e.g. admin, unset role)
  return userDetails;
};


export const UpdateProfile = async (targetUserId, payload) => {
  const user = await userRepo.findOne({
    where: { id: targetUserId },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    businessName,
    businessType,
    lga,
    city,
    businesscity,
    businessLga,
    businessAddress,
    residentialAddress,
  } = payload;

  if (phoneNumber && phoneNumber !== user.phoneNumber) {
    const existingPhone = await userRepo.findOne({
      where: { phoneNumber },
    });

    if (existingPhone) {
      throw new AppError(
        "Phone number already exists",
        409,
        "PHONE_NUMBER_ALREADY_EXISTS"
      );
    }
  }

  // Fields common to every role
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

  // Only touch role-specific fields that match the user's actual role,
  // so an admin can't accidentally write business fields onto a household user
  if (user.role === UserRole.HOUSEHOLD) {
    if (lga !== undefined) user.lga = lga;
    if (city !== undefined) user.city = city;
    if (residentialAddress !== undefined) user.residentialAddress = residentialAddress;
  }

  if (user.role === UserRole.BUSINESS) {
    if (businessName !== undefined) user.businessName = businessName;
    if (businessType !== undefined) user.businessType = businessType;
    if (businesscity !== undefined) user.businesscity = businesscity;
    if (businessLga !== undefined) user.businessLga = businessLga;
    if (businessAddress !== undefined) user.businessAddress = businessAddress;
  }

  await userRepo.save(user);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    ...(user.role === UserRole.HOUSEHOLD && {
      lga: user.lga,
      city: user.city,
      residentialAddress: user.residentialAddress,
    }),
    ...(user.role === UserRole.BUSINESS && {
      businessName: user.businessName,
      businessType: user.businessType,
      businesscity: user.businesscity,
      businessLga: user.businessLga,
      businessAddress: user.businessAddress,
    }),
    updatedAt: user.updatedAt,
  };
};


export const setAccountType = async (userId, { role }) => {
  if (!Object.values(UserRole).includes(role)) {
    throw new AppError("Invalid account type", 400, "INVALID_ROLE");
  }

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  user.role = role;
  user.onboardingStep = "ACCOUNT_TYPE";
  await userRepo.save(user);

  return { user: sanitizeUser(user) };
};



export const completeProfile = async (userId, payload) => {
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  if (!user.role) {
    throw new AppError("Account type not selected yet", 400, "ROLE_NOT_SET");
  }

  if (user.role === UserRole.HOUSEHOLD) {
    const { lga, city, residentialAddress } = payload;
    if (!lga || !city || !residentialAddress) {
      throw new AppError("Missing household profile fields", 400, "VALIDATION_ERROR");
    }
    Object.assign(user, { lga, city, residentialAddress });
  } else if (user.role === UserRole.BUSINESS_OWNER) {
    const { businessName, businessType, businesscity, businessLga, businessAddress } = payload;
    if (!businessName || !businessType || !businesscity || !businessLga || !businessAddress) {
      throw new AppError("Missing business profile fields", 400, "VALIDATION_ERROR");
    }
    Object.assign(user, { businessName, businessType, businesscity, businessLga, businessAddress });
  }

  user.profileCompleted = true;
  user.onboardingStep = "PROFILE_COMPLETE";
  await userRepo.save(user);

  logger.info("Account created", {userId: user.id, zone: user.role === UserRole.HOUSEHOLD ? user.lga : user.businessLga,role: user.role,});

  
  return { user: sanitizeUser(user) };
};

