import express from "express";
import { getUser, registerUser, loginUser  } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/suggestUser", getUser);

export default userRouter;