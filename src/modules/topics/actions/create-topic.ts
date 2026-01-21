"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TopicSchema } from "@/schemas"; // We will create this next

// Utility to create URL-friendly slugs
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

export const createTopic = async (values: z.infer<typeof TopicSchema>) => {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validatedFields = TopicSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { title, description } = validatedFields.data;
  const slug = slugify(title);

  // 1. Check uniqueness
  const existingTopic = await prisma.topic.findUnique({
    where: { slug },
  });

  if (existingTopic) {
    return { error: "Topic already exists!" };
  }

  // 2. Create Topic
  try {
    const topic = await prisma.topic.create({
      data: {
        title,
        slug,
        description,
        creatorId: session.user.id!,
      },
    });

    return { success: "Topic created!", slug: topic.slug };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
