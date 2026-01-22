"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

// Wrapped in cache() to deduplicate requests if we use it in metadata later
export const getTopicBySlug = cache(async (slug: string) => {
  try {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        // 1. Get Creator details for the header
        creator: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        // 2. Get the latest articles for this topic
        articles: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        // 3. Get counts for stats
        _count: {
          select: { articles: true },
        },
      },
    });

    return topic;
  } catch (error) {
    return null;
  }
});
