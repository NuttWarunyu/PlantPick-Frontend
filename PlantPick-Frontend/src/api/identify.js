const API_URL = import.meta.env.VITE_API_URL;

export const identifyPlant = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/identify/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to identify plant");
    }

    return await response.json();
  } catch (error) {
    console.error("Error identifying plant:", error);
    return { error: "Failed to identify plant" };
  }
};
