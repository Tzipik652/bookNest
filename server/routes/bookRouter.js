import express from 'express';
import { createBook, deleteBook, getAllBooks, getBookById, getBooksByCategory, getBooksByUserId, getRecomendedBooks, searchBooks, updateBook } from '../controllers/bookConroller.js';
import { verifyJWT } from '../middleware/auth.js';
const router = express.Router();

router.get('/', getAllBooks);
router.post('/',verifyJWT, createBook);
// router.get('/page',getBooksByPage);
///books/search?s=harry&page=1
router.get('/search' ,searchBooks);
router.get('/recommendations',verifyJWT,getRecomendedBooks);
///books/category/:catName
router.get('/category/:catName',getBooksByCategory);
router.get('/user',verifyJWT, getBooksByUserId);
router.get('/:id',getBookById);
router.put('/:id',verifyJWT, updateBook);
router.delete('/:id',verifyJWT, deleteBook);


export default router;