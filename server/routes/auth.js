// routes/auth.js
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

dotenv.config();

const router = express.Router();

// Initialize Supabase client
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
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        { email, password: hashedPassword, name, auth_provider: "local" },
      ])
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// -------------------------
// Login (Email/Password)
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (user.auth_provider !== "local")
      return res.status(401).json({ error: "Please login with Google" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// -------------------------
// Google OAuth
// -------------------------
router.post("/google", async (req, res) => {
  try {
    const { id_token } = req.body; // Google ID token from frontend

    if (!id_token)
      return res.status(400).json({ error: "Google ID token required" });

    // Verify token with Google API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
    );
    const profile = await response.json();

    if (!profile.email)
      return res.status(401).json({ error: "Invalid Google token" });

    // Check if user exists
    let { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", profile.email)
      .single();

    if (!user) {
      const randomPassword = randomBytes(16).toString("hex");

      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email: profile.email,
            name: profile.name,
            auth_provider: "google",
            profile_picture: profile.picture,
            password: randomPassword,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    } else if (!user.auth_provider.includes("google")) {
      // Update existing user to allow Google login
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google login failed" });
  }
});

export default router;
