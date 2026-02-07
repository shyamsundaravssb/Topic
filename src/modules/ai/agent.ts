import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { tavily } from "@tavily/core";
import {
  checkTopicExists,
  createTopicTool,
  createArticleTool,
  getEmptyTopics,
} from "./tools";

// Initialize LLM
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// 1. Define State (Added articleTitle)
const GraphState = Annotation.Root({
  mission: Annotation<"fill_empty_topic" | "create_new_trend">(),
  topicIdea: Annotation<string>(),
  topicSlug: Annotation<string>(),
  topicDescription: Annotation<string>(),
  researchNotes: Annotation<string>(),
  articleTitle: Annotation<string>(), // ✅ New: Store the generated title
  articleContent: Annotation<string>(),
  status: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "idle",
    default: () => "idle",
  }),
});

// --- NODE 1: THE ANALYST ---
async function analystNode(state: typeof GraphState.State) {
  console.log("🕵️ Analyst: Checking database state...");

  const emptyTopics = await getEmptyTopics(3);

  if (emptyTopics.length > 0) {
    const target = emptyTopics[0];
    console.log(
      `🎯 Analyst: Found empty topic '${target.title}'. Skipping Planner.`,
    );
    return {
      mission: "fill_empty_topic",
      topicIdea: target.title,
      topicSlug: target.slug,
    };
  }

  console.log("💡 Analyst: No empty topics. Needs new trend.");
  return { mission: "create_new_trend" };
}

// --- NODE 2: PLANNER ---
async function plannerNode(state: typeof GraphState.State) {
  console.log("🤖 Planner: Generating new topic idea...");

  const response = await model.invoke([
    new SystemMessage(
      "Generate ONE trending technology topic title. Return ONLY the title.",
    ),
    new HumanMessage("Give me a unique tech topic."),
  ]);

  const topic = response.content.toString().trim().replace(/"/g, "");

  // Simple duplicate check
  const exists = await checkTopicExists(topic);
  if (exists) {
    console.log(`⚠️ Topic '${topic}' exists. Aborting.`);
    return { status: "done" };
  }

  return { topicIdea: topic };
}

// --- NODE 3: RESEARCHER ---
async function researcherNode(state: typeof GraphState.State) {
  if (state.status === "done") return { status: "done" };

  console.log(`🔎 Researching: ${state.topicIdea}`);
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const searchResult = await tvly.search(state.topicIdea || "Tech News", {
    searchDepth: "basic",
    maxResults: 3,
  });

  const notes = searchResult.results.map((r) => r.content).join("\n\n");
  return { researchNotes: notes };
}

// --- NODE 4: WRITER (Updated for Dynamic Titles) ---
async function writerNode(state: typeof GraphState.State) {
  if (state.status === "done") return { status: "done" };
  console.log("✍️ Writing article...");

  // 1. Generate Content
  const articleResponse = await model.invoke([
    new SystemMessage(
      "You are an expert technical writer. Write a comprehensive blog post in Markdown. Do NOT include a title at the top.",
    ),
    new HumanMessage(
      `Topic: ${state.topicIdea}\n\nNotes:\n${state.researchNotes}`,
    ),
  ]);

  // 2. ✅ NEW: Generate a Catchy Title
  const titleResponse = await model.invoke([
    new SystemMessage(
      "Generate a single, engaging, SEO-friendly headline for this article. Return ONLY the headline.",
    ),
    new HumanMessage(
      `Topic: ${state.topicIdea}\n\nContent Snippet:\n${articleResponse.content.toString().slice(0, 500)}`,
    ),
  ]);

  // 3. Generate Description (if new topic)
  let desc = state.topicDescription;
  if (state.mission === "create_new_trend") {
    const descResponse = await model.invoke([
      new SystemMessage("Write a 2-sentence description for this topic."),
      new HumanMessage(`Topic: ${state.topicIdea}`),
    ]);
    desc = descResponse.content.toString();
  }

  return {
    articleContent: articleResponse.content.toString(),
    articleTitle: titleResponse.content.toString().replace(/"/g, "").trim(), // Clean the title
    topicDescription: desc,
  };
}

// --- NODE 5: PUBLISHER ---
async function publisherNode(state: typeof GraphState.State) {
  if (state.status === "done") return { status: "done" };
  console.log("🚀 Publishing...");

  let currentSlug = state.topicSlug;

  // Path A: Create New Topic
  if (state.mission === "create_new_trend") {
    const newTopic = await createTopicTool(
      state.topicIdea!,
      state.topicDescription!,
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1000&q=80",
    );
    if (!newTopic) return { status: "done" };
    currentSlug = newTopic.slug;
  }

  // Path B: Publish Article
  if (currentSlug && state.articleContent) {
    await createArticleTool(
      state.articleTitle || `Overview: ${state.topicIdea}`, // ✅ Use the dynamic title
      state.articleContent,
      currentSlug,
    );
    console.log(`✅ Published: "${state.articleTitle}" to ${currentSlug}`);
  }

  return { status: "done" };
}

// --- ROUTING LOGIC ---
// This function decides where to go after the Analyst
function routeAfterAnalyst(state: typeof GraphState.State) {
  if (state.mission === "fill_empty_topic") {
    return "researcher"; // Skip planning
  }
  return "planner"; // Need to plan a new topic
}

// --- BUILD THE GRAPH ---
export const runAgent = async () => {
  const workflow = new StateGraph(GraphState)
    .addNode("analyst", analystNode)
    .addNode("planner", plannerNode)
    .addNode("researcher", researcherNode)
    .addNode("writer", writerNode)
    .addNode("publisher", publisherNode)

    // ✅ START -> Analyst
    .addEdge(START, "analyst")

    // ✅ CONDITIONAL EDGE: Analyst -> (Planner OR Researcher)
    .addConditionalEdges("analyst", routeAfterAnalyst, {
      planner: "planner",
      researcher: "researcher",
    })

    // Normal Flow from Planner
    .addEdge("planner", "researcher")

    // Normal Flow rest of the way
    .addEdge("researcher", "writer")
    .addEdge("writer", "publisher")
    .addEdge("publisher", END);

  const app = workflow.compile();
  const result = await app.invoke({ status: "idle" });
  return result;
};
