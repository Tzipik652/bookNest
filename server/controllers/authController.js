import * as authService from "../services/authservice.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json({ message: "If the email exists, a reset link was sent." });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  res.json({ message: "Password updated successfully." });
};
