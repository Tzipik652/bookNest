import supabase from "../config/supabaseClient.js";

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
    .select(
      `
       id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
    )
    .single();

  if (error) throw error;
  return {
    ...data,
    user_name: data.users?.name || "Unknown",
    profile_picture:
      data.users?.auth_provider == "google" ? data.users?.profile_picture : null,
  };
}

// export async function findByBookId(bookId) {
//   const { data, error } = await supabase
//     .from("comments")
//     .select(
//       `
//       id,
//       book_id,
//       user_id,
//       text,
//       created_at,
//       updated_at,
//       users(name, auth_provider, profile_picture)
//     `
//     )
//     .eq("book_id", bookId)
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   // Map the joined name to userName
//   return data.map((c) => ({
//     ...c,
//     user_name: c.users?.name || "Unknown",
//     profile_picture:
//       c.users?.auth_provider == "google" ? c.users?.profile_picture : null,
//   }));
// }
export async function findByBookId(bookId, userId=null) {
  const { data: comments, error, count } = await supabase
    .from("comments")
    .select(`
      id, text, created_at, book_id, user_id,updated_at,
      users(name, auth_provider, profile_picture)`)
    .eq("book_id", bookId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  const commentIds = comments.map(c => c.id);

  const { data: reactionsData, error: reactionsError } = await supabase
    .from("comment_reactions")
    .select("comment_id, reaction_type, user_id")
    .in("comment_id", commentIds);

  if (reactionsError) {
    console.error("Error fetching reactions:", reactionsError);
  }

  const commentsWithReactions = comments.map((c) => {
    const myReactions = reactionsData?.filter(r => r.comment_id === c.id) || [];

    const reactionCounts = {
      like: myReactions.filter(r => r.reaction_type === 'like').length,
      dislike: myReactions.filter(r => r.reaction_type === 'dislike').length,
      happy: myReactions.filter(r => r.reaction_type === 'happy').length,
      angry: myReactions.filter(r => r.reaction_type === 'angry').length,
    };
const userReaction = userId 
        ? myReactions.find(r => r.user_id === userId)?.reaction_type 
        : null;
    return {
      ...c,
      user: c.users ? { ...c.users } : null,
      reaction_counts: reactionCounts,
      user_reaction: userReaction
    };
  }
  );

  return commentsWithReactions;
}
export async function findById(commentId) {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
      )
      .eq("id", commentId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return {
      ...data,
      user_name: data.users?.name || "Unknown",
      profile_picture:
        data.users?.auth_provider == "google" ? data.users?.profile_picture : null,
    };
  }

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
  // export async function findAll() {
  //   const { data, error } = await supabase
  //     .from("comments")
  //     .select(
  //       `
  //       id,
  //       book_id,
  //       user_id,
  //       text,
  //       created_at,
  //       updated_at,
  //       users(name, auth_provider, profile_picture)
  //     `
  //     )
  //     .order("created_at", { ascending: false });

  //   if (error) throw error;
  //   return data.map((c) => ({
  //     ...c,
  //     user_name: c.users?.name || "Unknown",
  //     profile_picture:
  //       c.users?.auth_provider == "google" ? c.users?.profile_picture : null,
  //   }));
  // }
  export async function findAll(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: comments, error, count } = await supabase
      .from("comments")
      .select(`
      id, text, created_at, book_id, user_id,
      users(name, email, auth_provider, profile_picture),
      books(_id, title) 
    `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }

    const commentIds = comments.map(c => c.id);

    const { data: reactionsData, error: reactionsError } = await supabase
      .from("comment_reactions")
      .select("comment_id, reaction_type")
      .in("comment_id", commentIds);

    if (reactionsError) {
      console.error("Error fetching reactions:", reactionsError);
    }

    const commentsWithReactions = comments.map((c) => {
      const myReactions = reactionsData?.filter(r => r.comment_id === c.id) || [];

      const reactionCounts = {
        like: myReactions.filter(r => r.reaction_type === 'like').length,
        dislike: myReactions.filter(r => r.reaction_type === 'dislike').length,
        happy: myReactions.filter(r => r.reaction_type === 'happy').length,
        angry: myReactions.filter(r => r.reaction_type === 'angry').length,
      };

      return {
        ...c,
        user: c.users ? { ...c.users } : null,
        book: c.books ? {
          id: c.books.id || c.books._id,
          title: c.books.title
        } : null,
        users: undefined,
        books: undefined,
        reaction_counts: reactionCounts
      };
    });

    return { comments: commentsWithReactions, total: count };
  }
  export async function update(commentId, text) {
    const { data, error } = await supabase
      .from("comments")
      .update(
        {
          text: text,
          updated_at: new Date().toISOString(),
        },
      )
      .select(
        `
      id,
      book_id,
      user_id,
      text,
      created_at,
      updated_at,
      users(name, auth_provider, profile_picture)
    `
      )
      .eq("id", commentId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return {
      ...data,
      user_name: data.users?.name || "Unknown",
      profile_picture:
        data.users?.auth_provider == "google" ? data.users?.profile_picture : null,
    };
  }
