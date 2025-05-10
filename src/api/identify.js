const API_URL =
  import.meta.env.VITE_API_URL || "https://plantpick-backend.up.railway.app";

export async function identifyPlant(file, isImage = false) {
  const formData = new FormData();
  if (isImage && file) {
    formData.append("file", file); // ส่งรูปภาพไป Backend
  }

  try {
    const response = await fetch(`${API_URL}/identify/`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error identifying plant:", error);
    return { error: "Failed to identify plant" };
  }
}
