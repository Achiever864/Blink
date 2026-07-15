import User from "../models/user.model.js";
import Friendship from "../models/friend.model.js";
import Post from "../models/post.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import FriendsRecommend from "../services/friendSuggestion.js";
import RecommendationCache from "../services/RecommendationCache.js";
import CloudinaryService from "../services/CloudinaryService.js";

const friendsRecommend = new FriendsRecommend();

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
        const { 
            userId,
            username,
            profilePicture, 
            firstName,
            lastName,
            bio,
            website,
            dateOfBirth,
            occupation,
            nationality,
            city,
            interests
        } = req.body;
    
        const user = await User.findOne({ _id: userId });

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        if (req.file){
            const result = await CloudinaryService.upload(
                req.file.buffer,
                "/blink/profilePictures"
            );

            user.profilePicture = {
                url: result.secure_url,
                publicId: result.public_id
            };
        }

        //only overwrite fields that were actually sent
        if (username && username.trim()) user.username = username.trim();
        if (firstName && firstName.trim()) user.firstName = firstName.trim();
        if (lastName && lastName.trim()) user.lastName = lastName.trim();
        if (website && website.trim()) user.website = website.trim();
        if (dateOfBirth && dateOfBirth.trim()) user.dateOfBirth = dateOfBirth.trim();
        if (occupation && occupation.trim()) user.occupation = occupation.trim();
        if (nationality && nationality.trim()) user.nationality = nationality.trim();
        if (city && city.trim()) user.city = city.trim();

        if (bio !== undefined) user.bio = bio;

        if (interests){
            //Accept either a JSON array string
            try {
                const parsed = JSON.parse(interests);
                user.interests = Array.isArray(parsed) ? parsed : interests.split(",").map(i => i.trim()).filter(Boolean);
            }catch {
                user.interests = interests.split(",").map(i => i.trim()).filter(Boolean);
            }
        }

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
        let recommendations = await RecommendationCache.get("friend", userId);

        if(!recommendations){
            recommendations = await friendsRecommend.recommend(userId);
            await RecommendationCache.set(
                "friend",
                userId,
                recommendations
            );
        }

        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: { $in: ["accepted", "pending"] }
        });

        const excludedIds = new Set(
            friendships.map(f => 
                f.requester.toString() === userId.toString()
                    ? f.recipient.toString()
                    : f.requester.toString()
            )
        );

        const filteredRecommendations = recommendations.filter(
            entry => !excludedIds.has(entry.id)
        );

        const page = filteredRecommendations.slice(
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
        ).filter(Boolean);

        res.status(201).json({
            users: orderedUsers,
            hasMore: offset + limit < filteredRecommendations.length,
            total: filteredRecommendations.length,
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

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { viewerId } = req.query;

        const user = await User.findById(userId)
            .populate("friends", "_id username profilePicture");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const postsCount = await Post.countDocuments({ author: userId });

        let isFriend = false;
        let friendRequestSent = false;
        let mutualFriends = [];

        if (viewerId && viewerId !== userId){
            //chheck relationship status between viewer and profile owner ... omor
            const friendship = await Friendship.findOne({
                $or: [
                    { requester: viewerId, recipient: userId },
                    { requester: userId, recipient: viewerId }
                ]
            });

            if (friendship){
                isFriend = friendship.status === "accepted";

                friendRequestSent =
                    friendship.status === "pending" &&
                    friendship.requester.toString() === viewerId;
            }

            const viewerFriendships = await Friendship.find({
                status: "accepted",
                $or: [{ requester: viewerId }, { recipient: viewerId }]
            });

            const viewerFriendIds = new Set(
                viewerFriendships.map(f =>
                    f.requester.toString() === viewerId
                        ? f.recipient.toString()
                        : f.requester.toString()
                )
            );

            const ownerFriendships = await Friendship.find({
                status: "accepted",
                $or: [{ requester: userId }, { recipient: userId }]
            });

            const ownerFriendIds = ownerFriendships.map(f =>
                f.requester.toString() === userId
                    ? f.recipient.toString()
                    : f.requester.toString()
            );

            const mutualIds = ownerFriendIds.filter(id => viewerFriendIds.has(id));
            if (mutualIds.length > 0){
                const mutualUsers = await User.find({
                    _id: { $in: mutualIds }
                }).select('username profilePicture');

                mutualFriends = mutualUsers;
            }
        }

        //now... do the overall friend count
        const friendsCount = await Friendship.countDocuments({
            status: "accepted",
            $or: [{ requester: userId }, { recipient: userId}]
        });

        const profile = {
            userId: user._id,
            username: user.username,
            fullName: user.fullName,
            bio: user.bio,
            occupation: user.occupation,
            city: user.city,
            nationality: user.nationality,
            profilePicture: user.profilePicture,
            coverPhoto: user.coverPhoto || "",
            friendsCount,
            postsCount,
            mutualFriends,
            badges: user.badges || [],
            isFriend: false,
            friendRequestSent,
            hasBlocked: false, //change this from the hardwire data later abeg
            blockedMe: false,
            joinedAt: user.createdAt,
            lastSeen: user.updatedAt,
            online: false //same thing here I have not even handled the logic for online and offline user yet omor
        };

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export {
    getUserBeta, //test
    getUserSuggestions,
    registerUser,
    loginUser,
    updateUserProfile,
    getUserProfile
}