import { get } from "mongoose";
import {
    createNotification,
    getNotifications,
    markAllAsRead,
    markAsRead
} from "../controllers/notification.controller.js";
import express from "express";

const notRouter = express.Router();

notRouter.post("/create", createNotification);
notRouter.post("/getNotification", getNotifications);
notRouter.post("/markAll", markAllAsRead);
notRouter.post("/mark", markAsRead);

export default notRouter;