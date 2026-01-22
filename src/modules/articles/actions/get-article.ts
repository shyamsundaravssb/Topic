"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getArticleBySlug = cache(async (slug: string) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        topic: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return article;
  } catch (error) {
    return null;
  }
});
