"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

// 1. Fetch Profile Data (Public)
export const getProfileByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            createdTopics: true,
            articles: true,
          },
        },
        createdTopics: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            _count: { select: { articles: true } },
          },
        },
        articles: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            topic: {
              select: { title: true, slug: true },
            },
          },
        },
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

// 2. Update Profile (Protected)
export const updateProfile = async (values: z.infer<typeof ProfileSchema>) => {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validatedFields = ProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, bio, image } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        image,
      },
    });

    // Refresh the profile page to show changes
    revalidatePath(`/user/${session.user.username}`);

    return { success: "Profile updated successfully!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
