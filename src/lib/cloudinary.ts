import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadImageToStorage(
  base64OrBuffer: string,
  folder = "everlight_homes"
): Promise<{ url: string; publicId?: string }> {
  if (!isConfigured) {
    throw new Error(
      "External image storage (Cloudinary) is not configured. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file to enable persistent image uploads."
    );
  }

  const res = await cloudinary.uploader.upload(base64OrBuffer, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: res.secure_url,
    publicId: res.public_id,
  };
}

export function isCloudinaryConfigured(): boolean {
  return isConfigured;
}
