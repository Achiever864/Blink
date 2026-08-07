import express from "express";
import upload from "../config/multer.js";
import {
    getUserBeta, 
    getUserSuggestions,
    registerUser,
    loginUser,
    updateUserProfile,
    getUserProfile,
    getUserOnlineStatus,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js";
import { authLimiter } from "../middleware/rateLimit.js";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);
userRouter.post("/suggestUser", getUserSuggestions);
userRouter.patch("/update", upload.single('profilePicture'), updateUserProfile);
// userRouter.post("/getBetaUser", getUserSuggestions);  //run for test since the docker isn't working yet and we can't cache for now
userRouter.get("/getProfile/:userId", getUserProfile);
userRouter.get("/getOnlineStatus/:userId", getUserOnlineStatus);
userRouter.post("/forgotPassword", authLimiter, forgotPassword);
userRouter.post("/resetPassword", authLimiter, resetPassword);

export default userRouter;