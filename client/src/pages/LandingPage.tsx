// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { BookCard } from '../components/BookCard';
// import { getBooks } from '../lib/storage';
// import { categories } from '../lib/mockData';
// import { Search } from 'lucide-react';
// import {
//   Box,
//   Button,
//   Container,
//   Grid,
//   Typography,
//   TextField,
//   InputAdornment,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from '@mui/material';

// export function LandingPage() {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');

//   const books = getBooks();

//   const filteredBooks = books.filter((book) => {
//     const matchesSearch =
//       book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       book.author.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
//       {/* Hero Section */}
//       <Box
//         sx={{
//           bgcolor: 'primary.main',
//           color: 'white',
//           py: 12,
//           textAlign: 'center',
//         }}
//       >
//         <Container maxWidth="md">
//           <Typography variant="h3" component="h1" gutterBottom>
//             Welcome to BookNest
//           </Typography>
//           <Typography variant="h6" mb={4}>
//             Discover, organize, and share your favorite books with AI-powered recommendations
//           </Typography>
//           <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => navigate('/login')}
//             >
//               Login
//             </Button>
//             <Button
//               variant="outlined"
//               color="inherit"
//               onClick={() => navigate('/register')}
//               sx={{
//                 borderColor: 'white',
//                 color: 'white',
//                 '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
//               }}
//             >
//               Register
//             </Button>
//           </Box>
//         </Container>
//       </Box>

//       {/* Browse Section */}
//       <Container maxWidth="lg" sx={{ py: 8 }}>
//         <Typography variant="h4" textAlign="center" mb={6}>
//           Browse Our Collection
//         </Typography>

//         {/* Filters */}
//         <Box
//           sx={{
//             display: 'flex',
//             gap: 2,
//             mb: 6,
//             flexWrap: 'wrap',
//             justifyContent: 'center',
//           }}
//         >
//           <TextField
//             placeholder="Search books or authors..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{ minWidth: 250, flex: 1, maxWidth: 400 }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search size={18} />
//                 </InputAdornment>
//               ),
//             }}
//           />

//           <FormControl sx={{ minWidth: 150 }}>
//             <InputLabel>Category</InputLabel>
//             <Select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               label="Category"
//             >
//               {categories.map((category) => (
//                 <MenuItem key={category} value={category}>
//                   {category}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>

//         {/* Books Grid */}
//         {filteredBooks.length > 0 ? (
//           <Grid container spacing={3}>
//             {filteredBooks.map((book) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
//                 <BookCard book={book} />
//               </Grid>
//             ))}
//           </Grid>
//         ) : (
//           <Box textAlign="center" py={12}>
//             <Typography color="text.secondary">No books found matching your criteria.</Typography>
//           </Box>
//         )}
//       </Container>
//     </Box>
//   );
// }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCard } from '../components/BookCard';
import { getBooks } from '../lib/storage';
import { categories } from '../lib/mockData';
import { Search } from 'lucide-react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const books = getBooks();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to BookNest
          </Typography>
          <Typography variant="h6" mb={4}>
            Discover, organize, and share your favorite books with AI-powered recommendations
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/register')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Register
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Browse Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" mb={6}>
          Browse Our Collection
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <TextField
            placeholder="Search books or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 250, flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Books Flexbox */}
        {filteredBooks.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
            {filteredBooks.map((book) => (
              <Box
                key={book.id}
                flex="1 1 calc(25% - 24px)"
                minWidth={250}
                maxWidth={300}
              >
                <BookCard book={book} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={12}>
            <Typography color="text.secondary">
              No books found matching your criteria.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
