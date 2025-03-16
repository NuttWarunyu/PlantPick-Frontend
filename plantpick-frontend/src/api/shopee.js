import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const searchShopeePlants = async (plantName) => {
  try {
    const response = await axios.get(`${API_URL}/shopee/search`, {
      params: { q: plantName },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Shopee:", error);
    return [];
  }
};
