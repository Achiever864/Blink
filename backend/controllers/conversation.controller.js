import Conversation from "../models/conversation.model.js";
import Messages from "../models/message.model.js";
import User from '../models/user.model.js';

const createChat = async(req, res) => {
    try {
        const { isGroupChat, participants, roomName, groupAdmins  } = req.body;

        //check if participants exist
        if(participants.length === 0){
            return res.status(400).json({
                message: "There must be at least one participant in a conversation"
            })
        }

        //if it is not group chat
        if(!isGroupChat){
            //check if conversation exissts
            const existingConversation = await Conversation.findOne({
                isGroupChat: false,
                participant: {
                    $all: participants,
                    $size: 2
                }
            })

            if(existingConversation){
                return res.status(200).json({
                    message: "Conversation already exists",
                    conversation: existingConversation
                });
            }

            const conversation = await Conversation.create({
                isGroupChat: isGroupChat,
                participant: participants
            })

            return res.status(200).json({
                message: "Conversation created successfully",
                conversation
            })
        };

        if(isGroupChat){
            const conversation = await Conversation.create({
                roomName,
                isGroupChat: isGroupChat,
                participant: participants,
                groupAdmins: groupAdmins
            })

            return res.status(200).json({
                message: "Group conversation created successfully",
                conversation
            })
        };
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const setLatestMessage = async (req, res) => {
    try {
        const { messageId, conversationId } = req.body;

        const conversation = await Conversation.findOne({ _id: conversationId });

        //check if conversation exists
        if(!conversation){
            return res.status(400).json({
                message: "Conversation not found"
            });
        }

        conversation.latestMessage = messageId;
        await conversation.save();

        res.status(200).json({
            message: "Latest Message has been set successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

const getConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findById(userId);

        if (!user){
            return res.status(400).json({
                message: "User not found. Please try again"
            })
        };

        const conversation = await Conversation.find({ participant: userId })
            .populate("participant", "username profilePicture")
            .populate("latestMessage")
            .sort({
                updatedAt: -1
            });

        res.status(200).json({
            message: "Conversations fetched successfully",
            conversation
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })        
    }
};


const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.body;

        const conversation = await Conversation.findOne({ _id: conversationId });
        //check if conversation exists
        if(!conversation){
            return res.status(400).json({
                message: "Conversation cannot be found"
            })
        }

        const messages = await Messages.find({ chatId: conversationId });

        res.status(202).json({
            message: "Messages Fetched Successfully",
            messages
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


export {
    createChat,
    setLatestMessage,
    getConversation,
    getMessages
}