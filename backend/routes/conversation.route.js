import express from "express";
import {
    createChat,
    setLatestMessage,
    getConversation,
    getMessages
} from "../controllers/conversation.controller.js"

const conversationRoute = express.Router();

conversationRoute.post("/create", createChat);
conversationRoute.post("/setLatest", setLatestMessage);
conversationRoute.post("/getConversation", getConversation)
conversationRoute.post("/getMessages", getMessages);

export default conversationRoute;