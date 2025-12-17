import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import loansModel from "../models/loansModel.js";
import userCopiesModel from "../models/userCopiesModel.js";

const addLoan = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { user_copy_id } = req.body;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!user_copy_id) {
    throw new AppError("user_copy_id are required", 400);
  }
  const copy = await userCopiesModel.findById(user_copy_id);
  if (!copy) {
    throw new AppError("copy not found", 404);
  }
  if (copy.owner_id._id.toString() === userId.toString()) {
    throw new AppError("You cannot loan your own copy", 400);
  }
  const loanData = {
    userCopyId: user_copy_id,
    borrowerId: userId,
  };

  const loan = await loansModel.add(loanData);
  res
    .status(201)
    .json({ data: loan, success: true, message: "loan added successfully" });
});

const changeStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { loanId } = req.params;
  const { status } = req.body;
  const allowed = ["REQUESTED", "APPROVED", "ACTIVE", "RETURNED", "OVERDUE", "CANCELED"];
  if (!allowed.includes(status)) {
    throw new AppError("Invalid status", 400);
  }
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  const loan = await loansModel.findLoanById(loanId);
  if (!loan) {
    throw new AppError("loan not found", 404);
  }
  const copy = await userCopiesModel.findById(loan.user_copy_id.id);
  if (!copy) {
    throw new AppError("copy not found", 404);
  }
  if (
    loan.borrower_id._id.toString() !== userId.toString() &&
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to change the status of this loan",
      401
    );
  }
  const loanUpdated = await loansModel.update(loanId, {
    status: status    
  });
  res.status(200).json({
    data: loanUpdated,
    success: true,
    message: "loan status changed successfully",
  });
});

const updateLoanStartDate = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { loanId } = req.params;
  const { loanStartDate } = req.body;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  const loan = await loansModel.findLoanById(loanId);
  if (!loan) {
    throw new AppError("loan not found", 404);
  }
  const copy = await userCopiesModel.findById(loan.user_copy_id.id);
  if (!copy) {
    throw new AppError("copy not found", 404);
  }
  if (
    loan.borrower_id._id.toString() !== userId.toString() &&
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to update the loan start date of this loan",
      401
    );
  }
  const loanUpdated = await loansModel.update(loanId, {
    loan_start_date: loanStartDate,
  });
  res.status(200).json({
    data: loanUpdated,
    success: true,
    message: "loan start date updated successfully",
  });
});

const updateDueDate = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { loanId } = req.params;
  const { due_date } = req.body;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  const loan = await loansModel.findLoanById(loanId);
  if (!loan) {
    throw new AppError("loan not found", 404);
  }
  const copy = await userCopiesModel.findById(loan.user_copy_id.id);
  if (!copy) {
    throw new AppError("copy not found", 404);
  }
  if (
    loan.borrower_id._id.toString() !== userId.toString() &&
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to update the due date of this loan",
      401
    );
  }
  const loanUpdated = await loansModel.update(loanId, {
    due_date: due_date,
  });
  res.status(200).json({
    data: loanUpdated,
    success: true,
    message: "due date updated successfully",
  });
});

const updateReturnDate = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { loanId } = req.params;
  const { return_date } = req.body;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  const loan = await loansModel.findLoanById(loanId);
  if (!loan) {
    throw new AppError("loan not found", 404);
  }
  const copy = await userCopiesModel.findById(loan.user_copy_id.id);
  if (!copy) {
    throw new AppError("copy not found", 404);
  }
  if (
    loan.borrower_id._id.toString() !== userId.toString() &&
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError(
      "You are not authorized to update the return date of this loan",
      401
    );
  }
  const loanUpdated = await loansModel.update(loanId, {
    return_date: return_date,
    status: "RETURNED",
  });
  res.status(200).json({
    data: loanUpdated,
    success: true,
    message: "return date updated successfully",
  });
});

const deleteLoan = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { loanId } = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  const loan = await loansModel.findLoanById(loanId);
  if (!loan) {
    throw new AppError("loan not found", 404);
  }
  const copy = await userCopiesModel.findById(loan.user_copy_id.id);
  if (!copy) {
    throw new AppError("copy not found", 404);
  }
  if (
    loan.borrower_id._id.toString() !== userId.toString() &&
    copy.owner_id._id.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("You are not authorized to delete this loan", 401);
  }
  await loansModel.remove(loanId);
  res.status(200).json({ success: true, message: "loan deleted successfully" });
});

const getLoans = catchAsync(async (req, res, next) => {
  const loans = await loansModel.findAll();
  res
    .status(200)
    .json({
      data: loans,
      success: true,
      message: "loans fetched successfully",
    });
});

const getLoanById = catchAsync(async (req, res, next) => {
  const { loanId } = req.params;
  const loan = await loansModel.findLoanById(loanId);
  if (!loan) {
    throw new AppError("loan not found", 404);
  }
  res
    .status(200)
    .json({ data: loan, success: true, message: "loan fetched successfully" });
});

const getLoansByBorrowerId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  const loans = await loansModel.findLoansByBorrowerId(userId);
  res.status(200).json({
    data: loans,
    success: true,
    message: "Loans fetched successfully",
  });
});

const getLoansByUserCopyId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    throw new AppError("userId are required", 400);
  }
  const loans = await loansModel.findLoansByUserId(userId);
  res
    .status(200)
    .json({
      data: loans,
      success: true,
      message: "Loans fetched successfully",
    });
});

const getActiveLoanForCopy = catchAsync(async (req, res, next) => {
  const { userCopyId } = req.params;
  if (!userCopyId) {
    throw new AppError("userCopyId are required", 400);
  }
  const loans = await loansModel.findActiveLoansByUserCopyId(userCopyId);
  res
    .status(200)
    .json({
      data: loans,
      success: true,
      message: "Loan fetched successfully",
    });
});



export default{
  addLoan,
  changeStatus,
  updateLoanStartDate,
  updateDueDate,
  updateReturnDate,
  deleteLoan,
  getLoans,
  getLoanById,
  getLoansByBorrowerId,
  getLoansByUserCopyId,
  getActiveLoanForCopy,
}