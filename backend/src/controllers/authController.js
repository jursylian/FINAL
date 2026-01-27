import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

const toPublicUser = (userDoc) => {
  const obj = userDoc.toObject();
  delete obj.password;
  return obj;
};

const handleAuthError = (err, res) => {
  console.error("AUTH_ERROR:", err);

  if (err?.code === "JWT_SECRET_MISSING") {
    return res.status(500).json({ message: "JWT_SECRET is not set" });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      message: err.message,
      details: err.errors,
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      message: "Email or username already in use",
    });
  }

  return res.status(500).json({
    message: err?.message || "Internal Server Error",
    name: err?.name,
    code: err?.code,
  });
};

const register = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
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
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ user });
};

export { register, login, me };
