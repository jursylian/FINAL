import express from "express";

import auth from "../middlewares/auth.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import {
  listHomeFeed,
  listExploreFeed,
} from "../controllers/postsController.js";

const router = express.Router();

router.get("/home", auth, listHomeFeed);
router.get("/explore", optionalAuth, listExploreFeed);

export default router;
