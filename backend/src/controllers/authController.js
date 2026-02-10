import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { toPublicUser } from "../utils/publicUser.js";
import { handleError } from "../utils/errorHandler.js";

const buildToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  if (!secret) {
    const err = new Error("JWT_SECRET is not set");
    err.code = "JWT_SECRET_MISSING";
    throw err;
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn });
};

const handleAuthError = (err, res) => {
  if (err?.code === "JWT_SECRET_MISSING") {
    return res.status(500).json({ message: "JWT_SECRET is not set" });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Email or username already in use" });
  }
  return handleError(err, res);
};

// -------- reset helpers --------
const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const generateResetToken = () => crypto.randomBytes(32).toString("hex");

// -------- controllers --------
const register = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedUsername = String(username).trim();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Email or username already in use" });
    }

    const user = new User({
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      name,
    });

    await user.save();

    const token = buildToken(user._id);
    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    return handleAuthError(err, res);
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password || (!email && !username)) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const query = email
      ? { email: String(email).toLowerCase().trim() }
      : { username: String(username).trim() };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = buildToken(user._id);
    return res.status(200).json({ token, user: toPublicUser(user) });
  } catch (err) {
    return handleAuthError(err, res);
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    return handleAuthError(err, res);
  }
};

// POST /auth/forgot-password
// body: { identifier: "emailOrUsername" }
const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    // Always same response (do not reveal whether user exists)
    const okResponse = () =>
      res
        .status(200)
        .json({ message: "If the account exists, we sent a reset link." });

    if (!identifier || typeof identifier !== "string") {
      return okResponse();
    }

    const value = identifier.trim();
    if (!value) return okResponse();

    const isEmail = value.includes("@");
    const query = isEmail
      ? { email: value.toLowerCase() }
      : { username: value };

    const user = await User.findOne(query).select(
      "+resetPasswordTokenHash +resetPasswordExpiresAt",
    );
    if (!user) return okResponse();

    const rawToken = generateResetToken();
    const tokenHash = sha256(rawToken);

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${frontend}/reset-password?token=${rawToken}`;

    // TODO: send link via email
    // console.log("RESET_LINK:", link);

    return okResponse();
  } catch (err) {
    // Even on error, return generic success message
    console.error("FORGOT_PASSWORD_ERROR:", err);
    return res
      .status(200)
      .json({ message: "If the account exists, we sent a reset link." });
  }
};

// POST /auth/reset-password
// body: { token: "...", password: "NewPassword123!" }
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const tokenHash = sha256(token);

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+password +resetPasswordTokenHash +resetPasswordExpiresAt");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password; // will be hashed by pre('save')
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    // Instagram-like behavior: ask user to login with new password
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return handleAuthError(err, res);
  }
};

export { register, login, me, forgotPassword, resetPassword };
