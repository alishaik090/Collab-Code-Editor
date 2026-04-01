require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cors());

const port = process.env.PORT || 3002;

let groq;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } else {
    console.warn("GROQ_API_KEY is not set. API calls will fail.");
  }
} catch (error) {
  console.error("Error initializing Groq DB:", error.message);
}

// Ensure groq model is defined
const MODEL_NAME = "llama-3.3-70b-versatile";

// Test route
app.get("/api/ai/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ai/convert", async (req, res) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;

    if (!groq) return res.status(500).json({ error: "Groq API key not configured." });
    if (!code || !targetLanguage) {
      return res.status(400).json({ error: "code and targetLanguage are required." });
    }

    const prompt = `Convert the following ${sourceLanguage || 'code'} to ${targetLanguage}. 
Return strictly the raw code without any markdown code blocks, backticks, or extra explanation text.

Code snippet:
${code}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL_NAME,
      temperature: 0.1,
    });

    const convertedCode = chatCompletion.choices[0]?.message?.content || "";
    // Clean up potential markdown blocks if the model still adds them
    const cleanedCode = convertedCode.replace(/^```[a-z]*\n/gmi, "").replace(/```$/gmi, "").trim();

    return res.json({ result: cleanedCode });
  } catch (error) {
    console.error("Error in convert API:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/explain", async (req, res) => {
  try {
    const { code, errorOutput, language } = req.body;

    if (!groq) return res.status(500).json({ error: "Groq API key not configured." });

    const prompt = `Analyze this ${language || 'code'} snippet and the provided error/output. Explain what the error means simply and clearly to a developer. Do not provide the fully fixed code, just explain the problem and suggest how to fix it conceptually.

Code:
${code}

Error/Output:
${errorOutput}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL_NAME,
      temperature: 0.4,
    });

    return res.json({ result: chatCompletion.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error in explain API:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/fix", async (req, res) => {
  try {
    const { code, errorOutput, language } = req.body;

    if (!groq) return res.status(500).json({ error: "Groq API key not configured." });

    const prompt = `Fix the errors in this ${language || 'code'} snippet based on the error output. 
Return strictly the raw corrected code without any markdown code blocks, backticks, or explanation.

Original Code:
${code}

Error/Output:
${errorOutput}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL_NAME,
      temperature: 0.1,
    });

    const fixedCode = chatCompletion.choices[0]?.message?.content || "";
    const cleanedCode = fixedCode.replace(/^```[a-z]*\n/gmi, "").replace(/```$/gmi, "").trim();

    return res.json({ result: cleanedCode });
  } catch (error) {
    console.error("Error in fix API:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`AI Service running on http://localhost:${port}`);
});
