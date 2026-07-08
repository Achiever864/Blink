import { sendMessage } from "../controllers/message.controller.js";
import upload from "../config/multer.js";
import express from "express";

const messageRoute = express.Router();

messageRoute.post("/send", upload.single("media"), sendMessage);

export default messageRoute;