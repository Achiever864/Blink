import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import userRouter from "./routes/user.route.js";
import friendRoute from "./routes/friend.route.js";
import messageRoute from "./routes/messages.route.js";
import postRouter from "./routes/post.route.js";
import { initSocket } from "./config/socket.js";
import conversationRoute from "./routes/conversation.route.js";
import notRouter from "./routes/notification.route.js";
import commentRoute from "./routes/comment.route.js";


const app = express();

app.set("trust proxy", 1); //for render and hosting services
app.use(express.json());
app.use(cors());
app.use(helmet());

//create standard HTTP server
const server = http.createServer(app);
initSocket(server);

app.use("/api/user", userRouter);
app.use("/api/friend", friendRoute);
app.use("/api/comment", commentRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/message", messageRoute);
app.use("/api/post", postRouter);
app.use("api/notifications", notRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export { app, server };