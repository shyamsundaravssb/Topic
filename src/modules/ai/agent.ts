import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { tavily } from "@tavily/core";
import {
  checkTopicExists,
  createTopicTool,
  createArticleTool,
  getEmptyTopics,
  getRecentActivity,
  createDiscussionComment,
  findSimilarTopic, // Use this for pre-check
} from "./tools";

// Initialize LLM
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// 1. Define State
const GraphState = Annotation.Root({
  mission: Annotation<
    "create_new_topic" | "write_article" | "contribute_discussion"
  >(),

  // Topic Context
  topicIdea: Annotation<string>(),
  topicSlug: Annotation<string>(),
  topicDescription: Annotation<string>(),

  // Article Context
  articleTitle: Annotation<string>(),
  articleContent: Annotation<string>(),

  // Discussion Context
  targetArticleId: Annotation<string>(),
  discussionContent: Annotation<string>(),

  // Shared
  researchNotes: Annotation<string>(),
  reasoning: Annotation<string>(), // Why the agent chose this mission
});

// --- NODE 1: THE ANALYST (Brain) ---
async function analystNode(state: typeof GraphState.State) {
  console.log("🕵️ Analyst: Analyzing platform state...");

  // 1. Get snapshot of platform
  const { topics, articles } = await getRecentActivity();
  const emptyTopics = await getEmptyTopics(3);

  // 2. LLM Decision Making
  // We feed the state to the LLM and ask for a mission
  const prompt = `
    You are the "AI Curator" of a tech community platform.
    Your goal is to keep the platform active, diverse, and high-quality.
    
    Current State:
    - Recent Topics: ${topics.map((t) => `${t.title} (${t._count.articles} articles)`).join(", ")}
    - Recent Articles: ${articles.map((a) => `"${a.title}" in ${a.topic.title}`).join(", ")}
    - Empty Topics (Priority): ${emptyTopics.map((t) => t.title).join(", ")}

    Decide your next move based on these rules:
    1. PRIORITIZE writing articles for Empty Topics.
    2. If no empty topics, check if any recent topic needs an "Expert Contribution" (a complementary article).
    3. If there are recent articles, you can choose to COMMENT on one to spark discussion.
    4. If the platform feels "stale" (same topics repeatedly), CREATE a new, unique, cutting-edge topic.
    5. CRITICAL: Do NOT create a topic if it semantically overlaps with existing ones (e.g. "Edge Computing" vs "Cloud Computing").

    Return a JSON object:
    {
      "mission": "create_new_topic" | "write_article" | "contribute_discussion",
      "reasoning": "Why you chose this",
      "targetTopic": "Title of topic to write for (if writing article)",
      "targetArticleId": "ID of article to comment on (if discussing)",
      "newTopicIdea": "Title of new topic (if creating)"
    }
  `;

  const response = await model.invoke([
    new SystemMessage(
      "You are a strategic AI Analyst. Output valid JSON only.",
    ),
    new HumanMessage(prompt),
  ]);

  try {
    const decision = JSON.parse(
      response.content
        .toString()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim(),
    );
    console.log(
      `💡 Analyst Decision: ${decision.mission} (${decision.reasoning})`,
    );

    // Hydrate state based on decision
    if (decision.mission === "create_new_topic") {
      // Check for semantic duplicates first
      const similar = await findSimilarTopic(decision.newTopicIdea);
      if (similar) {
        console.log(
          `⚠️ Analyst proposed duplicate: '${decision.newTopicIdea}' matches '${similar.title}'. Switching to write article for existing topic.`,
        );
        return {
          mission: "write_article",
          topicIdea: similar.title,
          topicSlug: similar.slug,
          reasoning:
            "Switched from creating duplicate topic to writing for existing one.",
        };
      }
      return {
        mission: "create_new_topic",
        topicIdea: decision.newTopicIdea,
        reasoning: decision.reasoning,
      };
    }

    if (decision.mission === "write_article") {
      // Find the slug for the target topic
      let slug = "";
      // Try to find in empty topics first
      const emptyTarget = emptyTopics.find(
        (t) => t.title === decision.targetTopic,
      );
      if (emptyTarget) slug = emptyTarget.slug;
      else {
        // Or recent topics
        const recentTarget = topics.find(
          (t) => t.title === decision.targetTopic,
        );
        if (recentTarget) slug = recentTarget.slug;
        // Fallback: If AI hallucinated a topic name, pick the first empty or recent one
        else slug = emptyTopics[0]?.slug || topics[0]?.slug;
      }

      return {
        mission: "write_article",
        topicIdea: decision.targetTopic || "Tech Trends",
        topicSlug: slug,
        reasoning: decision.reasoning,
      };
    }

    if (decision.mission === "contribute_discussion") {
      // Find the article object for context
      const targetArticle =
        articles.find((a) => a.id === decision.targetArticleId) || articles[0]; // Fallback
      return {
        mission: "contribute_discussion",
        targetArticleId: targetArticle.id,
        topicIdea: targetArticle.topic.title, // Context for researcher
        articleTitle: targetArticle.title, // Context for writer
        reasoning: decision.reasoning,
      };
    }

    return {
      mission: "write_article",
      topicIdea: "General Tech",
      topicSlug: "general-tech",
    }; // Fallback
  } catch (e) {
    console.error("Analyst JSON Parse Error:", e);
    // Fallback safely
    const fallback = emptyTopics[0];
    if (fallback)
      return {
        mission: "write_article",
        topicIdea: fallback.title,
        topicSlug: fallback.slug,
      };
    return { mission: "create_new_topic", topicIdea: "Emerging Tech" }; // Last resort
  }
}

// --- NODE 2: PLANNER (The Architect) ---
async function plannerNode(state: typeof GraphState.State) {
  if (state.mission === "contribute_discussion") {
    // No planning needed for simple comment, Writer handles it
    return {};
  }

  console.log(`🤖 Planner: Planning for ${state.mission}...`);

  // If creating new topic, refine the title/description
  if (state.mission === "create_new_topic") {
    // We already have a rough idea from Analyst, let's polish it
    // Logic remains similar to before but simpler
    return { topicIdea: state.topicIdea };
  }

  // If writing article, we might want an outline, but for now we skip to researcher
  return {};
}

// --- NODE 3: RESEARCHER ---
async function researcherNode(state: typeof GraphState.State) {
  // Comments usually don't need deep research, maybe just a quick check or none.
  // But for "Expert Contribution" articles, we definitely need it.

  const query =
    state.mission === "contribute_discussion"
      ? `Opinions on ${state.articleTitle}`
      : state.topicIdea;

  console.log(`🔎 Researching: ${query}`);
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

  try {
    const searchResult = await tvly.search(query || "Tech News", {
      searchDepth: "basic",
      maxResults: 3,
    });

    const notes = searchResult.results.map((r) => r.content).join("\n\n");
    return { researchNotes: notes };
  } catch (e) {
    console.log("Research failed, proceeding with internal knowledge");
    return { researchNotes: "No external research available." };
  }
}

// --- NODE 4: WRITER ---
async function writerNode(state: typeof GraphState.State) {
  console.log(`✍️ Writer: Executing mission '${state.mission}'...`);

  // MODE A: Write Discussion Comment
  if (state.mission === "contribute_discussion") {
    const response = await model.invoke([
      new SystemMessage(
        "You are an insightful tech community member. Write a short, engaging comment. Be constructive, maybe ask a follow-up question. Do NOT be generic. Persona: The Curious Expert.",
      ),
      new HumanMessage(
        `Context: Article "${state.articleTitle}" about ${state.topicIdea}.\nResearch: ${state.researchNotes}`,
      ),
    ]);
    return { discussionContent: response.content.toString() };
  }

  // MODE B & C: Write Article (New Topic or Existing)
  const articleResponse = await model.invoke([
    new SystemMessage(
      "You are an insightful tech journalist. Write a comprehensive blog post in Markdown. Style: Storytelling, engaging, and flowy. Avoid robotic lists. Use analogies. Do NOT include a title at the top.",
    ),
    new HumanMessage(
      `Topic: ${state.topicIdea}\n\nNotes:\n${state.researchNotes}`,
    ),
  ]);

  const titleResponse = await model.invoke([
    new SystemMessage(
      "Generate a single, punchy, engaging headline for this article. Constraint: UNDER 8 WORDS. Style: Intriguing but not clickbait. Return ONLY the headline.",
    ),
    new HumanMessage(
      `Topic: ${state.topicIdea}\n\nContent Snippet:\n${articleResponse.content.toString().slice(0, 500)}`,
    ),
  ]);

  let desc = state.topicDescription;
  if (state.mission === "create_new_topic") {
    const descResponse = await model.invoke([
      new SystemMessage("Write a 2-sentence description for this topic."),
      new HumanMessage(`Topic: ${state.topicIdea}`),
    ]);
    desc = descResponse.content.toString();
  }

  return {
    articleContent: articleResponse.content.toString(),
    articleTitle: titleResponse.content.toString().replace(/"/g, "").trim(),
    topicDescription: desc,
  };
}

// --- NODE 5: PUBLISHER ---
async function publisherNode(state: typeof GraphState.State) {
  console.log("🚀 Publisher: Publishing content...");

  if (
    state.mission === "contribute_discussion" &&
    state.targetArticleId &&
    state.discussionContent
  ) {
    await createDiscussionComment(
      state.targetArticleId,
      state.discussionContent,
    );
    console.log(`✅ Commented on article ${state.targetArticleId}`);
    return {};
  }

  let currentSlug = state.topicSlug;

  // Sync Create Topic
  if (state.mission === "create_new_topic") {
    const newTopic = await createTopicTool(
      state.topicIdea!,
      state.topicDescription!,
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1000&q=80",
    );
    if (!newTopic) return {}; // Failed
    currentSlug = newTopic.slug;
  }

  // Sync Publish Article
  if (currentSlug && state.articleContent) {
    await createArticleTool(
      state.articleTitle || `Overview: ${state.topicIdea}`,
      state.articleContent,
      currentSlug,
    );
    console.log(`✅ Published: "${state.articleTitle}" to ${currentSlug}`);
  }

  return {};
}

// --- BUILD THE GRAPH ---
export const runAgent = async () => {
  const workflow = new StateGraph(GraphState)
    .addNode("analyst", analystNode)
    .addNode("planner", plannerNode)
    .addNode("researcher", researcherNode)
    .addNode("writer", writerNode)
    .addNode("publisher", publisherNode)

    .addEdge(START, "analyst")
    .addEdge("analyst", "planner")
    .addEdge("planner", "researcher") // Linear flow simplifies logic, let nodes handle no-ops
    .addEdge("researcher", "writer")
    .addEdge("writer", "publisher")
    .addEdge("publisher", END);

  const app = workflow.compile();
  const result = await app.invoke({
    mission: "create_new_topic", // Default start, Analyst will override
    topicIdea: "Init",
    topicSlug: "",
    topicDescription: "",
    articleTitle: "",
    articleContent: "",
    targetArticleId: "",
    discussionContent: "",
    researchNotes: "",
    reasoning: "",
  });
  return result;
};
