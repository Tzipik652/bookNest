// // controllers/authController.js
// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import fetch from "node-fetch";
// import { createClient } from "@supabase/supabase-js";
// import crypto from 'crypto';
// dotenv.config();

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_KEY
// );
// const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// // Helper: Generate JWT
// const generateJWT = (user) => {
//   return jwt.sign(
//     {
//       _id: user._id,
//       email: user.email,
//       name: user.name,
//       auth_provider: user.auth_provider,
//     },
//     JWT_SECRET,
//     { expiresIn: "24h" }
//   );
// };

// // -------------------------
// // Register (Email/Password)
// // -------------------------
// export const register = async (req, res) => {
//   try {
//     const { email, password, name } = req.body;
//     if (!email || !password || !name)
//       return res.status(400).json({ error: "All fields are required" });

//     const { data: existing } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (existing) return res.status(400).json({ error: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const { data: user, error } = await supabase
//       .from("users")
//       .insert([
//         { email, password: hashedPassword, name, auth_provider: "local" },
//       ])
//       .select()
//       .single();

//     if (error) throw error;

//     const token = generateJWT(user);
//     res.json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         name: user.name,
//         auth_provider: user.auth_provider,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Registration failed" });
//   }
// };

// // -------------------------
// // Login (Email/Password)
// // -------------------------
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password required" });

//     const { data: user } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (!user) return res.status(401).json({ error: "Invalid credentials" });
//     if (user.auth_provider !== "local")
//       return res.status(401).json({ error: "Please login with Google" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ error: "Invalid credentials" });

//     const token = generateJWT(user);
//     res.json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         name: user.name,
//         auth_provider: user.auth_provider,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Login failed" });
//   }
// };

// // -------------------------
// // Google OAuth
// // -------------------------
// export const googleLogin = async (req, res) => {
//   try {
//     const { id_token } = req.body;
//     if (!id_token)
//       return res.status(400).json({ error: "Google ID token required" });

//     const response = await fetch(
//       `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
//     );
//     const profile = await response.json();

//     if (!profile.email)
//       return res.status(401).json({ error: "Invalid Google token" });

//     let { data: user } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", profile.email)
//       .single();

//     if (!user) {
//       const password =crypto.randomBytes(Math.ceil(12 / 2)).toString("hex").slice(0, 12);
//       const { data: newUser, error: insertError } = await supabase
//         .from("users")
//         .insert([
//           {
//             email: profile.email,
//             name: profile.name,
//             password: password,
//             auth_provider: "google",
//             profile_picture: profile.picture,
//           },
//         ])
//         .select()
//         .single();
//       if (insertError) throw insertError;
//       user = newUser;
//     } else if (!user.auth_provider.includes("google")) {
//       const { data: updatedUser, error: updateError } = await supabase
//         .from("users")
//         .update({ auth_provider: "both", profile_picture: profile.picture })
//         .eq("_id", user._id)
//         .select()
//         .single();
//       if (updateError) throw updateError;
//       user = updatedUser;
//     }

//     const token = generateJWT(user);
//     res.json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         name: user.name,
//         auth_provider: user.auth_provider,
//         profile_picture: user.profile_picture,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Google login failed" });
//   }
// };
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

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
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// -------------------------
// Register (Email/Password)
// -------------------------
export const register = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) throw new AppError("All fields are required", 400);

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) throw new AppError("User already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, name, auth_provider: "local" }])
    .select()
    .single();

  if (error) throw error;

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
    },
  });
});
