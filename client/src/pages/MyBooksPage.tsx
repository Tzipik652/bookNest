import { useState } from 'react';
import { BookCard } from '../components/BookCard';
import { getUserBooks } from '../lib/storage';
import { Input } from '../components/ui/input';
import { Search, BookPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MyBooksPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const books = getUserBooks();
  
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1>My Books</h1>
          <Button onClick={() => navigate('/add-book')} className="gap-2">
            <BookPlus className="h-4 w-4" />
            Add New Book
          </Button>
        </div>
        
        {books.length > 0 ? (
          <>
            {/* Search */}
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search your books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Books Grid */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                  <BookCard 
                    key={`${book.id}-${refreshKey}`} 
                    book={book}
                    onFavoriteChange={() => setRefreshKey(k => k + 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No books found matching your search.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BookPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="mb-2">No Books Yet</h2>
            <p className="text-gray-600 mb-6">Start building your library by adding your first book</p>
            <Button onClick={() => navigate('/add-book')} className="gap-2">
              <BookPlus className="h-4 w-4" />
              Add Your First Book
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
