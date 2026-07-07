import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: ""
        },

        media: [
            {
                type: {
                    type: String,
                    enum: ["image", "video", "audio", "file"],
                    required: true
                },

                url: {
                    type: String,
                    required: true
                },

                publicId: {
                    type: String,
                    required: true
                },

                width: Number,
                height: Number,
                duration: Number,
                bytes: Number,
                format: String,

                filename: String
            }
        ],

        visibility: {
            type: String,
            enum: ["public", "friends", "private"],
            default: "public"
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        commentsCount: {
            type: Number,
            default: 0
        },

        shares: {
            type: Number,
            default: 0
        },

        isEdited: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Post", postSchema);