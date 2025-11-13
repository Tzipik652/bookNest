// models/commentReactionModel.js
import supabase from "../config/supabaseClient.js";

/**
 * הוספה או שינוי של reaction (לייק / דיסלייק וכו')
 */
export async function toggleReaction(commentId, userId, reactionType) {
  const { data: existing, error: selectError } = await supabase
    .from("comment_reactions")
    .select("*")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .single();

  if (selectError && selectError.code !== "PGRST116") throw selectError;

  if (existing) {
    if (existing.reaction_type === reactionType) {
      const { error } = await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId);
      if (error) throw error;
      return { removed: true };
    } else {
      // עדכון סוג reaction
      const { data, error } = await supabase
        .from("comment_reactions")
        .update({ reaction_type: reactionType })
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  } else {
    // הוספת reaction חדש
    const { data, error } = await supabase
      .from("comment_reactions")
      .insert([{ 
        comment_id: commentId, 
        user_id: userId, 
        reaction_type: reactionType,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

/**
 * קבלת כל ה-reactions לתגובה מסוימת
 */
export async function findByCommentId(commentId) {
  const { data, error } = await supabase
    .from("comment_reactions")
    .select("*")
    .eq("comment_id", commentId);

  if (error) throw error;
  return data || [];
}

/**
 * קבלת ה-reaction של משתמש ספציפי על תגובה מסוימת
 */
export async function findUserReaction(commentId, userId) {
  const { data, error } = await supabase
    .from("comment_reactions")
    .select("reaction_type")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data?.reaction_type || null;
}

/**
 * ספירת reactions לפי סוג לתגובה מסוימת
 */
export async function getReactionCounts(commentId) {
  const { data, error } = await supabase
    .from("comment_reactions")
    .select("reaction_type")
    .eq("comment_id", commentId);

  if (error) throw error;

  // ספירה לפי סוג
  const counts = {
    like: 0,
    dislike: 0,
    happy: 0,
    angry: 0
  };

  data?.forEach(reaction => {
    if (counts.hasOwnProperty(reaction.reaction_type)) {
      counts[reaction.reaction_type]++;
    }
  });

  return counts;
}