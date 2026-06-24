import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import userRouter from "./routes/user.route.js";
import { initSocket } from "./config/socket.js";

const app = express();

app.set("trust proxy", 1); //for render and hosting services
app.use(express.json());
app.use(cors());
app.use(helmet());

//create standard HTTP server
const server = http.createServer(app);
initSocket(server);

app.use(userRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;