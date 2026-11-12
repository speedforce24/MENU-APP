const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/**
 * Configure the Cloudinary SDK from environment variables. Missing values
 * throw loudly at boot instead of causing mystery upload failures later.
 */
const required = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing Cloudinary env vars: ${missing.join(", ")}. ` +
      `Check backend/.env (local) and the Render environment (deploy).`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Multer storage that uploads each file straight to Cloudinary.
 * The resulting `req.file` has `.path` (the https CDN URL) and
 * `.filename` (the Cloudinary public_id used for delete/replace).
 */
const foodImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "choplist/foods",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
    transformation: [
      // Cap very large uploads; keep the aspect ratio.
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
});

/**
 * Pull the public_id out of a Cloudinary URL so we can delete the old
 * asset when an image is replaced. Returns null for non-Cloudinary paths
 * (e.g. legacy local `/uploads/...` images from the old storage).
 */
const publicIdFromUrl = (url) => {
  if (typeof url !== "string") return null;
  const match = url.match(
    /\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp|gif|avif)$/i
  );
  return match ? match[1] : null;
};

module.exports = { cloudinary, foodImageStorage, publicIdFromUrl };
