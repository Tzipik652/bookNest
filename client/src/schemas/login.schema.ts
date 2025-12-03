import { z } from "zod";
import { TFunction } from "i18next";

export const createLoginSchema = (t: TFunction) => {
  return z.object({
    email: z
      .string()
      .min(1, { message: t("validation:emailRequired") })
      .email({ message: t("validation:invalidEmail") }),
    password: z
      .string()
      .min(6, { message: t("validation:minPasswordLength") }),
  });
};

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;