import { sendMessage } from "../controllers/message.controller.js";
import express from "express";

const messageRoute = express.Router();

messageRoute.post("/send", sendMessage);

export default messageRoute;