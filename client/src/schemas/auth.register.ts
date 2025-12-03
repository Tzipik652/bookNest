import { z } from "zod";
import { TFunction } from "i18next";

// --- Forgot Password Schema ---
export const createForgotPasswordSchema = (t: TFunction) => {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("validation:emailRequired") })
      .email({ message: t("validation:invalidEmail") }),
  });
};

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

// --- Reset Password Schema ---
export const createResetPasswordSchema = (t: TFunction) => {
  return z
    .object({
      password: z
        .string()
        .min(6, { message: t("validation:minPasswordLength") }),
      confirmPassword: z
        .string()
        .min(1, { message: t("validation:confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation:passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
};

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;