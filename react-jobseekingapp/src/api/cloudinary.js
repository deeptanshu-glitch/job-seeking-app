// ─── Cloudinary Configuration ───────────────────────────────────────────────

export const uploadToCloudinary = async (file, resourceType = "auto") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
  formData.append("resource_type", resourceType);

  const type = resourceType === "auto" ? "auto" : resourceType;
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/${type}/upload`;

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
