import express from "express";
import { likePost, createPost, getFeed } from "../controllers/post.controller.js";
import upload from "../config/multer.js";


const postRouter = express.Router();

postRouter.post("/create", upload.array('media', 10), createPost);
postRouter.post("/getFeed", getFeed);
postRouter.post("/like", likePost);

export default postRouter;