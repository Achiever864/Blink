import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
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
        trim: true,
    },
    lastName: {
        type: String,
        trim: true
    },
    profilePicture: {
        url: {
            type: String,
            default: "https://res.cloudinary.com/dxagtjaiy/image/upload/v1782975000/userCloud.jpg"
        },
        publicId: {
            type: String,
            default: null 
        }
    },

    dateOfBirth: {
        type: String,
        default: "",
        trim: true
    },

    occupation: {
        type: String,
        default: "",
        trim: true
    },

    nationality: {
        type: String,
        default: "",
        trim: true
    },

    city: {
        type: String,
        default: "",
        trim: true
    },

    interests: [
        {type: String}
    ],

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
    },

    isOnline: {
        type: Boolean,
        default: false
    },
    
    lastSeen: {
        type: Date,
        default: Date.now
    },

    website: {
        type: String,
        default: "",
        trim: true
    }
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

export default mongoose.model("User", userSchema);