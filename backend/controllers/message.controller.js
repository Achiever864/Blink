import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getio } from "../config/socket.js";
import CloudinaryService from "../services/CloudinaryService.js";



const sendMessage = async (req, res) => {
    try {
        const io = getio();
        const { sender, chatId, text, replyTo } = req.body;

        //check if conversation exist
        const conversation = await Conversation.findById(chatId);

        if(!conversation){
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        let attachment = null;
        if (req.file){
            const result = await CloudinaryService.upload(
                req.file.buffer,
                "/blink/messages"
            );

            attachment = {
                type: result.resource_type === "video"
                    ? (req.file.mimetype.startsWith("audio") ? "audio" : "video")
                    : result.resource_type === "image"
                        ? "image"
                        : "file",
                url: result.secure_url,
                publicId: result.public_id,
                fileName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: result.bytes,
                duration: result.duration || null
            };
        }

        //prevent empty message
        if(!text?.trim() && !attachment){
            return res.status(400).json({
                message: "Message cannot be empty."
            })
        }

        //create actual message
        const message = await Message.create({
            sender,
            chatId,
            text,
            attachment,
            replyTo,
            deliveredTo: [sender],
            readBy: [sender]
        });

        //update conversation preview
        conversation.latestMessage = message._id;

        await conversation.save();

        //populate sender for frontend omor!
        const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username profilePicture")
        .populate({
            path: "replyTo",
            select: "text attachment sender isDeleted",
            populate: {
                path: "sender",
                select: "username profilePicture"
            }
        });

        
        io.to(chatId).emit("new-message", populatedMessage);

            return res.status(201).json({
                message: "Message sent successfully",
                newMessage: populatedMessage
            });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export {
    sendMessage,

}