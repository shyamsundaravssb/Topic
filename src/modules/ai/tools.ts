// import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api"; // Note: might need @langchain/community
import { prisma } from "@/lib/prisma";

// 1. Tool to Check Database (Prevent duplicate topics)
export const checkTopicExists = async (topicTitle: string) => {
  const slug = topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const exists = await prisma.topic.findUnique({
    where: { slug },
  });
  return !!exists;
};

// 2. Tool to Publish Topic
export const createTopicTool = async (
  title: string,
  description: string,
  image: string,
) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const botUser = await prisma.user.findUnique({
    where: { username: "ai_curator" },
  });

  if (!botUser) throw new Error("Bot user not found");

  try {
    const topic = await prisma.topic.create({
      data: {
        title,
        slug,
        description,
        image,
        creatorId: botUser.id,
      },
    });
    return topic;
  } catch (e) {
    console.error("Failed to create topic:", e);
    return null;
  }
};

// 3. Tool to Publish Article
export const createArticleTool = async (
  title: string,
  content: string,
  topicSlug: string,
) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const botUser = await prisma.user.findUnique({
    where: { username: "ai_curator" },
  });
  const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });

  if (!botUser || !topic) throw new Error("Bot or Topic not found");

  try {
    const article = await prisma.article.create({
      data: {
        title,
        slug, // Note: You might need the unique slug logic here if titles collide
        content,
        authorId: botUser.id,
        topicId: topic.id,
      },
    });
    return article;
  } catch (e) {
    console.error("Failed to create article:", e);
    return null;
  }
};
