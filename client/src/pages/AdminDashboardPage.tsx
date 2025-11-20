import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Comment, User } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
import { deleteUser, getAllUsers, updateUser } from '../services/userService';
import { deleteComment, getAllComments } from '../services/commentService';
import { getFavoritesCount } from '../services/favoriteService';
import { getCommentReactionCounts } from '../services/commentReactionService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function AdminDashboardPage() {
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [favorites, setFavorites] = useState<number>(0);
  const [reactionCounts, setReactionCounts] = useState<Record<string, any>>({});
  const [userEditFormData, setUserEditFormData] = useState({
    name: '',
    email: '',
    isAdmin: false
  });

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
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserEditFormData({
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin'
    });
  };
  const handleUpdateUser = () => {
    if (!editingUser) return;

    try {
      updateUser({
        ...editingUser,
        name: userEditFormData.name,
        email: userEditFormData.email,
        role: userEditFormData.isAdmin ? 'admin' : 'user',
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };
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

        {/* All Books Management
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
        </Card> */}
{/* Books Table */}
        <Card className="mb-8 shadow-sm border-0">
          <CardHeader>
            <CardTitle>All Books Management</CardTitle>
            <CardDescription>View and manage all books in the library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Author</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Uploader</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium">{book.title}</td>
                      <td className="py-3 px-4 text-gray-600">{book.author}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{userMap[book.user_id]}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(book.date_created).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/book/${book._id}`)}>
                            <BookOpen className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditBook(book._id)}>
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
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
        {/* <Card className="mb-8">
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
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Admin
                    </span>
                  )}
                                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {currentUser?._id !== user._id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete user "${user.name}"? This will remove all their books, favorites, and comments.`)) {
                            try {
                              deleteUser(user._id);
                              toast.success('User deleted successfully');
                              loadData();
                            } catch (error: any) {
                              toast.error(error.message || 'Failed to delete user');
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
        <Card className="mb-8 shadow-sm border-0">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>Manage user access and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div 
                  key={user._id} 
                  className="flex flex-col justify-between p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Placeholder */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-50 to-indigo-100 border border-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          {user.role === 'admin' && (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>

                    {currentUser?._id !== user._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm(`Delete user "${user.name}"?`)) {
                            try {
                              deleteUser(user._id);
                              toast.success('User deleted');
                              loadData();
                            } catch (error: any) {
                              toast.error('Failed to delete user');
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                      </Button>
                    )}
                  </div>
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
                            className="text-green-600 hover:underline cursor-pointer"
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
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={userEditFormData.name}
                onChange={(e) => setUserEditFormData({ ...userEditFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={userEditFormData.email}
                onChange={(e) => setUserEditFormData({ ...userEditFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-isAdmin">Admin Status</Label>
              <Select
                value={userEditFormData.isAdmin ? 'true' : 'false'}
                onValueChange={(value) => setUserEditFormData({ ...userEditFormData, isAdmin: value === 'true' })}
              >
                <SelectTrigger id="edit-isAdmin">
                  <SelectValue placeholder="Select admin status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Admin</SelectItem>
                  <SelectItem value="false">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}