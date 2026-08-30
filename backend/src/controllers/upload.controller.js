import { uploadPropertyMedia } from "../integrations/storage/cloudinary.js";

export async function uploadPropertyImages(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({
      success: false,
      error: {
        code: "NO_FILES_UPLOADED",
        message: "Upload at least one property media file.",
        details: {},
      },
    });
  }

  const media = await Promise.all(req.files.map(uploadPropertyMedia));
  return res.status(201).json({ success: true, data: { images: media } });
}
