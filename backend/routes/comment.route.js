import { createComment, toggleLikeComment, deleteComment, getPostComments } from "../controllers/comment.controller.js";
import express from "express";

const commentRoute = express.Router();

commentRoute.get("/like", toggleLikeComment);
commentRoute.post("/create", createComment);
commentRoute.get("/get", getPostComments);
commentRoute.post("/delete", deleteComment);

export default commentRoute;