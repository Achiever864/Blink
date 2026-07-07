import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

class CloudinaryService {
    upload(buffer, folder, options = {}){
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto",
                    ...options
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            streamifier
                .createReadStream(buffer)
                .pipe(stream);
        });
    }

    async destroy (publicId, resourceType = "image"){
        if(!publicId) return;
        return cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    }

    async replace(oldPublicId, buffer, folder, options = {}){
        if(oldPublicId) {
            await this.destroy(oldPublicId);
        }

        return this.upload(buffer, folder, options);
    }
}

export default new CloudinaryService();