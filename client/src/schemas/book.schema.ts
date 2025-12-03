// import { z } from "zod";

// export const bookSchema = z.object({
//     title: z.string().min(2, "Title must be at least 2 characters"),
//     author: z.string().min(2, "Author must be at least 2 characters"),
//     description: z.string().min(10, "Description must be at least 10 characters"),
//     category: z.string().min(1, "Category is required"),

//     img_url: z.string()
//         .refine(
//             (val) => val === "" || z.string().url().safeParse(val).success,
//             "Invalid image URL. Must be a valid URL or empty."
//         ),
//         // .nullish(),

//     price: z
//         .string()
//         .optional()
//         .refine((val) => !val || !isNaN(Number(val)), {
//             message: "Price must be a valid number"
//         }),
// });

// // Type for the form:
// export type BookFormValues = z.infer<typeof bookSchema>;
import { z } from "zod";
import { TFunction } from "i18next";

// שימו לב: הסכימה מיוצאת כעת כפונקציה
export const createBookSchema = (t: TFunction) => {
    return z.object({
        title: z
            .string()
            .min(2, { message: t("validation:minTitleLength") }),

        author: z
            .string()
            .min(2, { message: t("validation:minAuthorLength") }),

        description: z
            .string()
            .min(10, { message: t("validation:minDescriptionLength") }),

        category: z
            .string()
            .min(1, { message: t("validation:categoryRequired") }),

        img_url: z
            .string()
            .refine(
                (val) => val === "" || z.string().url().safeParse(val).success,
                { message: t("validation:invalidImageUrl") }
            ),

        price: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Number(val)), {
                message: t("validation:invalidPrice")
            }),
    });
};

// Type for the form: אנחנו משתמשים ב-ReturnType כדי לקבל את ה-Type של הסכימה שנוצרה
export type BookFormValues = z.infer<ReturnType<typeof createBookSchema>>;