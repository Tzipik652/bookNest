import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import loanMessagesModel from "../models/loanMessagesModel.js";

const sendChatMessage = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { loanId } = req.params;
  const { message,type } = req.body;
 
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  if (!message) {
    throw new AppError("message are required", 400);
  }
    const loanMessagesData = {
    loanId,
    senderId: userId,
    messageText: message,
    type:type??undefined
  };

  const loanMessages = await loanMessagesModel.add(loanMessagesData);
  res
    .status(201)
    .json({ data: loanMessages, success: true, message: "messages send successfully" });
});

const getChatMessages = catchAsync(async (req, res, next) => {
  const {loanId} = req.params;
  if (!loanId) {
    throw new AppError("loanId are required", 400);
  }
  const chatMessages = await loanMessagesModel.findLoanMessagesByLoanId(loanId);
  res
    .status(200)
    .json({
      data: chatMessages,
      success: true,
      message: "Chat messages fetched successfully",
    });
});

export default{
  sendChatMessage,
  getChatMessages,
}