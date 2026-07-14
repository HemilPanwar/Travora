import { TavilySearch } from "@langchain/tavily";

// Tavily search tool for web research
// API key is read from TAVILY_API_KEY env var automatically
const tavilyTool = new TavilySearch({ maxResults: 5 });

/**
 * Perform a Tavily web search for a given query.
 * Returns a summarized string of results.
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    // TavilySearch.invoke expects an object with { query: string }
    const result = await tavilyTool.invoke({ query });
    if (typeof result === "string") return result;
    if (Array.isArray(result)) {
      return result
        .slice(0, 5)
        .map((r: { title?: string; content?: string; url?: string }) =>
          `Title: ${r.title || ""}\nContent: ${r.content || ""}\nURL: ${r.url || ""}`
        )
        .join("\n\n");
    }
    return JSON.stringify(result);
  } catch (err) {
    console.error("[Tavily] Search failed:", err);
    throw err;
  }
}
