import bcrypt from "bcrypt";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { User } from "../../database/entities/user.entities.js"
import { AppDataSource } from "../../config/db.js"
import { AppError } from "../../utils/AppError.js";
import  { newId } from '../../utils/id.js';
import { AuthProvider } from "../../types/authprovider.js";
import { sendTemplateEmail } from "../../utils/email.utils.js";
import { generateResetToken } from "../../utils/resetPassword.js";
import { exchangeCodeForGoogleProfile} from "../Googleoauthservices/google.provider.js";
import  logger  from "../../utils/logger.js";


const userRepo = AppDataSource.getRepository("User")

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


const SALT_ROUNDS = 10;


const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function issueTokens(user) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload,  process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });

  const jti = newId(); 
  const refreshToken = jwt.sign({ sub: user.id, type: 'refresh', jti },  process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  await userRepo.update({ id: user.id }, { currentRefreshTokenHash: hashToken(refreshToken) });

  return { accessToken, refreshToken };
}

// function for user registration
export const register = async ({ firstName, lastName, email, password, confirmPassword, phoneNumber }) => {
  const existingUser = await userRepo.findOne({ where: { email } });

  if (existingUser) {
    throw new AppError("User already exists", 409, "DUPLICATE_USER");
  }

  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400, "PASSWORD_MISMATCH");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

   const user = await userRepo.save(
    userRepo.create({
      id : newId(),
      email,
      phoneNumber,
      password: hashedPassword,
      otp,
      otpExpiry,
      firstName,
      lastName,
      authProvider: AuthProvider.LOCAL,
    }),
  );


  sendTemplateEmail(email, "Email Verification", "register", {
    firstName,
    lastName,
    otp,
  });

  return{user}


};



//function for email verification

export const verifyEmail = async ({ otp }) => {
  const user = await userRepo.findOne({where: { otp },});
  if (!user) {
    throw new AppError("Invalid OTP", 400, "INVALID_OTP");
  }

  if (user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired", 400, "OTP_EXPIRED");
  }

  await userRepo.update({ id: user.id },{isVerified: true, otp: null, otpExpiry: null,});

  sendTemplateEmail(user.email,"Email Verified Successfully","verify-email",{
      firstName: user.firstName
    }
  );


  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };

  return {
    message: "Email verified successfully",
  };

};


//function for login
export const login = async ({ email, password }) => {
  const user = await userRepo
  .createQueryBuilder("user")
  .where("user.email = :email", { email })
  .getOne();

  if (!user) {
     throw new AppError("Invalid email or password", 400, "INVALID_CREDENTIALS");
  }

 if (user.authProvider === AuthProvider.GOOGLE) {
    throw new AppError("Please sign in with Google", 400, "USE_GOOGLE_SIGNIN");
  }

  if (!user.password) {
    throw new AppError("Invalid email or password", 400, "INVALID_CREDENTIALS");
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email before signing in", 400, "EMAIL_NOT_VERIFIED",);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 400, "INVALID_CREDENTIALS");
  }

 return {
    user: sanitizeUser(user),
    message: "Registration successful, please verify your email",
  };
};

// function for resending OTP
export const resendOtp = async ({ email }) => {

  const user = await userRepo.findOne({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await userRepo.update(
    { id: user.id },
    {
      otp,
      otpExpiry,
    }
  );

  await sendTemplateEmail(
    user.email,
    "Your New Verification Code",
    "resend-otp",
    {
      firstName: user.firstName,
      lastName: user.lastName,
      otp,
    }
  );

  return {
    message: "OTP resent successfully",
  };

};



// function for refreshing access token
export const refreshAccessToken = async ({ refreshToken }) => {
  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (payload.type !== "refresh") {
    throw new AppError("Invalid token type", 401, "INVALID_REFRESH_TOKEN");
  }

  const user = await userRepo.findOne({ where: { id: payload.sub } });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const incomingHash = hashToken(refreshToken);

  if (!user.currentRefreshTokenHash || incomingHash !== user.currentRefreshTokenHash) {
    
    await userRepo.update({ id: user.id }, { currentRefreshTokenHash: null });
    throw new AppError("Refresh token reuse detected — please log in again", 401, "REFRESH_TOKEN_REUSE");
  }

  const tokens = await issueTokens(user); // mints + persists a new hash, invalidating this one

  return { user: sanitizeUser(user), ...tokens };
};


// function for logout
export const logout = async ({ userId } = {}) => {
  if (userId) {
    await userRepo.update({ id: userId }, { currentRefreshTokenHash: null });
  }

  return {
    message: "Logged out successfully",
  };
};


// function for forgot password
export const forgotPassword = async ({ email }) => {
  const user = await userRepo.findOne({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const { resetToken, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

  await userRepo.save(user);

  const resetUrl = `https://renexa.onrender.com/api/auth/reset-password/${resetToken}`;

  sendTemplateEmail(user.email, "Reset Password", "forgetPassword",{
    firstName:user.firstName,
    resetUrl,
  });

  return {
    message: "Password reset link sent successfully",
  };
};


// function for reset password
export const resetPassword = async ({ token, password, confirmPassword }) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await userRepo.findOne({
    where: {
      resetPasswordToken: hashedToken,
    },
  });

  if (!user) {
    throw new AppError("Invalid reset token", 400, "INVALID_TOKEN");
  }

  if (user.resetPasswordExpires < new Date()) {
    throw new AppError("Reset token has expired", 400, "TOKEN_EXPIRED");
  }

  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400, "PASSWORDS_DO_NOT_MATCH");
  }

  user.password = await bcrypt.hash(password, SALT_ROUNDS);

  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await userRepo.save(user);

  sendTemplateEmail(user.email, "Password reset successfully", "passwordreset",{
    firstName: user.firstName
  });

  return {
    message: "Password reset successfully",
  };
};


export const sanitizeUser = (user) => {
  const { password, otp, verificationToken, currentRefreshTokenHash, ...safeUser } = user;
  return safeUser;
};

// Google OAuth services

export const authenticateGoogleProfile = async (profile) => {
  // Check if this Google account already exists
  let user = await userRepo.findOne({
    where: {
      googleId: profile.googleId,
    },
  });

  // Google account doesn't exist yet
  if (!user) {
    // Check whether the email already belongs to a Renexa account
    user = await userRepo.findOne({
      where: {
        email: profile.email,
      },
    });

    if (user) {
      // Existing local account — link Google to it
      user.googleId = profile.googleId;
      user.isVerified = true;

      if (user.authProvider === AuthProvider.LOCAL) {
        user.authProvider = AuthProvider.HYBRID;
      }

      if (!user.profilePicture && profile.profilePicture) {
        user.profilePicture = profile.profilePicture;
      }

      user = await userRepo.save(user);
    } else {
      // Completely new Google user
      user = await userRepo.save(
        userRepo.create({
          id: newId(),
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          googleId: profile.googleId,
          profilePicture: profile.profilePicture,
          authProvider: AuthProvider.GOOGLE,
          isVerified: true,

          // Google users don't need a local password
          password: null,

          // Give Google users a default role
          role: "household",
        })
      );
    }
  }

  const tokens = await issueTokens(user);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const handleGoogleOAuthCallback = async (code) => {
  const profile = await exchangeCodeForGoogleProfile(code);

  return authenticateGoogleProfile(profile);
};
