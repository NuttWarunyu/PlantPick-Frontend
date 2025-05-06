const API_URL = import.meta.env.VITE_API_URL;

export const identifyPlant = async (input, isImage = true) => {
  const formData = new FormData();
  if (isImage) {
    formData.append("file", input);
  } else {
    formData.append("name", input);
  }

  console.log("Sending request to:", `${API_URL}/identify/`); // Debug URL

  try {
    const response = await fetch(`${API_URL}/identify/`, {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", response.status); // Debug status

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText); // Debug error
      throw new Error(errorText || "Failed to identify plant");
    }

    const data = await response.json();
    console.log("API response:", data); // Debug response
    return data;
  } catch (error) {
    console.error("Error identifying plant:", error);
    return { error: error.message };
  }
};
