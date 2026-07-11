import { TavilySearch } from "@langchain/tavily";

export function createTavilyTool(maxResults: number = 5) {
  return new TavilySearch({
    maxResults,
  });
}

export async function searchWithTavily(
  query: string,
  maxResults: number = 5
): Promise<string> {
  const tool = createTavilyTool(maxResults);
  try {
    // TavilySearch.invoke requires an object with a query field
    const result = await tool.invoke({ query });
    if (typeof result === "string") return result;
    return JSON.stringify(result);
  } catch (error) {
    console.error("Tavily search error:", error);
    throw error;
  }
}
