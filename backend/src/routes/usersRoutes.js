import express from "express";

import auth from "../middlewares/auth.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import upload from "../middlewares/upload.js";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  listUserPosts,
} from "../controllers/usersController.js";
import {
  toggleFollow,
  listFollowers,
  listFollowing,
} from "../controllers/followController.js";

const router = express.Router();

router.get("/:id", optionalAuth, getProfile);
router.get("/:id/posts", optionalAuth, listUserPosts);
router.post("/:id/follow", auth, toggleFollow);
router.get("/:id/followers", listFollowers);
router.get("/:id/following", listFollowing);
router.patch("/:id", auth, updateProfile);
router.patch("/:id/avatar", auth, upload.single("image"), updateAvatar);

export default router;
