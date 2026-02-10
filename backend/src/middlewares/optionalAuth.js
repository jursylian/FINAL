import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return next();
  }
};

export default optionalAuth;
