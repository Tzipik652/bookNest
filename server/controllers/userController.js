import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { registerSchema } from "../validations/userValidation.js";
import { getUsers, updateUser, deleteUser as deleteUserRecord, findPaginatedUsers, searchUsersByNameOrEmail } from "../models/userModel.js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Helper: Generate JWT
const generateJWT = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
      auth_provider: user.auth_provider,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// -------------------------
// Register (Email/Password)
// -------------------------
export const register = catchAsync(async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message);
    throw new AppError(messages.join(", "), 400);
  }
  const { email, password, name } = value;
  if (!email || !password || !name) throw new AppError("All fields are required", 400);

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) {
    //  בדיקה חדשה: אם המשתמש מחוק - נחייה אותו!
    if (existing.is_deleted) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const { data: reactivatedUser, error: reactivateError } = await supabase
        .from("users")
        .update({
          is_deleted: false,
          password: hashedPassword, // עדכון סיסמה אם נשלחה
          name: name // עדכון שם
        })
        .eq("_id", existing._id)
        .select()
        .single();

      if (reactivateError) throw reactivateError;

      const token = generateJWT(reactivatedUser);
      return res.json({
        success: true,
        message: "User reactivated successfully", // הודעה חדשה
        token,
        user: reactivatedUser,
      });
    } else {
      // המשתמש קיים ופעיל
      throw new AppError("User already exists", 400);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, error: insertError } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, name, auth_provider: "local" }])
    .select()
    .single();

  if (insertError) throw insertError;

  const token = generateJWT(user);
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      auth_provider: user.auth_provider,
    },
  });
});

// -------------------------
// Login (Email/Password)
// -------------------------
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password required", 400);

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) throw new AppError("Invalid credentials", 401);

  if (user.is_deleted) throw new AppError("Account is inactive. Please contact support or try registering.", 401);
  if (user.auth_provider !== "local") throw new AppError("Please login with Google", 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError("Invalid credentials", 401);

  const token = generateJWT(user);
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      auth_provider: user.auth_provider,
      role: user.role,
    },
  });
});

// -------------------------
// Google OAuth
// -------------------------
export const googleLogin = catchAsync(async (req, res, next) => {
  const { id_token } = req.body;
  if (!id_token) throw new AppError("Google ID token required", 400);

  // 1. אימות הטוקן מול גוגל
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
  const profile = await response.json();

  if (!profile.email) throw new AppError("Invalid Google token", 401);

  // 2. חיפוש המשתמש במסד הנתונים
  // שימי לב: אנחנו לא מסננים כאן is_deleted=false כי אנחנו רוצים למצוא גם מחוקים
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", profile.email)
    .single();

  if (!user) {
    // -------------------------
    // תרחיש א': משתמש חדש לגמרי
    // -------------------------
    const password = crypto.randomBytes(Math.ceil(12 / 2)).toString("hex").slice(0, 12);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          email: profile.email,
          name: profile.name,
          password,
          auth_provider: "google",
          profile_picture: profile.picture,
          role: "user",
          is_deleted: false // מוודאים שנוצר פעיל
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;
    user = newUser;

  } else {
    // -------------------------
    // תרחיש ב': משתמש קיים (פעיל או מחוק)
    // -------------------------
    let updates = {};
    let shouldUpdate = false;

    // 1. בדיקת החייאה (מחיקה רכה)
    if (user.is_deleted) {
      updates.is_deleted = false;
      shouldUpdate = true;
    }

    // 2. בדיקת ספק אימות (אם היה רק local, נשדרג ל-both)
    if (user.auth_provider !== "google" && user.auth_provider !== "both") {
      updates.auth_provider = "both";
      shouldUpdate = true;
    }

    // 3. עדכון תמונת פרופיל (אופציונלי - מעדכן אם השתנתה בגוגל)
    if (profile.picture && user.profile_picture !== profile.picture) {
      updates.profile_picture = profile.picture;
      shouldUpdate = true;
    }

    // ביצוע העדכון בפועל אם יש שינויים
    if (shouldUpdate) {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("_id", user._id)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser; // מעדכנים את המשתמש המקומי לגרסה החדשה
    }
  }

  // 3. יצירת טוקן והחזרת תשובה
  const token = generateJWT(user);
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      auth_provider: user.auth_provider,
      profile_picture: user.profile_picture,
      role: user.role,
    },
  });
});
export const getAllUsers = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    throw new AppError("Forbidden", 403);
  }
  const users = await getUsers();
  res.json({
    success: true,
    users
  });
})
export const update = catchAsync(async (req, res, next) => {
  const user = req.user;
  const targetUserId = req.params.id;
  const isAllowed = user.role === "admin" || user._id === targetUserId;
  if (!isAllowed) {
    throw new AppError("Forbidden: You can only modify your own account or be an Admin.", 403);
  }
  const updatedUser = await updateUser(targetUserId, req.body);

  res.json({
    success: true,
    updatedUser
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = req.user;
  const targetUserId = req.params.id;
  const isAllowed = user.role === "admin" || user._id === targetUserId;
  if (!isAllowed) {
    throw new AppError("Forbidden: You can only modify your own account or be an Admin.", 403);
  }

  const deletedUser = await deleteUserRecord(targetUserId);

  res.json({
    success: true,
    deletedUser
  });
});

export const getPaginatedUsers = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    throw new AppError("Forbidden", 403);
  }
   const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  const { users, totalCount } = await findPaginatedUsers(page, limit);

  const totalPages = Math.ceil(totalCount / limit);
  res.json({
    users: users,
    currentPage: page,
    limit: limit,
    totalItems: totalCount,
    totalPages: totalPages,
  });
});
export const searchUsers = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    throw new AppError("Forbidden", 403);
  }
  const searchTerm = req.query.s || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

  const { users, totalCount } = await searchUsersByNameOrEmail(searchTerm, page, limit);  
  const totalPages = Math.ceil(totalCount / limit);
  res.json({
    users: users,
    currentPage: page,
    limit: limit,
    totalItems: totalCount,
    totalPages: totalPages,
  });
});