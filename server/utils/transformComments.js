import { transformComments } from "../utils/transformComments";

async function loadComments(bookId, userId) {
  const { data: comments } = await supabase.from("comments").select("*").eq("book_id", bookId);
  const { data: reactions } = await supabase.from("comment_reactions").select("*");

  if (comments && reactions) {
    const transformed = transformComments(comments, reactions, userId);
    setComments(transformed);
  }
}
