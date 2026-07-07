import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import FriendsRecommend from "../services/friendSuggestion.js";
import RecommendationCache from "../services/RecommendationCache.js";
import CloudinaryService from "../services/CloudinaryService.js";


const registerUser = async (req, res) => {
    try {
        const { username, email, password  } = req.body;

        //Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser){
            return res.status(400).json({ message: "User already exists" });
        }

        const existingUsername = await User.findOne({ username });
        if(existingUsername){
            return res.status(400).json({ message: "Username is already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        //Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        })

        const token = jwt.sign(
            {id: newUser._id},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({ 
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                token: token
            }
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user. Please try again later" });
}
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user){
            return res.status(400).json({ message: "User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return res.status(400).json({ message: "Password is incorrect" });

        }

        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            user
        })
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Login failed" });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { userId, username, profilePicture, bio } = req.body;

        //hits and create the file on cloudinary and saves the url
        const result = await CloudinaryService.upload(
            req.file.buffer,
            "/blink/profilePictures"
        )
        console.log(result);


        const user = await User.findOne({ _id: userId });
        
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        const newUsername = username || user.username;
        const newProfilePicture = {
            url: result.secure_url,
            publicId: result.public_id
        } || user.profilePictrue;
        const newBio = bio || user.bio;
        
        user.username = newUsername;
        user.profilePicture = newProfilePicture;
        user.bio = newBio;

        await user.save();
        res.status(200).json({
            message: "User Profile updated successfully",
            user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const getUserSuggestions = async (req, res) => {
    try {
        const { userId } = req.body;
        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 10;


        //try accessing from cache if not fall back to database
        let recommendations = await RecommendationCache.get(userId);

        if(!recommendations){
            recommendations = await FriendsRecommend.recommend(userId);
            await RecommendationCache.set(
                userId,
                recommendations
            );
        }

        const page = recommendations.slice(
            offset, offset + limit
        )

        const ids = page.map(item => item.id)

        const users = await User.find({
            _id: {
                $in: ids
            }
        });

        const orderedUsers = ids.map(id =>
            users.find(user =>
                user._id.toString() === id
            )
        )
        res.status(201).json({
            users: orderedUsers,
            hasMore: offset + limit < recommendations.length,
            total: recommendations.length,
            message: "Users recommendation successful"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error getting users"
        });    
    }
};


const getUserBeta = async (req, res) => { //running this in-place of the suggestion before i fix docker
    try {
        const { userId } = req.body;

        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 10;

        const total = await User.countDocuments({
            _id: { $ne: userId }
        });

        const users = await User.find({
            _id: {$ne:userId}
        })
            .skip(offset)
            .limit(limit);

        res.status(200).json({
            users,
            hasMore: offset + users.length < total,
            total
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export {
    getUserBeta, //test
    getUserSuggestions,
    registerUser,
    loginUser,
    updateUserProfile
}