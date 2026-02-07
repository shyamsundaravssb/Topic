"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { $Enums } from "@prisma/client";

type VoteType = "UP" | "DOWN";

export const toggleVote = async (articleId: string, type: VoteType) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in to vote." };
  }

  const userId = session.user.id;

  try {
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if clicking same type
        await prisma.vote.delete({
          where: {
            userId_articleId: {
              userId,
              articleId,
            },
          },
        });
      } else {
        // Change vote type
        await prisma.vote.update({
          where: {
            userId_articleId: {
              userId,
              articleId,
            },
          },
          data: { type },
        });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId,
          articleId,
          type,
        },
      });
    }

    // specific path revalidation isn't enough for optimistic updates sometimes,
    // but we'll try to rely on path revalidation for now.
    // For a truly scalable system, we might want to return the new counts.
    revalidatePath(`/article/[slug]`, "page");

    // We need to revalidate the specific article page.
    // Since we don't have the slug here easily without a lookup,
    // we can optimize by passing slug or just finding it.
    // Ideally the client should pass the slug or we just fetch it.
    // For now, let's fetch the article to get the slug for precise revalidation?
    // OR just return the new state and let client update?
    // Let's rely on Next.js cache tags if possible, or simple revalidation.

    // Let's do a quick lookup to get slug for revalidation
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { slug: true },
    });

    if (article) {
      revalidatePath(`/article/${article.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Vote Error:", error);
    return { error: "Failed to vote." };
  }
};
