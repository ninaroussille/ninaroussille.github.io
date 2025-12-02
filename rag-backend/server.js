import OpenAI from "openai";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;
const PORT = process.env.PORT || 3000;

// Validate required env vars
if (!OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable not set");
  process.exit(1);
}

if (!VECTOR_STORE_ID) {
  console.error("❌ Error: VECTOR_STORE_ID environment variable not set");
  process.exit(1);
}

// Initialize OpenAI client
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// CORS configuration - allow your GitHub Pages domain
const allowedOrigins = [
  "https://ninaroussille.github.io",
  "http://localhost:4000", // Jekyll local dev
  "http://127.0.0.1:4000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // In production, you might want to be stricter
      console.warn(`⚠️  CORS warning: Request from ${origin}`);
      callback(null, true); // Allow for now, tighten in production
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate limiting: 10 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/chat", limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", vectorStoreId: VECTOR_STORE_ID ? "configured" : "missing" });
});

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  // Validate input
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required and must be a non-empty string" });
  }

  // Limit message length
  if (message.length > 2000) {
    return res.status(400).json({ error: "Message too long (max 2000 characters)" });
  }

  // Limit history length (keep last 10 messages to avoid token limits)
  const recentHistory = history.slice(-10);

  try {
    // Use Assistants API with file_search for vector store support
    // First, get or create an assistant with the vector store
    let assistantId = process.env.ASSISTANT_ID;
    
    if (!assistantId) {
      // Create assistant with vector store
      const assistant = await client.beta.assistants.create({
        name: "Nina Roussille Research Assistant",
        instructions: `You are an academic assistant helping visitors understand economist Nina Roussille's research papers.

IMPORTANT RULES:
- Answer ONLY using information from the retrieved paper excerpts
- If the papers don't cover the question, say "I don't have information about that in the available papers."
- Use plain language when possible, but maintain economic precision
- When referencing specific findings, cite the paper name if available
- Be concise but thorough
- If asked about something outside the scope of the papers, politely redirect to the papers`,
        model: "gpt-4o-mini",
        tools: [{ type: "file_search" }],
        tool_resources: {
          file_search: {
            vector_store_ids: [VECTOR_STORE_ID]
          }
        }
      });
      assistantId = assistant.id;
      console.log(`Created assistant: ${assistantId} (save as ASSISTANT_ID in .env)`);
    }

    // Create a thread
    const thread = await client.beta.threads.create({
      messages: [
        ...recentHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ]
    });

    // Run the assistant
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    // Poll for completion
    let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
    let attempts = 0;
    while (runStatus.status === "in_progress" || runStatus.status === "queued") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
      if (attempts > 60) {
        throw new Error("Request timeout");
      }
    }

    if (runStatus.status === "completed") {
      // Get the messages
      const messages = await client.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(m => m.role === "assistant");
      const answer = assistantMessage?.content[0]?.text?.value || "I apologize, but I couldn't generate a response.";

      res.json({
        answer: answer,
        citations: null, // Can be enhanced to extract citations
        model: "gpt-4o-mini"
      });
    } else {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

  } catch (error) {
    console.error("Chat error:", error);
    
    // Provide user-friendly error messages
    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    
    if (error.status === 401) {
      return res.status(500).json({ error: "Authentication error. Please contact the site administrator." });
    }
    
    res.status(500).json({ 
      error: "Sorry, I encountered an error processing your question. Please try again." 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Chat backend running on port ${PORT}`);
  console.log(`📚 Vector Store ID: ${VECTOR_STORE_ID ? "configured" : "MISSING"}`);
});

