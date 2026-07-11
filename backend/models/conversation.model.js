import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    roomName: {
        type: String,
        trim: true,
        default: null
    },
    isGroupChat: {
        type: Boolean,
        required: true,
        default: false
    },
    groupvatar: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" }
    },

    participant: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message" //cache the  last message to show previews on the sideBar instantly
    },
    groupAdmins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
},
{
    timestamps: true
})

export default mongoose.model("Conversation", conversationSchema);