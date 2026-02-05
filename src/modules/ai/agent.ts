import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { tavily } from "@tavily/core";
import { checkTopicExists, createTopicTool, createArticleTool } from "./tools";

// Initialize LLM (Groq)
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// 1. Define State using Annotation (The Modern Way)
const GraphState = Annotation.Root({
  topicIdea: Annotation<string>(),
  topicDescription: Annotation<string>(),
  researchNotes: Annotation<string>(),
  articleContent: Annotation<string>(),
  status: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "idle",
    default: () => "idle",
  }),
});

// 2. Define Nodes (Use 'typeof GraphState.State')
async function plannerNode(state: typeof GraphState.State) {
  console.log("🤖 Thinking of a topic...");

  const response = await model.invoke([
    new SystemMessage(
      "You are a tech trend watcher. Generate ONE unique, trending technology topic title that is specific (e.g., 'Rust vs C++ Performance' instead of just 'Coding'). Return ONLY the title.",
    ),
    new HumanMessage("Give me a topic."),
  ]);

  const topic = response.content.toString().trim().replace(/"/g, "");

  const exists = await checkTopicExists(topic);
  if (exists) {
    console.log(`⚠️ Topic '${topic}' exists. Aborting.`);
    return { status: "done" };
  }

  return { topicIdea: topic, status: "researching" };
}

async function researcherNode(state: typeof GraphState.State) {
  if (!state.topicIdea || state.status === "done") return { status: "done" };
  console.log(`🔎 Researching: ${state.topicIdea}`);

  const tvly = tavily({ apiKey: process.env.TRAVILY_API_KEY });
  const searchResult = await tvly.search(state.topicIdea, {
    searchDepth: "basic",
    maxResults: 3,
  });

  const notes = searchResult.results.map((r) => r.content).join("\n\n");
  return { researchNotes: notes, status: "writing" };
}

async function writerNode(state: typeof GraphState.State) {
  if (!state.topicIdea || state.status === "done") return { status: "done" };
  console.log("✍️ Writing article...");

  const descResponse = await model.invoke([
    new SystemMessage(
      "Write a short, punchy 2-sentence description for a topic.",
    ),
    new HumanMessage(
      `Topic: ${state.topicIdea}. Notes: ${state.researchNotes}`,
    ),
  ]);

  const articleResponse = await model.invoke([
    new SystemMessage(
      "You are an expert technical writer. Write a comprehensive, engaging blog post in Markdown format. Use headings (##), bullet points, and code blocks if needed. Do NOT include the title in the body.",
    ),
    new HumanMessage(
      `Topic: ${state.topicIdea}\n\nContext Notes:\n${state.researchNotes}`,
    ),
  ]);

  return {
    topicDescription: descResponse.content.toString(),
    articleContent: articleResponse.content.toString(),
    status: "publishing",
  };
}

async function publisherNode(state: typeof GraphState.State) {
  if (!state.topicIdea || state.status === "done") return { status: "done" };
  console.log("🚀 Publishing...");

  const topic = await createTopicTool(
    state.topicIdea,
    state.topicDescription || "A curated topic by AI.",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1000&q=80",
  );

  if (topic) {
    await createArticleTool(
      `Introduction to ${state.topicIdea}`,
      state.articleContent || "",
      topic.slug,
    );
    console.log(`✅ Successfully published: ${state.topicIdea}`);
  }

  return { status: "done" };
}

// 3. Build the Graph (Chained for better type inference)
export const runAgent = async () => {
  const workflow = new StateGraph(GraphState)
    .addNode("planner", plannerNode)
    .addNode("researcher", researcherNode)
    .addNode("writer", writerNode)
    .addNode("publisher", publisherNode)

    // Edges
    .addEdge(START, "planner")
    .addEdge("planner", "researcher")
    .addEdge("researcher", "writer")
    .addEdge("writer", "publisher")
    .addEdge("publisher", END);

  const app = workflow.compile();

  const result = await app.invoke({ status: "idle" });
  return result;
};
