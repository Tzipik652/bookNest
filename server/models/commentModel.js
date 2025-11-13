// // models/commentModel.js
// import supabase from "../config/supabaseClient.js";

// /**
//  * יצירת תגובה חדשה
//  */
// export async function create({ bookId, userId, text }) {
//   const { data, error } = await supabase
//     .from("comments")
//     .insert([
//       {
//         book_id: bookId,
//         user_id: userId,
//         text: text,
//         created_at: new Date().toISOString(),
//       },
//     ])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

// /**
//  * שליפת תגובות לספר
//  */
// // commentModel.js
// export async function findByBookId(bookId) {
//   const { data, error } = await supabase
//     .from('comments')
//     .select(`
//       id,
//       book_id,
//       user_id,
//       text,
//       created_at,
//       users(name)
//     `)
//     .eq('book_id', bookId)
//     .order('created_at', { ascending: false });

//   if (error) throw error;

//   // Map the joined name to userName
//   return data.map(c => ({
//     ...c,
//     userName: c.users?.name || 'Unknown',
//   }));
// }
// // export async function findByBookId(bookId) {
// //   const { data, error } = await supabase
// //     .from('comments')
// //     .select(`
// //       id,
// //       book_id,
// //       user_id,
// //       text,
// //       created_at,
// //       users(name),
// //       comment_reactions(
// //         user_id,
// //         reaction_type
// //       )
// //     `)
// //     .eq('book_id', bookId)
// //     .order('created_at', { ascending: false });

// //   if (error) throw error;

// //   // Map the joined name to userName and reactions
// //   return data.map(c => ({
// //     id: c.id,
// //     bookId: c.book_id,
// //     userId: c.user_id,
// //     text: c.text,
// //     createdAt: c.created_at,
// //     userName: c.users?.name || 'Unknown',
// //     reactions: c.comment_reactions?.map(r => ({
// //       userId: r.user_id,
// //       type: r.reaction_type
// //     })) || []
// //   }));
// // }

// /**
//  * מחיקת תגובה
//  */
// export async function remove(commentId) {
//   const { data, error } = await supabase
//     .from("comments")
//     .delete()
//     .eq("id", commentId)
//     .select("id")
//     .single();

//   if (error && error.code !== "PGRST116") throw error;
//   return !!data;
// }

// /**
//  * הוספה או שינוי של תגובה (לייק / דיסלייק וכו')
//  */
// export async function toggleReaction(commentId, userId, reactionType) {
//   const { data: existing, error: selectError } = await supabase
//     .from("comment_reactions")
//     .select("*")
//     .eq("comment_id", commentId)
//     .eq("user_id", userId)
//     .single();

//   if (selectError && selectError.code !== "PGRST116") throw selectError;

//   if (existing) {
//     if (existing.reaction_type === reactionType) {
//       // הסרת תגובה זהה
//       const { error } = await supabase
//         .from("comment_reactions")
//         .delete()
//         .eq("comment_id", commentId)
//         .eq("user_id", userId);
//       if (error) throw error;
//       return { removed: true };
//     } else {
//       // עדכון סוג תגובה
//       const { data, error } = await supabase
//         .from("comment_reactions")
//         .update({ reaction_type: reactionType })
//         .eq("comment_id", commentId)
//         .eq("user_id", userId)
//         .select()
//         .single();
//       if (error) throw error;
//       return data;
//     }
//   } else {
//     // הוספת תגובה חדשה
//     const { data, error } = await supabase
//       .from("comment_reactions")
//       .insert([{ comment_id: commentId, user_id: userId, reaction_type: reactionType }])
//       .select()
//       .single();
//     if (error) throw error;
//     return data;
//   }
// }
// models/commentModel.js (מעודכן - בלי reactions)
import supabase from "../config/supabaseClient.js";

/**
 * יצירת תגובה חדשה
 */
export async function create({ bookId, userId, text }) {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        book_id: bookId,
        user_id: userId,
        text: text,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * שליפת תגובות לספר
 */
export async function findByBookId(bookId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name)
    `)
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map the joined name to userName
  return data.map(c => ({
    ...c,
    userName: c.users?.name || 'Unknown',
  }));
}

/**
 * שליפת תגובה לפי ID
 */
export async function findById(commentId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/**
 * מחיקת תגובה
 */
export async function remove(commentId) {
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}