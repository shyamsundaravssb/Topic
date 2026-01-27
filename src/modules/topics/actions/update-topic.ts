"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TopicEditSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

export const updateTopic = async (
  values: z.infer<typeof TopicEditSchema>,
  topicId: string,
) => {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validatedFields = TopicEditSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { description, image } = validatedFields.data;

  // 1. Check ownership
  const existingTopic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!existingTopic) {
    return { error: "Topic not found" };
  }

  if (existingTopic.creatorId !== session.user.id) {
    return { error: "You are not allowed to edit this topic." };
  }

  // 2. Update Topic
  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        description,
        image,
      },
    });

    // Refresh the topic page
    revalidatePath(`/topic/${existingTopic.slug}`);

    return { success: "Topic updated successfully!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
