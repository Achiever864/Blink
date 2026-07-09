import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: ["friend_request", "friend_accept", "like", "comment", "message"],
        required: true
    },

    //generic reference to whatefer triggered the event... love this!
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },

    refModel: {
        type: String,
        enum: ["Post", "Message", "Friendship"],
        required: false
    },

    text: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;