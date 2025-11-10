import bookModel from "../models/bookModel.js";
import { generateBookSummary, getBookRecommendations } from "../services/aiService.js";

export const createBook = async (req, res) => {
    const bookData = req.body;
    try {
        //need to add ai summary generation here
        const summary = await generateBookSummary(bookData.title, bookData.author, bookData.description);
        bookData.ai_summary = summary;
        const newBook = await bookModel.create({ ...bookData, ai_summary: summary ,user_id: req.user._id});
        return res.status(201).json(newBook);
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({ error: "Failed to create book" });
    }
}

export const getAllBooks = async (req, res) => {
    try {
        const books = await bookModel.findAll();
        
        return res.status(200).json(books);
    } catch (error) {
        console.log("error", error);
        
        return res.status(500).json({ error: "Failed to retrieve books" });
    }
}
export const getBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await bookModel.findById(id);
        console.log("the book is",book);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve book" });
    }
}
export const updateBook = async (req, res) => {
    //validation that only the owner can update
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    const userBook = await bookModel.findById(id);
    if (!userBook) {
        return res.status(404).json({ error: "Book not found" });
    }
    if (userBook.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const updatedBook = await bookModel.update(id, updates);
        if (!updatedBook) {
            return res.status(404).json({ error: "Book not found" });
        }
        return res.status(200).json(updatedBook);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to update book" });
    }
}
export const deleteBook = async (req, res) => {
const userId = req.user._id;
    const userBook = await bookModel.findById(req.params.id);
    const { id } = req.params;
    if (!userBook) {
        return res.status(404).json({ error: "Book not found" });
    }
    if (userBook.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const book = await bookModel.remove(id);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        return res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete book" });
    }
}
export const getBooksByPage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const books = await bookModel.findAll();
        const totalPages = Math.ceil(books.length / limit);
        const currentPageBooks = books.slice(offset, offset + limit);
        return res.status(200).json({ totalPages, currentPageBooks });
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve books" });
    }
}
///books/search?s=harry&page=1

export const searchBooks = async (req, res) => {
    const searchTerm = req.query.s || "";
    console.log('Search term:', searchTerm);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const books = await bookModel.findAll();
        const filteredBooks = books.filter(book => book.title.includes(searchTerm));
        const totalPages = Math.ceil(filteredBooks.length / limit);
        const currentPageBooks = filteredBooks.slice(offset, offset + limit);
        return res.status(200).json({ totalPages, currentPageBooks });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({ error: "Failed to retrieve books" });
    }
}   
// /books/category/:catName

export const getBooksByCategory = async (req, res) => {
    const { catName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const books = await bookModel.findAll();
        const filteredBooks = books.filter(book => book.category === catName);
        const totalPages = Math.ceil(filteredBooks.length / limit);
        const currentPageBooks = filteredBooks.slice(offset, offset + limit);
        return res.status(200).json({ totalPages, currentPageBooks });
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve books" });
    }
}
//get books by user id
export const getBooksByUserId = async (req, res) => {
    const { userId } = req.params;
    if(req.user._id !== userId){
        return  res.status(403).json({ error: "Forbidden" });
    }
    try {
        const books = await bookModel.findAll();
        const booksByUserId = books.filter(book => book.user_id === userId);
        return res.status(200).json({booksByUserId});
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve books" });
    }
}
export const getRecomendedBooks = async (req, res) => {
    const userId = req.user._id;
    if(!userId){
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const favoriteBooks = await bookModel.getFavoriteBooks(userId);
        const allBooks = await bookModel.findAll();
        //call ai service to get recommendations
        const recommendations = await getBookRecommendations(favoriteBooks, allBooks);
        return res.status(200).json(recommendations);
    }catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to retrieve recommendations" });
    }
}