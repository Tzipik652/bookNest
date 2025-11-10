export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // נבדיל בין שגיאות צפויות לשגיאות מערכת
  }
}
