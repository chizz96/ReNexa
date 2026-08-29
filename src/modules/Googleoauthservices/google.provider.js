import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../utils/AppError.js";

const GOOGLE_STATE_SECRET =
  process.env.GOOGLE_STATE_SECRET ||
  process.env.JWT_SECRET;

const getGoogleCallbackUrl = () =>
  process.env.GOOGLE_CALLBACK_URL;


const getGoogleSuccessRedirect = () =>
  process.env.GOOGLE_SUCCESS_REDIRECT;

const getOAuthClient = () => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET
  ) {
    throw new AppError(
      "Google OAuth is not configured",
      503,
      "GOOGLE_NOT_CONFIGURED"
    );
  }

  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleCallbackUrl()
  );
};

const createSignedState = () => {
  if (!GOOGLE_STATE_SECRET) {
    throw new AppError(
      "Google OAuth state secret is not configured",
      503,
      "GOOGLE_NOT_CONFIGURED"
    );
  }

  const nonce = crypto
    .randomBytes(20)
    .toString("hex");

  const timestamp = Date.now().toString();

  const payload = `${nonce}.${timestamp}`;

  const signature = crypto
    .createHmac(
      "sha256",
      GOOGLE_STATE_SECRET
    )
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
};

export const verifyState = (state) => {
  if (!state || !GOOGLE_STATE_SECRET) {
    throw new AppError(
      "Invalid Google authentication state",
      400,
      "INVALID_GOOGLE_STATE"
    );
  }

  const parts = state.split(".");

  if (parts.length !== 3) {
    throw new AppError(
      "Invalid Google authentication state",
      400,
      "INVALID_GOOGLE_STATE"
    );
  }

  const [nonce, timestamp, signature] = parts;

  const payload = `${nonce}.${timestamp}`;

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      GOOGLE_STATE_SECRET
    )
    .update(payload)
    .digest("hex");

  const signatureBuffer =
    Buffer.from(signature, "hex");

  const expectedBuffer =
    Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length !==
      expectedBuffer.length ||
    !crypto.timingSafeEqual(
      signatureBuffer,
      expectedBuffer
    )
  ) {
    throw new AppError(
      "Invalid Google authentication state",
      400,
      "INVALID_GOOGLE_STATE"
    );
  }

  const age =
    Date.now() - Number(timestamp);

  if (
    !Number.isFinite(age) ||
    age < 0 ||
    age > 10 * 60 * 1000
  ) {
    throw new AppError(
      "Google authentication session expired",
      400,
      "GOOGLE_STATE_EXPIRED"
    );
  }

  return true;
};

const mapGooglePayload = (payload) => {
  if (!payload?.email) {
    throw new AppError(
      "Google account has no email",
      400,
      "GOOGLE_AUTH_FAILED"
    );
  }

  if (!payload.email_verified) {
    throw new AppError(
      "Google email is not verified",
      400,
      "GOOGLE_EMAIL_NOT_VERIFIED"
    );
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    firstName:
      payload.given_name || "User",
    lastName:
      payload.family_name || "",
    profilePicture:
      payload.picture || null,
  };
};

export const createGoogleAuthUrl = () => {
  const state = createSignedState();

  const client = getOAuthClient();

  const url = client.generateAuthUrl({
    access_type: "online",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    state,
    prompt: "select_account",
  });

  return {
    url,
    state,
  };
};

export const exchangeCodeForGoogleProfile =
  async (code) => {
    try {
      const client =
        getOAuthClient();

      const { tokens } =
        await client.getToken(code);

      if (!tokens.id_token) {
        throw new AppError(
          "Google did not return an ID token",
          400,
          "GOOGLE_AUTH_FAILED"
        );
      }

      const ticket =
        await client.verifyIdToken({
          idToken: tokens.id_token,
          audience:
            process.env.GOOGLE_CLIENT_ID,
        });

      return mapGooglePayload(
        ticket.getPayload()
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error(
        "Google OAuth Error:",
        error
      );

      throw new AppError(
        "Google authentication failed",
        401,
        "GOOGLE_AUTH_FAILED"
      );
    }
  };

export { getGoogleSuccessRedirect };