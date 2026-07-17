import express from "express";
import upload from "../config/multer.js";
import {
    getUserBeta, 
    getUserSuggestions,
    registerUser,
    loginUser,
    updateUserProfile,
    getUserProfile,
    getUserOnlineStatus
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/suggestUser", getUserSuggestions);
userRouter.patch("/update", upload.single('profilePicture'), updateUserProfile);
// userRouter.post("/getBetaUser", getUserSuggestions);  //run for test since the docker isn't working yet and we can't cache for now
userRouter.get("/getProfile/:userId", getUserProfile);
userRouter.get("/getOnlineStatus/:userId", getUserOnlineStatus);

export default userRouter;