"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail, getUserByUsername } from "@/data/user"; // Import new helper
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, username, dob } = validatedFields.data; // Extract new fields

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Check Email Uniqueness
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "Email already in use!" };
  }

  // 2. Check Username Uniqueness
  const existingUsername = await getUserByUsername(username);
  if (existingUsername) {
    return { error: "Username already taken!" };
  }

  // 3. Create User (Convert DOB string to Date object)
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      username,
      dob: new Date(dob),
      isProfileComplete: true,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
};
