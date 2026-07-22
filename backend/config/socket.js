//this file independently sets up my socket.io server
import { Server } from "socket.io";
import User from "../models/user.model.js";

let io;
const userSockets = new Map();

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Real-time channel active: ${socket.id}`);

        socket.on("setup", async (userId) => {
            socket.userId = userId;
            socket.join(userId);
            console.log(userId + " connected");

            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            try {
                await User.findByIdAndUpdate(userId, { isOnline: true });
                io.emit("user-online", { userId });
            } catch (error) {
                console.error("Failed to mark user online:", error.message);
            }
        });

        //Join a conversation room
        socket.on("join_chat", (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        //Broadcast message
        socket.on("send_message", (messageData) => {
            socket.to(messageData.roomId).emit('receive_message', messageData);
        });

        //Handle disconnect
        socket.on('disconnect', async () => {
            const userId = socket.userId;
            console.log(`User disconnected: ${socket.id}`);

            if (!userId) return;

            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                    const lastSeen = new Date();
                    try {
                        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
                        io.emit("user-offline", { userId, lastSeen });
                    } catch (error) {
                        console.error("Failed to mark user offline:", error.message);
                    }
                }
            }
        });


        socket.on("call:offer", ({ to, from, offer, callType }) => {
            io.to(to).emit("call:incoming", {from, offer, callType });
        });

        socket.on("call:answer", ({ to, answer }) => {
            io.to(to).emit("call:answer", { answer });
        });

        socket.on("call:ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("call:ice-candidate", { candidate });
        })

        socket.on("call:end", ({ to }) => {
            io.to(to).emit("call:ended");
        });

        socket.on("call:reject", ({ to }) => {
            io.to(to).emit("call:rejected");
        });
    });

    return io;
};

const getio = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized yet!");
    } else {
        return io;
    }
};

export {
    initSocket,
    getio
}