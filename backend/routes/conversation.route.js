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
    updateGroupInfo,
    toggleGroupLock
} from "../controllers/conversation.controller.js";
import upload from "../config/multer.js";

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
conversationRoute.patch("/updateGroupInfo", upload.single("groupPhoto"), updateGroupInfo);
conversationRoute.post("/lockGroup", toggleGroupLock);

export default conversationRoute;