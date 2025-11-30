import crypto from "crypto";
import bcrypt from "bcryptjs";
import supabase from "../config/supabaseClient.js";
import { sendEmail } from "../utils/sendEmail.js";

export const forgotPassword = async (email) => {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await supabase.from("password_resets").insert({
    user_id: user._id,
    token,
    expires_at: expires,
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await sendEmail(
    email,
    "Reset Your Password",
    `<p>Click to reset your password:</p>
     <a href="${resetUrl}">${resetUrl}</a>`
  );
};

export const resetPassword = async (token, password) => {
  const { data: resetRecord } = await supabase
    .from("password_resets")
    .select("*")
    .eq("token", token)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (!resetRecord) throw new Error("Token invalid or expired");

  const hashed = await bcrypt.hash(password, 12);

  await supabase
    .from("users")
    .update({ password: hashed })
    .eq("_id", resetRecord.user_id);

  await supabase.from("password_resets").delete().eq("id", resetRecord.id);
};
