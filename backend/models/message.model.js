import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
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
            trim: true,
            default: ""
        },

        attachment: {
            type: {
                type: String,
                enum: ["image", "video", "audio", "file"],
                default: null
            },
            url: {
                type: String,
                default: null
            },
            publicId: {
                type: String,
                default: null
            },
            fileName: {
                type: String,
                default: null
            },
            mimeType: {
                type: String,
                default: null
            },
            size: {
                type: Number,
                default: null
            },
            duration: {
                type: Number,
                default: null
            }
        },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },

        deliveredTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User" //for interactiveness
            }
        ],

        reactions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                emoji: {
                    type: String
                }
            }
        ],

        //if message edited
        isEdited: {
            type: Boolean,
            default: false
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);