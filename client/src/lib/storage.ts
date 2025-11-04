import { User, Book, Favorite } from '../types';
import { initialBooks } from './mockData';

// Mock users database
const MOCK_USERS = [
  { id: 'demo-user', email: 'demo@booknest.com', password: 'demo123', name: 'Demo User' },
  { id: 'other-user', email: 'jane@example.com', password: 'password', name: 'Jane Reader' }
];

// Authentication
export const login = (email: string, password: string): User | null => {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  return null;
};

export const register = (email: string, password: string, name: string): User | null => {
  // Check if user already exists
  if (MOCK_USERS.find(u => u.email === email)) {
    return null;
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name
  };
  
  MOCK_USERS.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Books management
export const initializeBooks = () => {
  if (!localStorage.getItem('books')) {
    localStorage.setItem('books', JSON.stringify(initialBooks));
  }
};

export const getBooks = (): Book[] => {
  initializeBooks();
  const booksStr = localStorage.getItem('books');
  return booksStr ? JSON.parse(booksStr) : [];
};

export const getBookById = (id: string): Book | null => {
  const books = getBooks();
  return books.find(b => b.id === id) || null;
};

export const addBook = (book: Omit<Book, 'id' | 'createdAt' | 'uploaderId' | 'uploaderName' | 'aiSummary'>): Book => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in to add books');
  
  // Generate mock AI summary
  const aiSummary = generateMockAISummary(book.title, book.description, book.category);
  
  const newBook: Book = {
    ...book,
    id: `book-${Date.now()}`,
    uploaderId: currentUser.id,
    uploaderName: currentUser.name,
    aiSummary,
    createdAt: new Date().toISOString()
  };
  
  const books = getBooks();
  books.push(newBook);
  localStorage.setItem('books', JSON.stringify(books));
  return newBook;
};

export const updateBook = (id: string, updates: Partial<Book>): Book | null => {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  
  if (index === -1) return null;
  
  const currentUser = getCurrentUser();
  if (books[index].uploaderId !== currentUser?.id) {
    throw new Error('Unauthorized');
  }
  
  // If title, description, or category changed, regenerate AI summary
  if (updates.title || updates.description || updates.category) {
    const book = books[index];
    updates.aiSummary = generateMockAISummary(
      updates.title || book.title,
      updates.description || book.description,
      updates.category || book.category
    );
  }
  
  books[index] = { ...books[index], ...updates };
  localStorage.setItem('books', JSON.stringify(books));
  return books[index];
};

export const deleteBook = (id: string): boolean => {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  
  if (!book) return false;
  
  const currentUser = getCurrentUser();
  if (book.uploaderId !== currentUser?.id) {
    throw new Error('Unauthorized');
  }
  
  const filtered = books.filter(b => b.id !== id);
  localStorage.setItem('books', JSON.stringify(filtered));
  
  // Also remove from favorites
  const favorites = getFavorites();
  const filteredFavorites = favorites.filter(f => f.bookId !== id);
  localStorage.setItem('favorites', JSON.stringify(filteredFavorites));
  
  return true;
};

export const getUserBooks = (): Book[] => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const books = getBooks();
  return books.filter(b => b.uploaderId === currentUser.id);
};

// Favorites management
export const getFavorites = (): Favorite[] => {
  const favStr = localStorage.getItem('favorites');
  return favStr ? JSON.parse(favStr) : [];
};

export const getFavoriteBooks = (): Book[] => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const favorites = getFavorites();
  const userFavorites = favorites.filter(f => f.userId === currentUser.id);
  const books = getBooks();
  
  return userFavorites
    .map(f => books.find(b => b.id === f.bookId))
    .filter((b): b is Book => b !== undefined);
};

export const isFavorite = (bookId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const favorites = getFavorites();
  return favorites.some(f => f.userId === currentUser.id && f.bookId === bookId);
};

export const addFavorite = (bookId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const favorites = getFavorites();
  
  // Check if already favorited
  if (favorites.some(f => f.userId === currentUser.id && f.bookId === bookId)) {
    return;
  }
  
  favorites.push({ userId: currentUser.id, bookId });
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

export const removeFavorite = (bookId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const favorites = getFavorites();
  const filtered = favorites.filter(
    f => !(f.userId === currentUser.id && f.bookId === bookId)
  );
  localStorage.setItem('favorites', JSON.stringify(filtered));
};

export const toggleFavorite = (bookId: string): boolean => {
  if (isFavorite(bookId)) {
    removeFavorite(bookId);
    return false;
  } else {
    addFavorite(bookId);
    return true;
  }
};

// AI Recommendations
export const getAIRecommendations = (): Book[] => {
  const favoriteBooks = getFavoriteBooks();
  const allBooks = getBooks();
  
  if (favoriteBooks.length === 0) {
    // If no favorites, return random selection
    return allBooks.slice(0, 5);
  }
  
  // Get categories from favorite books
  const favoriteCategories = favoriteBooks.map(b => b.category);
  
  // Find books with similar categories that aren't already favorited
  const favoriteIds = new Set(favoriteBooks.map(b => b.id));
  const recommendations = allBooks
    .filter(b => !favoriteIds.has(b.id))
    .filter(b => favoriteCategories.includes(b.category))
    .slice(0, 5);
  
  // If not enough recommendations, add some random ones
  if (recommendations.length < 5) {
    const remainingBooks = allBooks
      .filter(b => !favoriteIds.has(b.id))
      .filter(b => !recommendations.some(r => r.id === b.id))
      .slice(0, 5 - recommendations.length);
    
    recommendations.push(...remainingBooks);
  }
  
  return recommendations;
};

// Helper function to generate mock AI summaries
function generateMockAISummary(title: string, description: string, category: string): string {
  const summaries = [
    `An engaging ${category.toLowerCase()} work that explores ${description.toLowerCase()}. This book offers unique insights and compelling narratives that will keep readers engaged from start to finish.`,
    `${title} is a remarkable ${category.toLowerCase()} title that delves into ${description.toLowerCase()}. Rich in detail and thoughtfully crafted, this book provides both entertainment and intellectual stimulation.`,
    `A must-read ${category.toLowerCase()} that masterfully examines ${description.toLowerCase()}. The author's expertise shines through every page, making complex ideas accessible and engaging.`
  ];
  
  return summaries[Math.floor(Math.random() * summaries.length)];
}