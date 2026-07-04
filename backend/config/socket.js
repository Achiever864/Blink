//this file independently set us my socket.io server
import { Server } from "socket.io";
import cors from "cors";

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    })

    //Centralized Event Architecture
    io.on("connection", (socket) => {
        console.log(`Real-time channel active: ${socket.id}`);
        //for the setup I dey learn sha
        socket.on("setup", (userId) => {
            socket.join(userId);
            console.log(userId + " connected");
        })

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
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        })
    })
    return io;
};

const getio = () => {
    
    if (!io){
        throw new Error("Socket.io has not been initialized yet!");
    }else {
        return io;
    }
};

export {
    initSocket,
    getio
}