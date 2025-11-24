import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Comment, User } from "../types";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { deleteBook, getBooks } from "../services/bookService";
import { getAllUsers } from "../services/userService";
import { deleteComment, getAllComments } from "../services/commentService";
import { getFavoritesCount } from "../services/favoriteService";
import { getCommentReactionCounts } from "../services/commentReactionService";
import { StatsCards } from "../components/adminDashboard/StatsCards";
import { AdminBooksTable } from "../components/adminDashboard/AdminBooksTable";
import { UserList } from "../components/adminDashboard/UserList";
import { RecentComments } from "../components/adminDashboard/RecentComments";

export function AdminDashboardPage() {
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  const [isReactionsLoading, setIsReactionsLoading] = useState(true);

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, any>>({});

  // Redirect if not admin
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      toast.error("Unauthorized: Admin access required");
      navigate("/home");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [allBooksData, allUsers, allComments, allFavorites] =
        await Promise.all([
          getBooks(),
          getAllUsers(),
          getAllComments(),
          getFavoritesCount(),
        ]);

      const map: Record<string, Book> = {};
      allBooksData.books.forEach((book: Book) => {
        map[book._id] = book;
      });

      const userMap: Record<string, string> = {};
      allUsers.forEach((u: User) => {
        userMap[u._id] = u.name;
      });
      setUserMap(userMap);

      setBooks(allBooksData.books);
      setFavoritesCount(allFavorites);
      setUsers(allUsers);
      setComments(allComments);
      setBooksMap(map);

      setIsLoading(false);

      setIsReactionsLoading(true);
      await loadReactions(allComments);
    } catch (error) {
      toast.error("Failed to load admin data");
      setIsLoading(false);
    } finally {
      setIsReactionsLoading(false);
    }
  };

  async function loadReactions(comments: Comment[]) {
    const countsMap: Record<string, any> = {};
    for (const comment of comments) {
      const counts = await getCommentReactionCounts(comment);
      countsMap[comment.id] = counts;
    }
    setReactionCounts(countsMap);
  }

  const handleDeleteBook = async (bookId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this book? This will also remove all associated comments and favorites."
      )
    ) {
      try {
        await deleteBook(bookId);
        setBooks((prevBooks) =>
          prevBooks.filter((book) => book._id !== bookId)
        );
        toast.success("Book deleted successfully");
      } catch (error) {
        toast.error("Failed to delete book");
      }
    }
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/edit-book/${bookId}`, { state: { from: "/admin-dashboard" } });
  };

  const calculatedTotalReactions = Object.values(reactionCounts).reduce(
    (acc: number, curr: any) => {
      const perCommentTotal =
        (curr.like || 0) +
        (curr.dislike || 0) +
        (curr.happy || 0) +
        (curr.angry || 0);
      return acc + perCommentTotal;
    },
    0
  );

  const recentBooks = books
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    )
    .slice(0, 5);

  const recentComments = comments
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  if (!currentUser?.role || currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage BookNest platform</p>
          </div>
        </div>

        <StatsCards
          favoritesCount={favoritesCount}
          totalBooksCount={books.length}
          totalUsersCount={users.length}
          commentsCount={comments.length}
          reactionsCount={reactionCounts ? calculatedTotalReactions : 0}
          recentUploads={recentBooks.length}
          isLoading={isLoading}
          isReactionsLoading={isReactionsLoading}
        />

        <AdminBooksTable
          books={books}
          userMap={userMap}
          handleEditBook={handleEditBook}
          handleDeleteBook={handleDeleteBook}
        />

        <UserList
          users={users}
          currentUser={currentUser}
          isLoading={isLoading}
        />

        <RecentComments
          recentComments={recentComments}
          booksMap={booksMap}
          userMap={userMap}
          reactionCounts={reactionCounts}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
