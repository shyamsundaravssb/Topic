"use server";

import { prisma } from "@/lib/prisma";

export const searchTopics = async (query: string) => {
  if (!query || query.length < 2) return [];

  const topics = await prisma.topic.findMany({
    where: {
      title: {
        contains: query,
        mode: "insensitive", // Case insensitive search
      },
    },
    take: 5, // Limit results for performance
    select: {
      id: true,
      title: true,
      slug: true,
      _count: {
        select: { articles: true },
      },
    },
  });

  return topics;
};
