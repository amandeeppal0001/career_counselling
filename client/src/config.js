const rawApiUrl = import.meta.env.VITE_API_URL || "https://career-counselling-nr04.onrender.com";
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");
