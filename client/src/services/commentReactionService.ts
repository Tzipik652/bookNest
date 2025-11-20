import { useUserStore } from "../store/useUserStore";
import axios from "axios";
import { Comment } from "../types";

const API_BASE_URL =
  `${process.env.REACT_APP_SERVER_URL}/comment-reactions` ||
  "http://localhost:5000/comment-reactions";

function handleAxiosError(error: any): never {
  if (axios.isAxiosError(error)) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Something went wrong with the API request"
    );
  } else {
    throw new Error("Unexpected error: " + error);
  }
}

/** toggle reaction */
export async function toggleReaction(commentId: string, reactionType: string): Promise<Comment> {
  const user = useUserStore.getState().user;
  const token = useUserStore.getState().token;
  if (!user || !token) throw new Error("Must be logged in to react");

  try {
    const res = await axios.post(`${API_BASE_URL}/toggle`, { commentId, reactionType }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const serverComment = res.data;
    return {
      id: serverComment.id || serverComment._id,
      book_id: serverComment.book_id,
      user_id: serverComment.user_id,
      user_name: serverComment.user_name,
      text: serverComment.text,
      created_at: serverComment.created_at || new Date().toISOString(),
      updated_at: serverComment.updated_at || new Date().toISOString(),
      reactions: serverComment.reactions || [],
    };
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
}

/** fetch all reactions for a comment and return counts */
export async function getCommentReactionCounts(comment: Comment) {
  try {
    const res = await axios.get(`${API_BASE_URL}/${comment.id}`);
    return res.data.counts || { like: 0, dislike: 0, happy: 0, angry: 0 };
  } catch (error) {
    handleAxiosError(error);
    return { like: 0, dislike: 0, happy: 0, angry: 0 };
  }
}

/** fetch user's reaction for a comment */
export async function getUserReactionOnComment(commentId: string, userId: string) {
  try {
    const res = await axios.get(`${API_BASE_URL}/user/${commentId}/${userId}`);
    return res.data.reaction || null;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
}

export const getCommentReactions = async (commentId: string, userId: string) => {
    const reactionCounts = await getCommentReactionCounts({ id: commentId } as Comment);
    const userReaction = await getUserReactionOnComment(commentId, userId);
    return { reactionCounts, userReaction };
};