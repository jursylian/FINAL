import express from "express";
import { listExplorePosts } from "../controllers/exploreController.js";

const router = express.Router();

router.get("/posts", listExplorePosts);

export default router;
