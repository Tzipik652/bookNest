// categoryService.ts
const API_BASE_URL =
  `${import.meta.env.VITE_SERVER_URL}/categories` || "http://localhost:5000/categories";

export async function getCategories() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    throw err;
  }
}
