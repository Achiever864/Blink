import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exced 30 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    LastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true
    },
    profilePicture: {
        type: String,
        default: "" //should store a URL for the users profile picture, I should consider AWS or cloudinary
    },
    bio:{
        type: String,
        maxlength: [200, "Bio cannot exceed 200 characters"],
        default: ""
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

//we want to define a virtual property to generate a user full name virtually without storing in database
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.LastName}`;
});

export default mongoose.model("User", userSchema);