import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getio } from "../config/socket.js";
import CloudinaryService from "../services/CloudinaryService.js";
import { notifyIfStrategic } from "../util/messageNotify.js";

const sendMessage = async (req, res) => {
    try {
        const io = getio();
        const { sender, chatId, text, replyTo } = req.body;

        const conversation = await Conversation.findById(chatId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        let attachment = null;
        if (req.file) {
            const result = await CloudinaryService.upload(req.file.buffer, "/blink/messages");
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

        if (!text?.trim() && !attachment) {
            return res.status(400).json({ message: "Message cannot be empty." });
        }

        const message = await Message.create({
            sender,
            chatId,
            text,
            attachment,
            replyTo,
            deliveredTo: [sender],
            readBy: [sender]
        });

        conversation.latestMessage = message._id;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePicture")
            .populate({
                path: "replyTo",
                select: "text attachment sender isDeleted",
                populate: { path: "sender", select: "username profilePicture" }
            });

        io.to(chatId).emit("new-message", populatedMessage);

        // Strategic notifications — fire-and-forget so a notification hiccup
        // never delays or breaks the message-send response.
        const recipientIds = conversation.participant
            .map(id => id.toString())
            .filter(id => id !== sender.toString());

        Promise.all(
            recipientIds.map(recipientId =>
                notifyIfStrategic({
                    recipientId,
                    chatId,
                    senderId: sender,
                    senderUsername: populatedMessage.sender.username
                })
            )
        ).catch(err => console.error("Notification batch failed:", err.message));

        return res.status(201).json({
            message: "Message sent successfully",
            newMessage: populatedMessage
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export { sendMessage };