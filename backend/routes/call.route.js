import express from "express";
import { getTurnCredentials } from "../controllers/call.controller.js";

const callRouter = express.Router();

callRouter.get("/getTurnCredentials", getTurnCredentials);

export default callRouter;