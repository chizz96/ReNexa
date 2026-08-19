import { AppDataSource } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { User } from "../../database/entities/user.entities.js"

const userRepository = AppDataSource.getRepository("User");

export const getProfile = async (userId) => {
  const user = await userRepository.findOne({where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      businessName: true,
      businessType: true,
      address: true,
      city: true,
      state: true,
      country: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  return user;
};

export const updateProfile = async (userId, payload) => {
  const user = await userRepository.findOne({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    businessName,
    businessType,
    lga,
    city,
    addressText,
  } = payload;

  if (phoneNumber && phoneNumber !== user.phoneNumber) {
    const existingPhone = await userRepository.findOne({
      where: {
        phoneNumber,
      },
    });

    if (existingPhone) {
      throw new AppError(
        "Phone number already exists",
        409,
        "PHONE_NUMBER_ALREADY_EXISTS"
      );
    }
  }

  if (firstName !== undefined) {
    user.firstName = firstName;
  }

  if (lastName !== undefined) {
    user.lastName = lastName;
  }

  if (phoneNumber !== undefined) {
    user.phoneNumber = phoneNumber;
  }

  if (businessName !== undefined) {
    user.businessName = businessName;
  }

  if (businessType !== undefined) {
    user.businessType = businessType;
  }

  if (lga !== undefined) {
    user.lga = lga;
  }


  if (city !== undefined) {
    user.city = city;
  }

  if (addressText !== undefined) {
    user.addressText = addressText;
  }

  
  await userRepository.save(user);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    businessName: user.businessName,
    businessType: user.businessType,
    lga: user.lga,
    city: user.city,
    addressText: user.addressText,
    role: user.role,
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
  } else if (user.role === UserRole.BUSINESS) {
    const { businessName, businessType, businesscity, businessLga, businessAddress } = payload;
    if (!businessName || !businessType || !businesscity || !businessLga || !businessAddress) {
      throw new AppError("Missing business profile fields", 400, "VALIDATION_ERROR");
    }
    Object.assign(user, { businessName, businessType, businesscity, businessLga, businessAddress });
  }

  user.profileCompleted = true;
  user.onboardingStep = "PROFILE_COMPLETE";
  await userRepo.save(user);

  logger.info("Account created", { userId: user.id, zone:user.lga, role: user.role });

  
  return { user: sanitizeUser(user) };
};

