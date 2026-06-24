import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true  //remember to index for fast search ups on your database
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: [true, "Cannot send an empty message"], //learn to be using this for error handling on your model
            trim: true
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User" //for interactivenes
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);