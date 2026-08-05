import { readMessage, sendMessage, deleteMessage } from "../controllers/message.controller.js";
import upload from "../config/multer.js";
import express from "express";

const messageRoute = express.Router();

messageRoute.post("/send", upload.single("media"), sendMessage);
messageRoute.post('/read', readMessage);
messageRoute.post("/delete", deleteMessage);

export default messageRoute;