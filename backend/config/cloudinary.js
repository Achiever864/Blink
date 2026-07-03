import { v2 as cloudinary } from "cloudinary";

console.log("Loading cloudinary config...");
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Configured:", cloudinary.config());

export default cloudinary;