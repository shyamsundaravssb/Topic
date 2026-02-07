"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createDiscussion = async (
  articleId: string,
  content: string,
  parentId?: string,
) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in to comment." };
  }

  if (!content.trim()) {
    return { error: "Content cannot be empty." };
  }

  try {
    await prisma.discussion.create({
      data: {
        content,
        articleId,
        userId: session.user.id,
        parentId,
      },
    });

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });

    if (article) {
      revalidatePath(`/article/${article.slug}`);
    }

    return { success: "Comment posted!" };
  } catch (error) {
    console.error("Create Discussion Error:", error);
    return { error: "Failed to post comment." };
  }
};

export const deleteDiscussion = async (discussionId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { userId: true, article: { select: { slug: true } } },
    });

    if (!discussion) {
      return { error: "Comment not found" };
    }

    if (discussion.userId !== session.user.id) {
      return { error: "You can only delete your own comments." };
    }

    await prisma.discussion.delete({
      where: { id: discussionId },
    });

    revalidatePath(`/article/${discussion.article.slug}`);

    return { success: "Comment deleted" };
  } catch (error) {
    console.error("Delete Discussion Error:", error);
    return { error: "Failed to delete comment." };
  }
};
