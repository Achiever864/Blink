import express from "express";
import {
    createChat,
    setLatestMessage,
    getConversation,
    getMessages,
    addParticipants,
    removeParticipant,
    leaveGroup,
    promoteAdmin,
    demoteAdmin,
    updateGroupInfo
} from "../controllers/conversation.controller.js"

const conversationRoute = express.Router();

conversationRoute.post("/create", createChat);
conversationRoute.post("/setLatest", setLatestMessage);
conversationRoute.post("/getConversation", getConversation)
conversationRoute.post("/getMessages", getMessages);
conversationRoute.post("/addParticipants", addParticipants);
conversationRoute.post("/removeParticipant", removeParticipant);
conversationRoute.post("/leaveGroup", leaveGroup);
conversationRoute.post("/promoteAdmin", promoteAdmin);
conversationRoute.post("/demoteAdmin", demoteAdmin);
conversationRoute.post("updateGroupInfo", updateGroupInfo);

export default conversationRoute;