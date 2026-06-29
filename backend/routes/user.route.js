import express from "express";
import upload from "../config/multer.js";
import { uploadProfilePicture } from "../controllers/user.controller.js";
import { getUserSuggestions, registerUser, loginUser  } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/suggestUser", getUserSuggestions);
userRouter.patch(
    "/profile-picture",
    protect,
    upload.single("profilePicture"),
    uploadProfilePicture
);

export default userRouter;