import User from "../models/user.model.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser){
            return res.status(400).json({ message: "User already exists" });
        }

        //Create new user
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal Server Error" });
}
}

export {
    registerUser
}