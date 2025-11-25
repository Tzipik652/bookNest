import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { registerSchema } from "../validations/userValidation.js";
import { getUsers, updateUser ,deleteUser as deleteUserRecord} from "../models/userModel.js";

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
    // { expiresIn: "24h" }
    { expiresIn: "5s" }
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

  if (existing) throw new AppError("User already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, err } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, name, auth_provider: "local" }])
    .select()
    .single();

  if (err) throw error;

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

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
  const profile = await response.json();

  if (!profile.email) throw new AppError("Invalid Google token", 401);

  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", profile.email)
    .single();

  if (!user) {
    // Create new user
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
        },
      ])
      .select()
      .single();
    if (insertError) throw insertError;
    user = newUser;
  } else if (!user.auth_provider.includes("google")) {
    // Update existing user to support both
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ auth_provider: "both", profile_picture: profile.picture })
      .eq("_id", user._id)
      .select()
      .single();
    if (updateError) throw updateError;
    user = updatedUser;
  }

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
  const user=req.user;
  if( !user ||user.role!=="admin" ){
    throw new AppError("Forbidden",403);
  }
 const users= await getUsers();
 res.json({
  success:true,
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
