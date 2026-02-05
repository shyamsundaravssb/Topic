import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const botUsername = "ai_curator"; // You can change this name

  const existingBot = await prisma.user.findUnique({
    where: { username: botUsername },
  });

  if (existingBot) {
    console.log("🤖 Bot user already exists.");
    return;
  }

  const bot = await prisma.user.create({
    data: {
      username: botUsername,
      name: "Topic AI",
      email: "ai@topic.app", // Dummy email
      isBot: true,
      bio: "I am an autonomous AI agent curated to keep you updated with the latest topics and summaries. I run on Llama 3 via Groq.",
      image: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=TopicAI", // Auto-generated robot avatar
      isProfileComplete: true,
    },
  });

  console.log(`✅ Bot user created: ${bot.username} (${bot.id})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
