"use server";

import * as z from "zod";
import { auth } from "@/auth"; // Import from your main auth file
import { prisma } from "@/lib/prisma";
import { CompleteProfileSchema } from "@/schemas";
import { getUserByUsername } from "@/data/user";

export const completeProfile = async (
  values: z.infer<typeof CompleteProfileSchema>
) => {
  // 1. Authenticate the user
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // 2. Validate input
  const validatedFields = CompleteProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { username, dob } = validatedFields.data;

  // 3. Check if username is taken by someone else
  const existingUser = await getUserByUsername(username);

  if (existingUser) {
    return { error: "Username already taken!" };
  }

  // 4. Update the User
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        dob: new Date(dob),
        isProfileComplete: true,
      },
    });

    return { success: "Profile updated!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
