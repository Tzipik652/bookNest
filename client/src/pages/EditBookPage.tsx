import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookById, updateBook } from '../lib/storage';
import { categories } from '../lib/mockData';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Container,
  Typography,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, AutoAwesome } from '@mui/icons-material';
import { useUserStore } from '../store/useUserStore';

export function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const book = getBookById(id);
    if (!book) {
      navigate('/home');
      return;
    }

    if (book.uploaderId !== currentUser?._id) {
      navigate(`/book/${id}`);
      return;
    }

    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description);
    setCategory(book.category);
    setImageUrl(book.imageUrl);
    setPrice(book.price?.toString() || '');
  }, [id, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !author || !description || !category || !id) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      updateBook(id, {
        title,
        author,
        description,
        category,
        imageUrl,
        price: price ? parseFloat(price) : undefined,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      navigate(`/book/${id}`);
    } catch (err) {
      setError('Failed to update book. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', py: 6 }}>
      <Container maxWidth="sm">
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Back
        </Button>

        <Card sx={{ p: 2 }}>
          <CardHeader
            title="Edit Book"
            subheader="Update book information. AI will regenerate the summary if you change key details."
          />

          <form onSubmit={handleSubmit}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <Alert icon={<AutoAwesome />} severity="info">
                AI summary will be regenerated if title, description, or category changes
              </Alert>

              <TextField
                label="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextField
                label="Author *"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />

              <TextField
                label="Description *"
                multiline
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <TextField
                select
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories
                  .filter((cat) => cat !== 'All')
                  .map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                label="Image URL"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />

              <TextField
                label="Price (Optional)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </CardContent>

            <CardActions sx={{ gap: 2, px: 3, pb: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
