import express from "express";

import auth from "../middlewares/auth.js";
import { toggleCommentLike } from "../controllers/commentsController.js";

const router = express.Router();

router.post("/:commentId/like", auth, toggleCommentLike);

export default router;
