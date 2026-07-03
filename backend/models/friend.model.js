import mongoose, { mongo } from "mongoose";

const friendSchema = new mongoose.Schema({
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
        type: String,
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
    timestamps: true
});

export default mongoose.model("Friendship", friendSchema);