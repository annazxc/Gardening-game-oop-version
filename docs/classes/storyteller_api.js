import { getApiKey } from "../api/keys.js";
export class StorytellerAPI {
  constructor() {
    // Import the getApiKey function
    this.getApiKey = getApiKey;

    //use folder api --> wonderland_db vector database,
    // use this database and LLMs to reply
    // use Python backend to serve the Vector DB
    // set endpoint
    // These will be initialized in the init method
    this.GROQ_API_KEY = null;
    this.GEMINI_API_KEY = null;
    this.VECTOR_DB_API_ENDPOINT = null;
    this.conversationHistory = [];

    // Initialize API keys
    this.init();
  }

  async init() {
    try {
      this.GROQ_API_KEY = this.getApiKey("groq");
      this.GEMINI_API_KEY = this.getApiKey("gemini");
      this.VECTOR_DB_API_ENDPOINT = "http://localhost:8000/api/query";
    } catch (error) {
      console.error("Error initializing API keys:", error);
    }
  }

  async queryAliceStorybase(userQuestion) {
    try {
      const relevantContext = await this.fetchRelevantContext(userQuestion);

      //using Groq's Llama3 model
      const response = await this.generateStorytellerResponse(
        userQuestion,
        relevantContext
      );

      return response;
    } catch (error) {
      console.error("Error querying Alice storybase:", error);
      return `Oh dear! The Wit Tree seems to be napping. 
      Try again in a moment, or ask something else about Wonderland!`;
    }
  }

  async fetchRelevantContext(query) {
    try {
      // Check if Vector DB endpoint is properly configured
      if (
        !this.VECTOR_DB_API_ENDPOINT ||
        this.VECTOR_DB_API_ENDPOINT.includes("your-vector-db-endpoint")
      ) {
        console.warn(
          "Vector DB endpoint not properly configured. Using fallback context."
        );
        return this.getFallbackContext();
      }

      const response = await fetch(this.VECTOR_DB_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          topK: 3, // Number of relevant passages to retrieve
        }),
      });

      if (!response.ok) {
        throw new Error(`Vector DB API returned status ${response.status}`);
      }

      const data = await response.json();
      return data.contexts.join("\n\n");
    } catch (error) {
      console.error("Error fetching context:", error);
      return this.getFallbackContext();
    }
  }

  getFallbackContext() {
    return `Alice's Adventures in Wonderland is a novel written by Lewis Carroll in 1865. 
    The story follows Alice, 
    a young girl who falls through a rabbit hole into a fantasy world populated by peculiar creatures.`;
  }

  getConversationHistoryPrompt() {
    if (this.conversationHistory.length === 0) return "";

    let historyPrompt = "Previous conversation:\n";
    this.conversationHistory.forEach((entry) => {
      historyPrompt += `${entry.role}: ${entry.content}\n`;
    });

    return historyPrompt;
  }

  addToConversationHistory(role, content) {
    this.conversationHistory.push({ role, content });

    // Keep only the most recent exchanges to maintain context window
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }
  }

  async generateStorytellerResponse(userQuestion, context) {
    const systemPrompt = `You are a knowledgeable storyteller called the wit tree about the book Alice's Adventures in Wonderland. 
                         Users do not have access to your dataset, so do not say "based on your given dataset." 
                         Be concise and focus only on the key points. ლ(╹◡╹ლ) (,,・ω・,,) 
                         If the user asks for more details, you can then provide additional information. 
                         Be clear, concise, and offer specific suggestions in a friendly tone. 
                         Maximum 5 sentences for a reply.`;

    const historyPrompt = this.getConversationHistoryPrompt();

    const userPrompt = `${
      historyPrompt ? historyPrompt + "\n\n" : ""
    }Based on the following data: ${context}
                       The user's question is: ${userQuestion}
                       Please respond according to the information provided. 
                       If the data is insufficient, let the user know that more data is needed 
                       or honestly state that there isn't enough information to assist with that part.`;

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Groq API returned status ${response.status}`);
      }

      const data = await response.json();
      const responseContent = data.choices[0].message.content;

      this.addToConversationHistory("user", userQuestion);
      this.addToConversationHistory("assistant", responseContent);

      return responseContent;
    } catch (error) {
      console.error("Error with Groq API:", error);
      return await this.fallbackToGemini(userQuestion, context);
    }
  }

  async fallbackToGemini(userQuestion, context) {
    const API_URL =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

    const prompt = `You are a storyteller who knows all about "Alice's Adventures in Wonderland."
                   Based on this context: ${context}
                   Please answer this question about the book: ${userQuestion}
                   Keep your answer friendly, concise (maximum 5 sentences), and focused on the book.`;

    try {
      const response = await fetch(`${API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error with Gemini API:", error);
      return `The Wit Tree is having trouble remembering the stories right now. 
      Perhaps try again later?`;
    }
  }
}

// Create singleton instance
const storytellerAPIInstance = new StorytellerAPI();

// Backward compatibility functions - update to use async/await for init
let apiInitialized = false;
let initPromise = null;

// Initialize API once before usage
function ensureInitialized() {
  if (!apiInitialized && !initPromise) {
    initPromise = (async () => {
      await storytellerAPIInstance.init();
      apiInitialized = true;
    })();
  }
  return initPromise;
}
