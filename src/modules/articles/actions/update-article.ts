"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArticleSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

// Slugify helper
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const updateArticle = async (
  values: z.infer<typeof ArticleSchema>,
  articleId: string,
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

  // 1. Check ownership
  const existingArticle = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!existingArticle) {
    return { error: "Article not found" };
  }

  if (existingArticle.authorId !== session.user.id) {
    return { error: "You are not allowed to edit this article." };
  }

  // 2. Calculate new slug (if title changed)
  let newSlug = existingArticle.slug;
  if (title !== existingArticle.title) {
    newSlug = slugify(title);

    // Check if new slug is taken by ANOTHER article
    const slugTaken = await prisma.article.findFirst({
      where: {
        slug: newSlug,
        NOT: { id: articleId }, // Ignore self
      },
    });

    if (slugTaken) {
      return {
        error:
          "An article with this title already exists. Please choose another.",
      };
    }
  }

  // 3. Update Article
  try {
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        content,
        slug: newSlug,
      },
    });

    // Revalidate the old path AND the new path (just in case)
    revalidatePath(`/article/${existingArticle.slug}`);

    return { success: "Article updated!", slug: updatedArticle.slug };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
