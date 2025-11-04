import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getBookById, getCurrentUser, isFavorite, toggleFavorite, deleteBook } from '../lib/storage';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Heart, ArrowLeft, Edit, Trash2, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [favorited, setFavorited] = useState(id ? isFavorite(id) : false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const book = id ? getBookById(id) : null;

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Book Not Found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === book.uploaderId;

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const newState = toggleFavorite(book.id);
    setFavorited(newState);
  };

  const handleDelete = () => {
    try {
      deleteBook(book.id);
      navigate('/my-books');
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Cover */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-[3/4]">
                <ImageWithFallback
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{book.category}</Badge>
                {book.price && (
                  <span className="text-xl">${book.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleFavoriteToggle}
                variant={favorited ? 'default' : 'outline'}
                className="gap-2"
              >
                <Heart className={favorited ? 'fill-current' : ''} />
                {favorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>

              {isOwner && (
                <>
                  <Button
                    onClick={() => navigate(`/edit-book/${book.id}`)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3>AI Summary</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{book.aiSummary}</p>
            </div>

            {/* Uploader Info */}
            <div className="text-sm text-gray-500">
              <p>Uploaded by {book.uploaderName}</p>
              <p>{new Date(book.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{book.title}" from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}