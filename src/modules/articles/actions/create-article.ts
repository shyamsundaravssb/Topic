"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArticleSchema } from "@/schemas";

// Slugify helper (consistent with Topic creation)
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const createArticle = async (
  values: z.infer<typeof ArticleSchema>,
  topicSlug: string,
) => {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validatedFields = ArticleSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { title, content } = validatedFields.data;
  const slug = slugify(title);

  // 1. Get the Topic ID from the slug
  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    select: { id: true },
  });

  if (!topic) {
    return { error: "Topic not found!" };
  }

  // 2. Check for duplicate Article slug
  const existingArticle = await prisma.article.findUnique({
    where: { slug },
  });

  if (existingArticle) {
    // Append a random string to make it unique if title collision happens
    // For now, simple error is fine
    return { error: "An article with this title already exists!" };
  }

  // 3. Create Article
  try {
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        topicId: topic.id,
        authorId: session.user.id!,
      },
    });

    return { success: "Article published!", slug: article.slug };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
