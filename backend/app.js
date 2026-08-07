import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import userRouter from "./routes/user.route.js";
import friendRoute from "./routes/friend.route.js";
import messageRoute from "./routes/messages.route.js";
import postRouter from "./routes/post.route.js";
import callRouter from "./routes/call.route.js";
import { initSocket } from "./config/socket.js";
import conversationRoute from "./routes/conversation.route.js";
import notRouter from "./routes/notification.route.js";
import commentRoute from "./routes/comment.route.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimit.js";

const app = express();

app.set("trust proxy", 1); // for render and hosting services

//Security middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

const allowedOrigins = [
    "https://blink01.netlify.app",
    "http://localhost:5173" // dev
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "10mb" })); // caps request body size — prevents oversized-payload DoS
//app.use(mongoSanitize());
app.use(hpp());
app.use(generalLimiter);

// --- HTTP server + sockets ---
const server = http.createServer(app);
initSocket(server);

// --- Routes ---
app.use("/api/user", userRouter);
app.use("/api/friend", friendRoute);
app.use("/api/comment", commentRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/message", messageRoute);
app.use("/api/post", postRouter);
app.use("/api/notifications", notRouter);
app.use("/api/call", callRouter);

app.get("/", (req, res) => {
    res.send("Server is running");
});

// --- Centralized error handler---
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "Origin not permitted" });
    }

    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : err.message
    });
});

export { app, server };