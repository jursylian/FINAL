import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/feed", feedRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
