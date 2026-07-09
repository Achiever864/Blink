import Notification from "../models/notification.model.js";
import { getio } from "../config/socket.js";

const createNotification = async ({ recipient, sender,type, refId, refModel, text}) => {
    //avoid self oooo
    if (recipient.toString() === sender.toString()) return null;

    const notification = await Notification.create({
        recipient,
        sender,
        type,
        refId,
        refModel,
        text
    });

    const populated = await Notification.findById(notification._id)
        .populate("sender", "username profilePicture");
    
    //woah.. push live if recipient is online or else just stack to the database
    const io = getio();
    io.to(recipient.toString()).emit("new-notification", populated);

    return populated;
};

const getNotifications = async (req, res) => {
    try {
        const {userId} = req.body;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const totalCount = await Notification.countDocuments({ recipient: userId });

        const notifications = await Notification.find({ recipient: userId })
            .populate("sender", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {isRead: true},
            {new: true}
        );

        if (!notification){
            return res.status(400).json({ message: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch(error){
        res.status(500).json({ message: error.message });
    }
}

const markAllAsRead  = async (req, res) => {
    try {
        const { userId } = req.body;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: "All notifications marked as read" });
    } catch(error){
        res.status(500).json({ message: error.message });
    }
}

export {
    createNotification,
    getNotifications,
    markAllAsRead,
    markAsRead
}