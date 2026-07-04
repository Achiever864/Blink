import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { getio } from "../config/socket.js";



const sendMessage = async (req, res) => {
    try {
        const io = getio();
        const { sender, chatId, text, attachment, replyTo } = req.body;

        //check if conversation exist
        const conversation = await Conversation.findById(chatId);

        if(!conversation){
            return res.status(404).json({
                message: "Conversation not found"
            });
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
            .populate(
                "sender",
                "username profilePicture"
            );

        
        io.to(chatId).emit("new-message", populatedMessage);
        
        // const receivers = conversation.participant.filter(
        //     participant => participant.toString() !== sender
        // );

        // receivers.forEach(receiverId => {
        //     io.to(receiverId.toString()).emit(
        //         "new-message",
        //         populatedMessage
        //     );
        // })

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