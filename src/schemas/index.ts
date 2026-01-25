import * as z from "zod";

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  dob: z.string().refine(
    (val) => {
      // Basic check to see if user is at least 13 years old (standard rule)
      const date = new Date(val);
      const ageDifMs = Date.now() - date.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age >= 13;
    },
    {
      message: "You must be at least 13 years old",
    },
  ),
});

export const CompleteProfileSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  dob: z.string().refine(
    (val) => {
      const date = new Date(val);
      const ageDifMs = Date.now() - date.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age >= 13;
    },
    {
      message: "You must be at least 13 years old",
    },
  ),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const TopicSchema = z.object({
  title: z.string().min(3, {
    message: "Topic title must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
});

export const ArticleSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }),
  content: z.string().min(50, {
    message: "Article content must be at least 50 characters",
  }),
});

export const ProfileSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  bio: z.string().optional(),
  image: z
    .string()
    .url({ message: "Invalid URL" })
    .optional()
    .or(z.literal("")),
});
