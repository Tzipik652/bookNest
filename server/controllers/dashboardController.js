import { catchAsync } from "../utils/catchAsync.js";
import {getStats} from '../models/dashboardModel.js'
 
export const getDashboardStats = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin') {
     throw new AppError("Unauthorized", 403);
  }

  const stats = await getStats(); 

  res.status(200).json(stats);
});

