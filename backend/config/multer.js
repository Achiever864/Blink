import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 //restrict file size to 100MB
    },

    fileFilter(req, file, cb) {
        const allowedTypes =[
            "image/jpeg",
            "image/png",
            "image/webp",

            //accepts video (...I mean what is a social platform without videos? lol)
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-matroska",

            //accept audio o (funny enough when i started building this thing i never thought i will be able to build audio, video and images) but here I am
            "audio/webm",
            "audio/mpeg",
            "audio/mp4",
            "audio/wav",
            "audio/ogg"
        ];

        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));

        if (!isAllowed){
            return cb(new Error("Only Images (JPG, PNG, WebP), videos (MP4, MOV, WEBM, MKV), and audio (WEBM, MP3, WAV, OGG) are allowed."))
        }

        cb(null, true);
    }
});

export default upload;