import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { userCopiesModel } from "../models/userCopiesModel.js";

export const addCopy = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bookId, ...rest } = req.body;
  if (!userId || !bookId) {
    throw new AppError("userId or bookId are required", 400);
  }
  const alreadyExist = await userCopiesModel.isCopyExist(userId, bookId);
  if (alreadyExist) {
    throw new AppError("Copy already exist", 400);
  }
  const copy = await userCopiesModel.add({ userId, bookId, rest });
  res
    .status(201)
    .json({ data: copy, success: true, message: "Copy added successfully" });
});

export const changeStatus = catchAsync(async (req, res, next) => {
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
    copy.owner_id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to change the status of this copy",
      401
    );
  }
  const copyUpdated = await userCopiesModel.update(copyId, {
    ...copy,
    is_available_for_loan: !copy.is_available_for_loan,
  });
  res.status(200).json({
    data: copyUpdated,
    success: true,
    message: "Copy status changed successfully",
  });
});

export const changeLoanLocation = catchAsync(async (req, res, next) => {
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
    copy.owner_id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to change the location of this copy",
      401
    );
  }
  const copyUpdated = await userCopiesModel.update(copyId, {
    ...copy,
    loan_location_lat: loan_location_lat,
    loan_location_lon: loan_location_lon,
  });
  res.status(200).json({
    data: copyUpdated,
    success: true,
    message: "Copy location changed successfully",
  });
});

export const deleteCopy = catchAsync(async (req, res, next) => {
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
    copy.owner_id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("You are not authorized to delete this copy", 401);
  }
  await userCopiesModel.remove(copyId);
  res.status(200).json({ success: true, message: "Copy deleted successfully" });
});

export const getCopies = catchAsync(async (req, res, next) => {
  const copies = await userCopiesModel.findAll();
  res
    .status(200)
    .json({ data: copies, success: true, message: "Copies fetched successfully" });
});

export const getCopyById = catchAsync(async (req, res, next) => {
  const { copyId } = req.params;
  const copy = await userCopiesModel.findById(copyId);
  if (!copy) {
    throw new AppError("Copy not found", 404);
  }
  res
    .status(200)
    .json({ data: copy, success: true, message: "Copy fetched successfully" });
});

export const getUserCopies = catchAsync(async (req, res, next) => {
  const {userId} = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  const copies = await userCopiesModel.findByUserId(userId);
  if (!copies) {
    throw new AppError("Copies not found", 404);
  }
  res
    .status(200)
    .json({
      data: copies,
      success: true,
      message: "Copies fetched successfully",
    });
});

export const getBookCopies = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const copies = await userCopiesModel.findByBookId(bookId);
  if (!copies) {
    throw new AppError("Copies not found", 404);
  }
  res.status(200);
  json({ data: copies, success: true, message: "Copies fetched successfully" });
});
