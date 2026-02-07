"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteArticle = async (articleId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true, topic: { select: { slug: true } } },
    });

    if (!article) {
      return { error: "Article not found" };
    }

    if (article.authorId !== session.user.id) {
      return { error: "You are not authorized to delete this article." };
    }

    await prisma.article.delete({
      where: { id: articleId },
    });

    // Revalidate the topic page
    revalidatePath(`/topic/${article.topic.slug}`);

    // Return the redirect URL so the client can navigate
    return {
      success: "Article deleted",
      redirectUrl: `/topic/${article.topic.slug}`,
    };
  } catch (error) {
    console.error("Delete Article Error:", error);
    return { error: "Failed to delete article." };
  }
};
