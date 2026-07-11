import Conversation from "../models/conversation.model.js";
import Messages from "../models/message.model.js";
import User from '../models/user.model.js';

const createChat = async(req, res) => {
    try {
        const { isGroupChat, participants, roomName, creatorId  } = req.body;

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
            if (!roomName || !roomName.trim()){
                return res.status(400).json({
                    message: "Group chats require a name"
                });
            }

            if (participants.length < 3){
                return res.status(400).json({
                    message: "A group requires at least 3 participants (including yourself)"
                });
            }

            if(!creatorId){
                return res.status(400).json({
                    message: "Creator is required to create a group"
                });
            }

            const conversation = await Conversation.create({
                roomName: roomName.trim(),
                isGroupChat: isGroupChat,
                participant: participants,
                groupAdmins: [creatorId]
            })

            const populated = await Conversation.findById(conversation._id)
                .populate("participant", "username profilePicture");

            return res.status(200).json({
                message: "Group conversation created successfully",
                conversation: populated
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

        const messages = await Messages.find({ chatId: conversationId })
                .populate("sender");

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

const addParticipants = async (req, res) => {
    try {
        const { conversationId, requesterId, userId } = req.body;
        const conversation = await Conversation.findById(conversationId);

        if (!conversation){
            return res.status(404).json({ message: "Conversation not found"});
        }

        if (!conversation.isGroupChat){
            return res.status(400).json({ message: "Cannot add participants to a direct message" });
        }

        const isAdmin = conversation.groupAdmins.some(id => id.toString() === requesterId);
        if (!isAdmin){
            return res.status(403).json({ message: "Only group admins can add participants" })
        }

        const existingIds = new Set(conversation.participant.map(id => id.toString()));
        const newIds = userIds.filter((id) => !existingIds.has(id));

        conversation.participant.push(...newIds);
        await conversation.save();

        const updated = await Conversation.findById(conversationId)
            .populate("participant", "username profilePicture");

        const io = getio();
        io.to(conversationId).emit("group-updated", updated);

        res.status(200).json({
            message: "Participants added successfully",
            conversation: updated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeParticipant = async (req, res) => {
    try {
        const { conversationId, requesterId, userId } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation){
            return res.status(404).json({
                message: "Conversation not found"
            })
        }

        if(!conversation.isGroupChat){
            return res.status(400).json({
                message: "Cannot remove participants from a direct message"
            });
        }

        const isAdmin = conversation.groupAdmins.some(id => id.toString() === requesterId);
        if (!isAdmin){
            return res.status(403).json({ message: "Only group admins can remove participants" });
        }

        conversation.participant = conversation.participant.filter(
            id => id.toString() !== userId
        );

        conversation.groupAdmins = conversation.groupAdmins.filter(
            id => id.toString() !== userId
        )

        await conversation.save();

        const updated = await Conversation.findById(conversationId)
            .populate("participant", "username profilePicture");
        
        const io = getio();
        io.to(conversationId).emit("group-updated", updated);
        io.to(userId).emit("removed-from-group", { conversationId });

        res.status(200).json({
            message: "Participant removed successfully",
            conversation: updated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const leaveGroup = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation){
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.isGroupChat){
            return res.status(400).json({ message: "Cannot leave a direct message" });
        }

        conversation.participant = conversation.participant.filter(
            id => id.toString() !== userId
        );

        const wasAdmin = conversation.groupAdmins.some(id => id.toString() === userId);
        conversation.groupAdmins = conversation.groupAdmins.filter(
            id => id.toString() !== userId
        )

        //for consistency: if the last admin left and people remain.. promote the next person to admin
        if(wasAdmin && conversation.groupAdmins.length === 0 && conversation.participant.length > 0){
            conversation.groupAdmins.push(conversation.participant[0]);
        }

        await conversation.save();

        const updated = await Conversation.findById(conversationId)
            .populate("participant", "username profilePicture");

        const io = getio();
        io.to(conversationId).emit("group-updated", updated);

        res.status(200).json({
            message: "Left group successfully",
            conversation: updated
        })
    } catch (error) {
        res.status(500).json({ message: "Unable to leave"})
    }
}

const promoteAdmin = async (req, res) => {
    try {
        const { conversationId, requesterId, userId } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if(!conversation){
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isAdmin = conversation.groupAdmins.some(id => id.toString() === requesterId);
        if (!isAdmin) {
            return res.status(403).json({ message: "Only group admins can promot members" });
        }

        const isParticipant = conversation.participant.some(id => id.toString() === userId);
        if (!isParticipant){
            return res.status(400).json({ message: "User is not a a participant of this group" });
        }

        const alreadyAdmin = conversation.groupAdmins.some(id => id.toString() === userId);
        if (!alreadyAdmin){
            conversation.groupAdmins.push(userId);
            await conversation.save();
        }

        const updated = await Conversation.findById(conversationId)
            .populate("participant", "username profilePicture");
        
        const io = getio();
        io.to(conversationId).emit("group-updated", updated);

        res.status(200).json({
            message: "User promoted to admin",
            conversation: updated
        });
    } catch(error){
        res.status(500).json({
            message: error.message
        });
    }
}

const demoteAdmin = async (req, res) => {
    try {
        const { conversationId, requesterId, userId } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if(!conversation){
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isAdmin = conversation.groupAdmins.some(id => id.toString() === requesterId);
        if (!isAdmin){
            return res.status(403).json({ message: "Only group admins can demote other admins" });
        }

        conversation.groupAdmins = conversation.groupAdmins.filter(
            id => id.toString !== userId
        );
        await conversation.save();

        const updated = await Conversation.findById(conversationId)
            .populate("participant", "username profilePicture");

        const io = getio();
        io.to(conversationId).emit("group-updated", updated);

        res.status(200).json({
            message: "Admin demoted successfully",
            conversation: updated
        })
    } catch(error){
        res.status(500).json({ message: error.message });
    }
};

const updateGroupInfo = async (req, res) => {
    try{
        const { conversationId, requesterId, roomName } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if(!conversation){
            return res.status(404).json({ message: "Conversation not found" });
        }

        const isAdmin = conversation.groupAdmins.some(id => id.toString() === requesterId);
        if (!isAdmin){
            return res.status(403).json({ message: "Only group admins can update group info" });
        }

        if (roomName && roomName.trim()){
            conversation.roomName = roomName.trim();
        }

        await conversation.save();

        const updated = await Conversation.findById(conversationId)
            .populate("participant", "username profilePicture");

        const io = getio();
        io.to(conversationId).emit("group-updated", updated);

        res.status(200).json({
            message: "Group info updated successfully",
            conversation: updated
        });
    } catch(error){
        res.status(500).json({ message: error.message });
    };
}

export {
    createChat,
    setLatestMessage,
    getConversation,
    getMessages,
    addParticipants,
    removeParticipant,
    leaveGroup,
    promoteAdmin,
    demoteAdmin,
    updateGroupInfo
}