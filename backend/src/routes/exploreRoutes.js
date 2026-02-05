import express from "express";
import optionalAuth from "../middlewares/optionalAuth.js";
import { listExplorePosts } from "../controllers/exploreController.js";

const router = express.Router();

router.get("/posts", optionalAuth, listExplorePosts);

export default router;
