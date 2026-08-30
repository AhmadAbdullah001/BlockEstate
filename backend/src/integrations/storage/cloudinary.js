import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";

const configured = () =>
  Boolean(
    env.cloudinaryCloudName &&
      env.cloudinaryApiKey &&
      env.cloudinaryApiSecret,
  );

export function uploadMediaFile(file, folder = "blockestate/properties") {
  if (!configured()) {
    throw Object.assign(new Error("Cloudinary is not configured."), {
      statusCode: 503,
      code: "CLOUDINARY_NOT_CONFIGURED",
    });
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });

  const isVideo = /\.(mp4|webm|ogg|mov|avi|m4v)(\?.*)?$/i.test(file.originalname || "") || file.mimetype?.startsWith("video/");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? "video" : "image",
        ...(isVideo
          ? {}
          : {
              transformation: [
                { width: 2400, height: 1800, crop: "limit" },
                { quality: "auto", fetch_format: "auto" },
              ],
            }),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
}

export function uploadPropertyMedia(file) {
  return uploadMediaFile(file, "blockestate/properties");
}
