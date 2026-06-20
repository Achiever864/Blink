import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        trim: true,
        default: ""
    },
    isGroupChat: {
        type: Boolean,
        default: false
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

export default mongoose.model("Room", roomSchema);