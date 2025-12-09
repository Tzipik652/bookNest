import api from "../lib/axiosInstance";


export async function getDashboardStats() {
  const res = await api.get('/dashboard/stats');
  return res.data; 
  // יחזיר: { booksCount, usersCount, commentsCount, reactionsCount }
}