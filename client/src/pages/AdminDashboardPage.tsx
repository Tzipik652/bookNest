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
  AlertCircle,
  ChevronLeft,
  ChevronRight
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
import { Skeleton } from '@mui/material';
// ייבוא useTranslation
import { useTranslation } from 'react-i18next';

export function AdminDashboardPage() {
  // שימוש ב-adminDashboard
  const { t } = useTranslation(['adminDashboard', 'common']);
  
  const [booksMap, setBooksMap] = useState<Record<string, Book>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();

  // --- loading state  ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBooksLoading, setIsBooksLoading] = useState(true);
  const [isReactionsLoading, setIsReactionsLoading] = useState(true);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

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
      // שימוש במפתח תרגום
      toast.error(t('toastAuthError'));
      navigate('/home');
    }
  }, [currentUser, navigate, t]);

  // --- Effect 1: טעינה ראשונית בלבד (סטטיסטיקות, יוזרים, תגובות) ---
  useEffect(() => {
    loadInitialData();
  }, []);

  // --- Effect 2: טעינת ספרים בעת שינוי עמוד ---
  useEffect(() => {
    fetchBooksOnly();
  }, [currentPage]);

  // פונקציה 1: טעינת מידע כללי (רץ פעם אחת)
  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [allUsers, allComments, allFavorites] = await Promise.all([
        getAllUsers(),
        getAllComments(),
        getFavoritesCount()
      ]);

      // מיפוי יוזרים
      const uMap: Record<string, string> = {};
      allUsers.forEach((u: User) => {
        uMap[u._id] = u.name;
      });
      setUserMap(uMap);

      setUsers(allUsers);
      setComments(allComments);
      setFavorites(allFavorites);
      
      setIsInitialLoading(false);

      // טעינת ריאקציות ברקע
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserEditFormData({
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin'
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser({
        ...editingUser,
        name: userEditFormData.name,
        email: userEditFormData.email,
        role: userEditFormData.isAdmin ? 'admin' : 'user',
      });
      // שימוש במפתח תרגום
      toast.success(t('toastUserUpdated'));
      setEditingUser(null);
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === editingUser._id 
          ? { ...u, name: userEditFormData.name, email: userEditFormData.email, role: userEditFormData.isAdmin ? 'admin' : 'user' }
          : u
      ));
    } catch (error) {
      // שימוש במפתח תרגום
      toast.error(t('toastUserUpdateFailed'));
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    // שימוש במפתח תרגום
    if (window.confirm(t('confirmDeleteBook'))) {
      try {
        await deleteBook(bookId);
        setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
        setTotalBooksCount(prev => Math.max(0, prev - 1));
        // שימוש במפתח תרגום
        toast.success(t('toastBookDeleted'));
      } catch (error) {
        // שימוש במפתח תרגום
        toast.error(t('toastBookDeleteFailed'));
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // שימוש במפתח תרגום
    if (window.confirm(t('common:confirmDelete'))) { // משתמש במפתח כללי 'confirmDelete'
      try {
        await deleteComment(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        // שימוש במפתח תרגום
        toast.success(t('toastCommentDeleted'));
      } catch (error) {
        // שימוש במפתח תרגום
        toast.error(t('toastCommentDeleteFailed'));
      }
    }
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/edit-book/${bookId}`, { state: { from: '/admin-dashboard' } });
  };

  const calculatedTotalReactions = Object.values(reactionCounts).reduce((acc: number, curr: any) => {
    const perCommentTotal = (curr.like || 0) + (curr.dislike || 0) + (curr.happy || 0) + (curr.angry || 0);
    return acc + perCommentTotal;
  }, 0);

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
            {/* שימוש במפתח תרגום */}
            <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('headerTitle')}</h1>
            {/* שימוש במפתח תרגום */}
            <p className="text-gray-600">{t('headerSubtitle')}</p>
          </div>
        </div>

        {/* --- Top Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isInitialLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Stat 1: Total Books */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* שימוש במפתח תרגום */}
                      <p className="text-sm text-gray-600 mb-1">{t('statTotalBooks')}</p>
                      <p className="text-3xl font-bold text-gray-900">{totalBooksCount || 0}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stat 2: Total Users */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* שימוש במפתח תרגום */}
                      <p className="text-sm text-gray-600 mb-1">{t('statTotalUsers')}</p>
                      <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stat 3: Total Comments */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* שימוש במפתח תרגום */}
                      <p className="text-sm text-gray-600 mb-1">{t('statTotalComments')}</p>
                      <p className="text-3xl font-bold text-gray-900">{comments.length}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stat 4: Total Favorites */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* שימוש במפתח תרגום */}
                      <p className="text-sm text-gray-600 mb-1">{t('statTotalFavorites')}</p>
                      <p className="text-3xl font-bold text-gray-900">{favorites}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* --- Middle Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Engagement Card */}
          {isReactionsLoading ? (
             <Card>
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-32" />
                     <Skeleton className="h-8 w-40" />
                   </div>
                   <Skeleton className="h-12 w-12 rounded-lg" />
                 </div>
                 <Skeleton className="h-4 w-64 mt-2" />
               </CardContent>
             </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {/* שימוש במפתח תרגום */}
                    <p className="text-sm text-gray-600 mb-1">{t('engagementTitle')}</p>
                    {/* שימוש במפתח תרגום עם אינטרפולציה */}
                    <p className="text-2xl font-bold text-gray-900">
                        {t('engagementReactions', { count: calculatedTotalReactions })}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                {/* שימוש במפתח תרגום עם אינטרפולציה */}
                <p className="text-sm text-gray-500">
                  {t('engagementAvg', { avg: (calculatedTotalReactions / Math.max(comments.length, 1)).toFixed(1) })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Activity Card */}
          {isBooksLoading ? (
             <Card>
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-32" />
                     <Skeleton className="h-8 w-40" />
                   </div>
                   <Skeleton className="h-12 w-12 rounded-lg" />
                 </div>
                 <Skeleton className="h-4 w-64 mt-2" />
               </CardContent>
             </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {/* שימוש במפתח תרגום עם אינטרפולציה */}
                    <p className="text-sm text-gray-600 mb-1">{t('activityTitle', { page: currentPage })}</p>
                    {/* שימוש במפתח תרגום עם אינטרפולציה */}
                    <p className="text-2xl font-bold text-gray-900">{t('activityBooksOnPage', { count: books.length })}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                {/* שימוש במפתח תרגום עם אינטרפולציה */}
                <p className="text-sm text-gray-500">
                    {t('activityShowing', { 
                        start: (currentPage - 1) * ITEMS_PER_PAGE + 1, 
                        end: Math.min(currentPage * ITEMS_PER_PAGE, totalBooksCount),
                        total: totalBooksCount
                    })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- Books Table --- */}
        <Card className="mb-4 shadow-sm border-0">
          <CardHeader>
            {/* שימוש במפתח תרגום */}
            <CardTitle>{t('booksTableTitle')}</CardTitle>
            {/* שימוש במפתח תרגום */}
            <CardDescription>{t('booksTableSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {/* שימוש במפתחות תרגום לראשי הטבלה */}
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tableHeaderTitle')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tableHeaderAuthor')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tableHeaderCategory')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tableHeaderUploader')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">{t('tableHeaderDate')}</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">{t('tableHeaderActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isBooksLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
                      </tr>
                    ))
                  ) : (
                    books.map((book) => (
                      <tr key={book._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{book.title}</td>
                        <td className="py-3 px-4 text-gray-600">{book.author}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            {book.category}
                          </span>
                        </td>
                        {/* כאן אין צורך בתרגום, זה שם משתמש */}
                        <td className="py-3 px-4 text-gray-600">{userMap[book.user_id] || t('common:loading')}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* --- Pagination Controls --- */}
        <div className="flex items-center justify-between mb-8 px-2">
          {/* שימוש במפתח תרגום עם אינטרפולציה */}
          <div className="text-sm text-gray-500">
            {t('paginationShowing', { 
                current: currentPage, 
                total: Math.max(totalPages, 1), 
                totalBooks: totalBooksCount 
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isBooksLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {/* שימוש במפתח תרגום */}
              {t('paginationPrevious')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || isBooksLoading}
            >
              {/* שימוש במפתח תרגום */}
              {t('paginationNext')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* --- Users List --- */}
        <Card className="mb-8 shadow-sm border-0">
          <CardHeader>
            {/* שימוש במפתח תרגום */}
            <CardTitle>{t('usersListTitle')}</CardTitle>
            {/* שימוש במפתח תרגום */}
            <CardDescription>{t('usersListSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isInitialLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col justify-between p-5 bg-white border rounded-xl shadow-sm">
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))
              ) : (
                users.map((user) => (
                  <div 
                    key={user._id} 
                    className="flex flex-col justify-between p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-50 to-indigo-100 border border-green-100 flex items-center justify-center text-green-600 text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            {user.role === 'admin' && (
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                 {/* שימוש במפתח תרגום */}
                                 {t('userRoleAdmin')}
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
                        <Edit className="h-3.5 w-3.5 mr-1.5" /> 
                        {/* שימוש במפתח תרגום */}
                        {t('userButtonEdit')}
                      </Button>

                      {currentUser?._id !== user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={async () => {
                            // שימוש במפתח תרגום עם אינטרפולציה
                            if (window.confirm(t('confirmDeleteUser', { userName: user.name }))) {
                              try {
                                await deleteUser(user._id);
                                setUsers(prev => prev.filter(u => u._id !== user._id));
                                toast.success(t('toastUserDeleted'));
                              } catch (error: any) {
                                toast.error(t('toastUserUpdateFailed'));
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> 
                          {/* שימוש במפתח תרגום */}
                          {t('userButtonDelete')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- Recent Comments --- */}
        <Card>
          <CardHeader>
            {/* שימוש במפתח תרגום */}
            <CardTitle>{t('recentCommentsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isInitialLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))
              ) : (
                recentComments.map((comment) => {
                  const book = booksMap[comment.book_id];
                  return (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">
                              {/* שימוש במפתח תרגום */}
                              {userMap[comment.user_id] + ' ' || t('commentUnknownUser')}
                            </span>
                            {/* שימוש במפתח תרגום */}
                            {' '}{t('commentOnBook')}{' '}
                            <span
                              className="text-green-600 hover:underline cursor-pointer"
                              onClick={() => navigate(`/book/${comment.book_id}`)}
                            >
                              {/* שימוש במפתח תרגום */}
                              {book?.title || t('commentUnknownBook')}
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
                        {/* כאן אין צורך בתרגום, אלה אימוג'ים ומספרים */}
                        <span>👍 {reactionCounts[comment.id]?.like ?? 0}</span>
                        <span>👎 {reactionCounts[comment.id]?.dislike ?? 0}</span>
                        <span>😊 {reactionCounts[comment.id]?.happy ?? 0}</span>
                        <span>😡 {reactionCounts[comment.id]?.angry ?? 0}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog remains the same... */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="bg-white sm:max-w-[425px] border-gray-200 shadow-xl z-50 rounded-xl">
          <DialogHeader>
            {/* שימוש במפתח תרגום */}
            <DialogTitle className="text-xl font-semibold text-gray-900">{t('dialogEditTitle')}</DialogTitle>
            {/* שימוש במפתח תרגום */}
            <DialogDescription className="text-gray-500">
              {t('dialogEditDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {/* שימוש במפתח תרגום */}
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">{t('dialogLabelName')}</Label>
              <Input
                id="edit-name"
                value={userEditFormData.name}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                onChange={(e) => setUserEditFormData({ ...userEditFormData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              {/* שימוש במפתח תרגום */}
              <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">{t('dialogLabelEmail')}</Label>
              <Input
                id="edit-email"
                value={userEditFormData.email}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                onChange={(e) => setUserEditFormData({ ...userEditFormData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              {/* שימוש במפתח תרגום */}
              <Label htmlFor="edit-isAdmin" className="text-sm font-medium text-gray-700">{t('dialogLabelRole')}</Label>
              <Select
                value={userEditFormData.isAdmin ? 'true' : 'false'}
                onValueChange={(value) => setUserEditFormData({ ...userEditFormData, isAdmin: value === 'true' })}
              >
                <SelectTrigger id="edit-isAdmin" className="border-gray-300">
                  <SelectValue placeholder="Select admin status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="true" className="hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      {/* שימוש במפתח תרגום */}
                      <span>{t('dialogRoleAdmin')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="false" className="hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      {/* שימוש במפתח תרגום */}
                      <span>{t('dialogRoleUser')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setEditingUser(null)} className="border-gray-300">
              {/* שימוש במפתח תרגום */}
              {t('dialogCancel')}
            </Button>
            <Button onClick={handleUpdateUser} className="bg-green-600 hover:bg-green-700 text-white">
              {/* שימוש במפתח תרגום */}
              {t('dialogSaveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}