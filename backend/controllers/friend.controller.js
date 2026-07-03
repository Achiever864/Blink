import User from '../models/user.model.js';
import Friendship from "../models/friend.model.js"

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
            {
                $or: [
                    {
                        requester: requesterId,
                        recipient: recipientId
                    },
                    {
                        requester: recipientId,
                        recipient: requesterId
                    }
                ]
            },
            {
                status: "accepted"
            }
        );

        res.status(201).json({
            message: "Friend added successfully",
            friend
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
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
        
        if (blockee === blocker){
            return res.status(400).json({
                message: "You cannot block yourself"
            });
        }

        let friendship = await Friendship.findOne({
            $or: [
                {
                    requester: blockee,
                    recipient: blocker
                },
                {
                    requester: blockeee,
                    recipient: blocker
                }
            ]
        });

        if(!friendship) {
            friendship = await Friendship.create({
                requester: blocker,
                recipient: blockee,
                status: "blocked",
                blockedBy: blocker
            });
        }

        return res.status(201).json({
            message: "User blocked successfully"
        });

        //what if relationship exists
        if (friendship.status === "accepted"){
            friendship.status = "friendBlocked";
        } else if(friendship.status == "pending"){
            friendship.status = "pendingBlocked";
        }

        friendship.blockedBy = blocker;

        await friendship.save();

        return res.status(201).json({
            message: "User blocked successfully."
        });
        
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
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

        return res.status(500).json({
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
}
export {
    sendRequest,
    acceptRequest,
    rejectRequest,
    blockUser,
    unblockUser,
    getPendingRequest,
    getFriends
};