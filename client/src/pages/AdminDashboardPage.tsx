import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Comment, User } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  BookOpen,
  Users,
  MessageSquare,
  Heart,
  Trash2,
  Edit,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '../store/useUserStore';
import { deleteBook, getBooks } from '../services/bookService';
import { getAllUsers } from '../services/userService';
import { deleteComment, getAllComments } from '../services/commentService';
import { getFavoritesCount } from '../services/favoriteService';
import { getCommentReactionCounts } from '../services/commentReactionService';

export function AdminDashboardPage() {
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [favorites, setFavorites] = useState<number>(0);
  const [reactionCounts, setReactionCounts] = useState<Record<string, any>>({});

  // Redirect if not admin
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      toast.error('Unauthorized: Admin access required');
      navigate('/home');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allBooks = await getBooks();
      const allUsers = await getAllUsers();
      const allComments = await getAllComments();
      const allFavorites = await getFavoritesCount();

      const map: Record<string, Book> = {};
      allBooks.books.forEach((book: Book) => {
        map[book._id] = book;
      });

      const userMap: Record<string, string> = {};
      allUsers.forEach((u: User) => {
        userMap[u._id] = u.name;
      });
      setUserMap(userMap);

      setBooks(allBooks.books);
      setFavorites(allFavorites);
      setUsers(allUsers);
      setComments(allComments);
      setBooksMap(map);

      await loadReactions(allComments);

    } catch (error) {
      toast.error("Failed to load admin data");
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

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book? This will also remove all associated comments and favorites.')) {
      try {
        deleteBook(bookId);
        toast.success('Book deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        deleteComment(commentId);
        toast.success('Comment deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete comment');
      }
    }
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/edit-book/${bookId}`, { state: { from: '/admin-dashboard' } });
  };

  // --- Calculate statistics ---
  
  // ✅ תיקון 1: חישוב סך כל הריאקציות בצורה נכונה
  const calculatedTotalReactions = Object.values(reactionCounts).reduce((acc: number, curr: any) => {
    const perCommentTotal = (curr.like || 0) + (curr.dislike || 0) + (curr.happy || 0) + (curr.angry || 0);
    return acc + perCommentTotal;
  }, 0);

  const recentBooks = books.slice().sort((a, b) =>
    new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
  ).slice(0, 5);
  
  const recentComments = comments.slice().sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  if (!currentUser?.role || currentUser.role !== 'admin') {
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
            <h1 className="mb-1">Admin Dashboard</h1>
            <p className="text-gray-600">Manage BookNest platform</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Books</p>
                  <p className="text-3xl">{books.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl">{users.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Comments</p>
                  <p className="text-3xl">{comments.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Favorites</p>
                  <p className="text-3xl">{favorites}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Engagement</p>
                  {/* ✅ תיקון 2: שימוש במשתנה המחושב */}
                  <p className="text-2xl">{calculatedTotalReactions} Reactions</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {/* ✅ תיקון 3: עדכון הממוצע */}
                Average: {(calculatedTotalReactions / Math.max(comments.length, 1)).toFixed(1)} reactions per comment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Activity</p>
                  <p className="text-2xl">{recentBooks.length} Recent Books</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Books added in the last update cycle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* All Books Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>All Books Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Author</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Uploader</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{book.title}</td>
                      <td className="py-3 px-4">{book.author}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{userMap[book.user_id]}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(book.date_created).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/book/${book._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBook(book._id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBook(book._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComments.map((comment) => {
                const book = booksMap[comment.book_id];

                return (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">
                            {userMap[comment.user_id] + ' ' || "Unknown User"}
                          </span>
                          on{' '}
                          <span
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => navigate(`/book/${comment.book_id}`)}
                          >
                            {book?.title || "Unknown Book"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-700">{comment.text}</p>

                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      <span>👍 {reactionCounts[comment.id]?.like ?? 0}</span>
                      <span>👎 {reactionCounts[comment.id]?.dislike ?? 0}</span>
                      <span>😊 {reactionCounts[comment.id]?.happy ?? 0}</span>
                      <span>😡 {reactionCounts[comment.id]?.angry ?? 0}</span>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}