import User from '../models/user.model.js';
import Friendship from "../models/friend.model.js"
import { createNotification } from './notification.controller.js';

const sendRequest = async (req, res) => {
    try {
        const { requesterId, recipientId } = req.body;

        //check if requester and recipient exist
        const requester = await User.findOne({ _id: requesterId });
        const recipient = await User.findOne({ _id: recipientId });

        if (!requester || !recipient) {
            return res.status(400).json({
                message: "Incorrect user id"
            })
        };

        //prevent someone from sending request to his or herself
        if ( requesterId == recipientId){
            return res.status(400).json({
                message: "You cannot send a request to yourself."
            });
        }

        const friend = await Friendship.create({
            requester: requesterId,
            recipient: recipientId,
            status: "pending"
        });

        //send notification to the user
        await createNotification({
            recipient: recipientId,
            sender: requesterId,
            type: "friend_request",
            refId: friend._id,
            refModel: "Friendship",
            text: `${requester.username} sent you a friend request.`
        }).catch(err => console.error("Notification failed:", err.message));

        res.status(201).json({
            message: "Friend request created successfully",
            friend
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { requesterId, recipientId } = req.body;

        const friend = await Friendship.findOneAndUpdate(
            { $or: [{ requester: requesterId, recipient: recipientId }, { requester: recipientId, recipient: requesterId }] },
            { status: "accepted" },
            { new: true }
        );

        if (!friend) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        const recipient = await User.findById(recipientId).select("username");

        //send notification here too
        await createNotification({
            recipient: requesterId,
            sender: recipientId,
            type: "friend_accept",
            refId: friend._id,
            refModel: "Friendship",
            text: `${recipient?.username || "Someone"} accepted your friend request.`
        }).catch(err => console.error("Notification failed:", err.message));

        res.status(200).json({
            message: "Friend added successfully",
            friend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const { requesterId, recipientId } = req.body;

        let friendship = await Friendship.findOne({
            $or: [
                {
                    requester: requesterId,
                    recipient: recipientId
                },
                {
                    requester: recipientId,
                    recipient: requesterId,
                }
            ]
        });

        if(!friendship){
            return res.status(400).json({
                message: "Not a friend, cannot reject."
            })
        }
        
        friendship.status = null;
        await friendship.save();

        res.status(200).json({
            message: "The user was rejected."
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const blockUser = async (req, res) => {
    try {
        const { blockee, blocker } = req.body;

        if (blockee === blocker) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        let friendship = await Friendship.findOne({
            $or: [
                { requester: blockee, recipient: blocker },
                { requester: blocker, recipient: blockee }
            ]
        });

        if (!friendship) {
            friendship = await Friendship.create({
                requester: blocker,
                recipient: blockee,
                status: "blocked",
                blockedBy: blocker
            });
        } else {
            if (friendship.status === "accepted") {
                friendship.status = "friendBlocked";
            } else if (friendship.status === "pending") {
                friendship.status = "pendingBlocked";
            } else {
                friendship.status = "blocked";
            }
            friendship.blockedBy = blocker;
            await friendship.save();
        }

        return res.status(200).json({
            message: "User blocked successfully",
            friendship
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const unblockUser = async (req, res) => {
    try {
        const {blocker, blockee} = req.body;

        let friendship = await Friendship.findOne({
            $or: [
                {
                    requester: blocker,
                    recipient: blockee,
                },
                {
                    requester: blockee,
                    recipient: blocker
                }
            ]
        });

        //check if friendship exists
        if(!friendship){
            return res.status(200).json({
                message: "User was not blocked. Unable to unblock"
            })
        };


        //check existing block state and reverse it to the original state
        if(friendship.status == "friendBlocked"){
            friendship.status = "accepted";
        } else if(friendship.status == "pendingBlocked"){
            friendship.status = "pending"
        } else if(friendship.status == "blocked"){
            friendship.status = null
        }

        await friendship.save();

        return res.status(200).json({
            message: "User unblocked successfully",
            friendship
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const getPendingRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;

        //check if id exist
        const user = await User.findOne({ _id: recipientId });

        if(!user){
            return res.status(400).json({
                message: "User does not exist"
            });
        }

        const relation = await Friendship.find({
                    recipient: recipientId,
                    status: "pending"
        }).populate(
            "requester",
            "username profilePicture"
        )

        if(!relation){
            return res.status(200).json({
                message: "There is no pending request."
            })
        }

        res.status(200).json({
            message: "Requests generated successfully.",
            relation

        })


    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};


const getFriends = async (req, res) => {
    try {
        const {userId} = req.body;

        const user = await User.findOne({ _id: userId });

        //check if user exists
        if(!user){
            return res.status(400).json({
                message: "User not found"
            })
        };

        const friends = await Friendship.find({
            $or: [
                {
                    recipient: userId,
                    status: "accepted"
                },
                {
                    requester: userId,
                    status: "accepted"
                }
            ]
        }).populate(
            "requester",
            "username profilePicture"
        ).populate(
            "recipient",
            "username profilePicture"
        );


        res.status(200).json({
            message: "Fetched Friends successfully",
            friends
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

const searchUsers = async (req, res) => {
    try {
        const { userid, query } = req.body;

        if (!userId){
            return res.status(400).json({
                message: "User Id is required."
            });
        }

        const users = await User.find({
            _id: { $ne: userId },
            username: {
                $regex: query || "",
                $options: "i"
            }
        })
        .select("username profilePicture")
        .limit(20);

        const userIds = users.map(user => user._id);

        const friendships = await Friendship.find({
            $or: [
                {
                    requester: userId,
                    recipient: {$in: userIds}
                },
                {
                    requester: { $in: userIds },
                    recipient: userId
                }
            ]
        });

        const relationshipMap = {};
        friendships.forEach(friendship => {
            const otherUser =
                friendship.requester.toString() === userId
                    ? friendship.recipient.toString()
                    : friendship.requester.toString();
                
            let status = "none";

            if (friendship.status === "accepted"){
                status = "friend";
            } else if (friendship.status === "pending"){
                if (friendship.requester.toString() === userId) {
                    status = "requested";
                } else {
                    status = "pending";
                }
            } else if (friendship.status === "blocked" || friendship.status === "friendBlocked" || friendship.status === "pendingBlocked"){
                status = "blocked";
            }

            relationshipMap[otherUser] = status;
    });

    const results = users.map(user => ({
        id: user._id,
        username: user.username,
        avatarUrl: user.profilePicture?.url,
        status: relationshipMap[user._id.toString()] || "none"
    }));

    res.status(200).json({
        message: "Users fetched successfully.",
        users: results
    });
    } catch (error) {
       return res.status(500).json({
            message: error.message
       }) 
    }
};

export {
    sendRequest,
    acceptRequest,
    rejectRequest,
    blockUser,
    unblockUser,
    getPendingRequest,
    getFriends,
    searchUsers
};