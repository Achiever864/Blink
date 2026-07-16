import Message from "../models/message.model.js";
import { createNotification } from "../controllers/notification.controller.js";

const UNREAD_REMINDER_THRESHOLD = 15;

export const notifyIfStrategic = async({ recipientId, chatId, senderId, senderUsername }) => {
    const unreadCount = await Message.countDocuments({
        chatId,
        readBy: { $ne: recipientId }
    });

    const shouldNotify = unreadCount === 1 || unreadCount % UNREAD_REMINDER_THRESHOLD === 0;
    if (!shouldNotify) return;

    await createNotification({
        recipient: recipientId,
        sender: senderId,
        type: "message",
        refId: chatId,
        refModel: "Conversation",
        text: unreadCount === 1
            ? `${senderUsername} sent you a message`
            : `${senderUsername} sent you ${unreadCount} unread messages`
    });
};