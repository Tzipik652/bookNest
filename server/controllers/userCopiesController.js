import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import userCopiesModel from "../models/userCopiesModel.js";

const addCopy = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const {
    user_copy: { book_id, ...restUserCopy },
  } = req.body;
  if (!book_id) {
    throw new AppError("bookId are required", 400);
  }
  const alreadyExist = await userCopiesModel.isCopyExist(userId, book_id);
  if (alreadyExist) {
    throw new AppError("Copy already exist", 400);
    // const copy = await userCopiesModel.findByBookId(book_id);
    // console.log(copy);
    // if (!copy) {
    //   throw new AppError("Copy not found", 404);
    // }
    // const copyUpdated = await userCopiesModel.update(copy[0].id, {
    // });
    // res.status(200).json({
    //   data: copyUpdated,
    //   success: true,
    //   message: "Copy updated successfully",
    // });
  }
  const copy = await userCopiesModel.add({
    userId,
    bookId: book_id,
    restUserCopy,
  });
  res
    .status(201)
    .json({ data: copy, success: true, message: "Copy added successfully" });
});

const changeStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { copyId } = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!copyId) {
    throw new AppError("copyId are required", 400);
  }
  const copy = await userCopiesModel.findById(copyId);
  if (!copy) {
    throw new AppError("Copy not found", 404);
  }
  if (
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to change the status of this copy",
      401
    );
  }
  const copyUpdated = await userCopiesModel.update(copyId, {
    is_available_for_loan: !copy.is_available_for_loan,
  });
  res.status(200).json({
    data: copyUpdated,
    success: true,
    message: "Copy status changed successfully",
  });
});

const changeLoanLocation = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { copyId } = req.params;
  const { loan_location_lat, loan_location_lon } = req.body;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!copyId) {
    throw new AppError("copyId are required", 400);
  }
  const copy = await userCopiesModel.findById(copyId);
  if (!copy) {
    throw new AppError("Copy not found", 404);
  }
  if (
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to change the location of this copy",
      401
    );
  }
  const copyUpdated = await userCopiesModel.update(copyId, {
    loan_location_lat: loan_location_lat,
    loan_location_lon: loan_location_lon,
  });
  res.status(200).json({
    data: copyUpdated,
    success: true,
    message: "Copy location changed successfully",
  });
});

const deleteCopy = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { copyId } = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!copyId) {
    throw new AppError("copyId are required", 400);
  }
  const copy = await userCopiesModel.findById(copyId);
  if (!copy) {
    throw new AppError("Copy not found", 404);
  }
  if (
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("You are not authorized to delete this copy", 401);
  }
  await userCopiesModel.remove(copyId);
  res.status(200).json({ success: true, message: "Copy deleted successfully" });
});

const getCopies = catchAsync(async (req, res, next) => {
  const copies = await userCopiesModel.findAll();
  res.status(200).json({
    data: copies,
    success: true,
    message: "Copies fetched successfully",
  });
});

const getCopyById = catchAsync(async (req, res, next) => {
  const { copyId } = req.params;
  const copy = await userCopiesModel.findById(copyId);
  if (!copy) {
    throw new AppError("Copy not found", 404);
  }
  res
    .status(200)
    .json({ data: copy, success: true, message: "Copy fetched successfully" });
});

const getUserCopies = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  const copies = await userCopiesModel.findByUserId(userId);
  if (!copies) {
    throw new AppError("Copies not found", 404);
  }
  res.status(200).json({
    data: copies,
    success: true,
    message: "Copies fetched successfully",
  });
});

const getBookCopies = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const copies = await userCopiesModel.findByBookId(bookId);
  if (!copies) {
    throw new AppError("Copies not found", 404);
  }
  res.status(200).json({
    data: copies,
    success: true,
    message: "Copies fetched successfully",
  });
});
const getBookCopyByUserId = catchAsync(async (req, res, next) => {
  const { userId, bookId } = req.params;
  const copy = await userCopiesModel.findBookCopyByUserId(userId,bookId);
  if (!copy) {
    throw new AppError("Copy not found", 404);
  }
  res.status(200).json({
    data: copy,
    success: true,
    message: "Copy fetched successfully",
  });
});
const getAvailableCopiesForBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  if (!bookId) {
    throw new AppError("bookId are required", 400);
  }
  console.log("getAvailableCopiesForBook :controller",bookId)
  const copies = await userCopiesModel.getAvailableCopiesForBook(bookId);
  if (!copies) {
    throw new AppError("Copies not found", 404);
  }
  console.log("getAvailableCopiesForBook :controller",copies)
  res.status(200).json({
    data: copies,
    success: true,
    message: "Copies fetched successfully",
  });
});
export default {
  addCopy,
  changeStatus,
  changeLoanLocation,
  deleteCopy,
  getCopies,
  getCopyById,
  getUserCopies,
  getBookCopies,
  getAvailableCopiesForBook,
  getBookCopyByUserId,
};
