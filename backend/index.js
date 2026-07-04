import "./config/environment.js";
import { server } from "./app.js";
import connectDB from "./database.js";

const PORT = process.env.PORT || 4000;

connectDB();

server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});