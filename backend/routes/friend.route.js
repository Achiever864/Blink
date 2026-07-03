import { 
    sendRequest, 
    acceptRequest, 
    rejectRequest, 
    blockUser, 
    unblockUser, 
    getPendingRequest, getFriends
 } from "../controllers/friend.controller.js";
import express from "express";

const friendRoute = express.Router();

friendRoute.post("/send", sendRequest);
friendRoute.post("/accept", acceptRequest);
friendRoute.post("/reject", rejectRequest);
friendRoute.post("/block", blockUser);
friendRoute.post("/unblock", unblockUser);
friendRoute.post("/getPending", getPendingRequest);
friendRoute.post("/getFriends", getFriends); //add this to get all the friends for a particular user

export default friendRoute;