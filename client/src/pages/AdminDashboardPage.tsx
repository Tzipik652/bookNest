import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Comment, User } from "../types";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { getBooks } from "../services/bookService";
import { getAllUsers } from "../services/userService";
import { getAllComments } from "../services/commentService";
import { getFavoritesCount } from "../services/favoriteService";
import { getCommentReactionCounts } from "../services/commentReactionService";
import { StatsCards } from "../components/adminDashboard/StatsCards";
import { AdminBooksTable } from "../components/adminDashboard/AdminBooksTable";
import { UserList } from "../components/adminDashboard/UserList";
import { RecentComments } from "../components/adminDashboard/RecentComments";

export function AdminDashboardPage() {
  // שימוש ב-adminDashboard
  const { t } = useTranslation(['adminDashboard', 'common']);
  
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
      // שימוש במפתח תרגום
      toast.error(t('toastAuthError'));
      navigate('/home');
    }
  }, [currentUser, navigate, t]);

  // --- Effect 1: טעינה ראשונית בלבד (סטטיסטיקות, יוזרים, תגובות) ---
  useEffect(() => {
    loadInitialData();
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

      // מיפוי יוזרים
      const uMap: Record<string, string> = {};
      allUsers.forEach((u: User) => {
        uMap[u._id] = u.name;
      });
      setUserMap(uMap);

      setBooks(allBooksData.books);
      setFavoritesCount(allFavorites);
      setUsers(allUsers);
      setComments(allComments);
      setBooksMap(map);

      setIsLoading(false);

      setIsReactionsLoading(true);
      await loadReactions(allComments);
    } catch (error) {
      console.error(error);
      // שימוש במפתח תרגום
      toast.error(t('toastLoadError'));
      setIsInitialLoading(false);
    } finally {
      setIsReactionsLoading(false);
    }
  };

  // פונקציה 2: טעינת ספרים בלבד (רץ בדפדוף)
  const fetchBooksOnly = async () => {
    setIsBooksLoading(true);
    try {
      const response = await getBooks({ page: currentPage, limit: ITEMS_PER_PAGE });
      
      const booksArray = response.books || [];
      const serverTotalItems = response.totalItems || booksArray.length;
      const serverTotalPages = response.totalPages || 1;

      setBooksMap(prev => {
        const newMap = { ...prev };
        booksArray.forEach((book: Book) => {
          newMap[book._id] = book;
        });
        return newMap;
      });

      setBooks(booksArray);
      setTotalBooksCount(serverTotalItems);
      setTotalPages(serverTotalPages);

    } catch (error) {
      console.error(error);
      // שימוש במפתח תרגום
      toast.error(t('toastBooksError'));
    } finally {
      setIsBooksLoading(false);
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
            {/* שימוש במפתח תרגום */}
            <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('headerTitle')}</h1>
            {/* שימוש במפתח תרגום */}
            <p className="text-gray-600">{t('headerSubtitle')}</p>
          </div>
        </div>

        {/* Stats */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Platform Overview
        </h2>
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

        {/* Books */}
        <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-4">
          Books Management
        </h2>
        <AdminBooksTable
          books={books}
          userMap={userMap}
          isLoading={isLoading}
        />

        {/* Users */}
        <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-4">
          Users
        </h2>
        <UserList
          users={users}
          currentUser={currentUser}
          isLoading={isLoading}
        />

        {/* Recent Comments */}
        <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-4">
          Recent Activity
        </h2>
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
