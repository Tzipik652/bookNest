import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { getBookById, updateBook } from '../lib/storage';
import { Book, Category } from '../types';
import { getBookById, updateBook } from '../services/bookService';
import { getCategories } from "../services/categoryService";
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
  

  const [book, setBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [img_url, setimg_url] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const data = await getBookById(id);
        if (!data) {
          navigate('/home');
          return;
        }
        if (data.uploaderId !== currentUser?._id) {
          navigate(`/book/${id}`);
          return;
        }

    if (book?.uploaderId !== currentUser?._id) {
      navigate(`/book/${id}`);
      return;
    }
        setBook(data);
        setTitle(data.title);
        setAuthor(data.author);
        setDescription(data.description);
        setCategory(data.category);
        setimg_url(data.img_url);
        setPrice(data.price?.toString() || '');
      } catch (err) {
        console.error(err);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
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
      await updateBook(id, {
        title,
        author,
        description,
        category,
        img_url,
        price: price ? parseFloat(price) : undefined,
      });

      navigate(`/book/${id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to update book. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

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
                {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
              </TextField>

              <TextField
                label="Image URL"
                type="url"
                value={img_url}
                onChange={(e) => setimg_url(e.target.value)}
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
