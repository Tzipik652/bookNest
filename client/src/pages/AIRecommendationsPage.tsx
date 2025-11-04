import { useState } from 'react';
import { BookCard } from '../components/BookCard';
import { getAIRecommendations, getFavoriteBooks } from '../lib/storage';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export function AIRecommendationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const recommendations = getAIRecommendations();
  const favoriteBooks = getFavoriteBooks();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshKey(k => k + 1);
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1>AI Recommendations</h1>
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            Our AI analyzes your favorite books to suggest titles you might enjoy
          </p>

          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              {favoriteBooks.length > 0 
                ? `Based on your ${favoriteBooks.length} favorite ${favoriteBooks.length === 1 ? 'book' : 'books'}, we've found these recommendations for you`
                : 'Add some books to your favorites to get personalized recommendations'}
            </AlertDescription>
          </Alert>

          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Generating...' : 'Get More Recommendations'}
            </Button>
          </div>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map(book => (
              <BookCard 
                key={`${book.id}-${refreshKey}`} 
                book={book}
                onFavoriteChange={() => setRefreshKey(k => k + 1)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="mb-2">No Recommendations Available</h2>
            <p className="text-gray-600">Add some books to your favorites to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
