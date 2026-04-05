// ─── Cloudinary Configuration ───────────────────────────────────────────────
// Replace the values below with your actual Cloudinary credentials.
// Cloud Name  → found in your Cloudinary Dashboard (top-left)
// Upload Preset → create an *unsigned* preset in Settings → Upload → Upload Presets
const CLOUD_NAME = "YOUR_CLOUD_NAME";        // e.g. "dxyz123abc"
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";  // e.g. "job_seeker_unsigned"

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

/**
 * Upload a single file to Cloudinary.
 * @param {File} file - The File object to upload.
 * @param {"image" | "raw" | "auto"} resourceType - "image" for photos, "raw" for PDFs/docs.
 * @returns {Promise<string>} The secure URL of the uploaded file.
 */
export const uploadToCloudinary = async (file, resourceType = "auto") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("resource_type", resourceType);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};
