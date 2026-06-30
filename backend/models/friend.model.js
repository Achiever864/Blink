import mongoose, { mongo } from "mongoose";

const friendSchema = new mongoose.Schema({
    user1: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId,
        reqeuired: true
    },

    user2: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    requester: {
        ref: "User",
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String || null,
        enum: ["pending", "accepted",  "blocked", "friendBlocked", "pendingBlocked", null],
        default: null
    },

    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
},
{
    timestamp: true
});

export default mongoose.model("Friendship", friendshipSchema);