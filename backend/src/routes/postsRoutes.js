import express from "express";

import auth from "../middlewares/auth.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import upload from "../middlewares/upload.js";
import {
  createPost,
  listFeed,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/postsController.js";
import { toggleLike } from "../controllers/likesController.js";
import {
  createComment,
  listComments,
} from "../controllers/commentsController.js";

const router = express.Router();

router.get("/", listFeed);
router.post("/", auth, upload.single("image"), createPost);
router.get("/:id", optionalAuth, getPost);
router.post("/:id/like", auth, toggleLike);
router.post("/:id/comments", auth, createComment);
router.get("/:id/comments", listComments);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

export default router;
