import { sendRequest, acceptRequest, rejectRequest, blockUser, unblockUser } from "../controllers/friend.controller.js";
import express from "express";

const friendRoute = express.Router();

friendRoute.post("/send", sendRequest);
friendRoute.post("/accept", acceptRequest);
friendRoute.post("/reject", rejectRequest);
friendRoute.post("/block", blockUser);
friendRoute.post("/unblock", unblockUser);

export default friendRoute;