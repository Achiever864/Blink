import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.set("trust proxy", 1); //for render and hosting services
app.use(express.json());
app.use(cors());
app.use(helmet());



app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;