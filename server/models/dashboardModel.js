import supabase from "../config/supabaseClient.js";

export async function getStats() {
  // 1. הגדרת תאריך ל"ספרים חדשים" (למשל חודש אחורה)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 10);

  // שליפות במקביל
  const [
    { count: booksCount },
    { count: usersCount },
    { count: commentsCount },
    { count: reactionsCount },
    { count: recentBooksCount } 
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('comment_reactions').select('*', { count: 'exact', head: true }),
    
    supabase.from('books')
      .select('*', { count: 'exact', head: true })
      .gt('date_created', thirtyDaysAgo.toISOString()) 
  ]);

  return {
    booksCount: booksCount || 0,
    usersCount: usersCount || 0,
    commentsCount: commentsCount || 0,
    reactionsCount: reactionsCount || 0,
    recentBooksCount: recentBooksCount || 0 
  };
}