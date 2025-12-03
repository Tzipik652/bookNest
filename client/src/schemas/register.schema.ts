import { z } from "zod";
import { TFunction } from "i18next";

export const createRegisterSchema = (t: TFunction) => {
  return z
    .object({
      name: z
        .string()
        .min(2, { message: t("validation:minNameLength") }),
      
      email: z
        .string()
        .email({ message: t("validation:invalidEmail") }),
      
      password: z
        .string()
        .min(6, { message: t("validation:minPasswordLength") })
        .regex(/[A-Z]/, { message: t("validation:passwordUppercase") })
        .regex(/[0-9]/, { message: t("validation:passwordNumber") })
        .regex(/[^A-Za-z0-9]/, { message: t("validation:passwordSpecialChar") }),
      
      confirmPassword: z
        .string()
        .min(6, { message: t("validation:confirmPasswordRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation:passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
};

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;