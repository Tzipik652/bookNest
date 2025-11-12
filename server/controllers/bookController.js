import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import bookModel from "../models/bookModel.js";
import {
  generateBookSummary,
  getBookRecommendations,
} from "../services/aiService.js";

export const createBook = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const bookData = req.body;
  if (!userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (!bookData || Object.keys(bookData).length === 0) {
    return res.status(400).json({ error: "Book data is required" });
  }
  if (!bookData.title || !bookData.description) {
    throw new AppError("Missing required fields: title or description", 400);
  }

  const summary = await generateBookSummary(
    bookData.title,
    bookData.author,
    bookData.description
  );

  const newBook = await bookModel.create({
    ...bookData,
    ai_summary: summary,
    user_id: req.user._id,
  });

  res.status(201).json(newBook);
});

// export const getAllBooks = catchAsync(async (req, res) => {
//   const books = await bookModel.findAll();
//   res.status(200).json(books);
// });
export const getAllBooks = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { data: books, count: totalItems } = await bookModel.findPaginated(
      page,
      limit
    );
    const totalPages = Math.ceil(totalItems / limit);
    res.status(200).json({
      books: books,
      currentPage: page,
      limit: limit,
      totalItems: totalItems,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("Error fetching paginated books:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
export const getBooksByCategory = catchAsync(async (req, res) => {
  const pageParam = req.query.page;
  if (!pageParam) {
    try {
      const { catName } = req.params;
      let books;
      if (catName === "All") {
        books = await bookModel.findAll();
      } else {
        books = await bookModel.getBooksByCategory(catName);
      }
      res.status(200).json(books);
    } catch (error) {
      console.error("Error fetching books by category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    try {
      const { catName } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { data: books, count: totalItems } = await bookModel.findPaginated(
        page,
        limit,
        catName
      );
      const totalPages = Math.ceil(totalItems / limit);
      res.status(200).json({
        books: books,
        currentPage: page,
        limit: limit,
        totalItems: totalItems,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error("Error fetching paginated books:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

export const getBookById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const book = await bookModel.findById(id);
  if (!book) throw new AppError("Book not found", 404);
  res.status(200).json(book);
});

export const updateBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user._id;

  const book = await bookModel.findById(id);
  if (!book) throw new AppError("Book not found", 404);
  if (book.user_id !== userId) throw new AppError("Forbidden", 403);

  const updatedBook = await bookModel.update(id, updates);
  res.status(200).json(updatedBook);
});

export const deleteBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const book = await bookModel.findById(id);
  if (!book) throw new AppError("Book not found", 404);
  if (book.user_id !== userId) throw new AppError("Forbidden", 403);

  await bookModel.remove(id);
  res.status(200).json({ message: "Book deleted successfully" });
});

export const searchBooks = catchAsync(async (req, res) => {
  const searchTerm = req.query.s || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const books = await bookModel.findAll();
  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / limit);
  const currentPageBooks = filteredBooks.slice(offset, offset + limit);

  res.status(200).json({ totalPages, currentPageBooks });
});

export const getBooksByUserId = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  if (!userId) throw new AppError("Forbidden", 403);
  const books = await bookModel.findAll();
  const userBooks = books.filter((b) => b.user_id === userId);
  res.status(200).json(userBooks);
});

export const getCachedRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  if (!userId) throw new AppError("Forbidden", 403);

  const favoriteBooks = await bookModel.getFavoriteBooks(userId);
  const allBooks = await bookModel.findAll();
  const cacheKey = `recommendations:${userId}:${favoriteBooks
    .map((b) => b._id)
    .join(",")}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const recommendations = await getBookRecommendations(favoriteBooks, allBooks);

  await redisClient.setEx(cacheKey, 60 * 5, JSON.stringify(recommendations));

  res.status(200).json(recommendations);
});


//   const userId = req.user._id;
//   if (!userId) {
//     return res.status(403).json({ error: "Forbidden" });
//   }
//   try {
//     const favoriteBooks = await bookModel.getFavoriteBooks(userId);
//     const allBooks = await bookModel.findAll();
//     const recommendationsWithReasons = await getBookRecommendations(
//       favoriteBooks,
//       allBooks
//     );
//     const recommendedIds = recommendationsWithReasons.map((rec) => rec.id);

//     const fullBooks = await bookModel.findBooksByIds(recommendedIds);
//     return res.status(200).json(fullBooks);
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ error: "Failed to retrieve recommendations" });
//   }
// };
