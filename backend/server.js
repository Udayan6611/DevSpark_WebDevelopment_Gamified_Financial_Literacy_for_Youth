const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

// Firebase
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   BASIC ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("AI Financial Coach Backend Running");
});

async function callGroq(prompt, jsonMode = false) {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: jsonMode
          ? "You are a financial advisor. Always respond with valid JSON only, no extra text."
          : "You are a friendly, practical financial advisor for young adults. Give concise, actionable advice.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices?.[0]?.message?.content || "No response";
}

/* ===============================
   SAVE USER
================================ */
app.post("/save-user", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    await db.collection("users").doc(name).set({
      name,
      xp: 0,
      level: 1,
    });

    res.json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save user", error: error.message });
  }
});

/* ===============================
   GET USER
================================ */
app.get("/user/:name", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.name).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error: error.message });
  }
});

/* ===============================
   ADD XP
================================ */
app.post("/add-xp", async (req, res) => {
  try {
    const { name, xp } = req.body;

    if (!name || typeof xp !== "number") {
      return res.status(400).json({ message: "name and numeric xp are required" });
    }

    const ref = db.collection("users").doc(name);
    const doc = await ref.get();

    const currentXP = doc.data()?.xp || 0;
    const newXP = currentXP + xp;
    const level = Math.floor(newXP / 50) + 1;

    await ref.set(
      {
        xp: newXP,
        level,
      },
      { merge: true }
    );

    res.json({ xp: newXP, level });
  } catch (error) {
    res.status(500).json({ message: "Failed to add XP", error: error.message });
  }
});

/* ===============================
   QUIZ (SIMPLE)
================================ */
app.post("/quiz", async (req, res) => {
  try {
    const { name, answers } = req.body;

    if (!name || !answers) {
      return res.status(400).json({ message: "name and answers are required" });
    }

    let score = 0;
    if (answers.q1 === "save") score++;
    if (answers.q2 === "invest") score++;

    const xpEarned = score * 10;

    const ref = db.collection("users").doc(name);
    const doc = await ref.get();

    const currentXP = doc.data()?.xp || 0;
    const newXP = currentXP + xpEarned;
    const level = Math.floor(newXP / 50) + 1;

    await ref.set({ xp: newXP, level }, { merge: true });

    res.json({ score, xpEarned, xp: newXP, level });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit quiz", error: error.message });
  }
});

/* ===============================
   AI ADVICE (GROQ)
================================ */
app.post("/ai-advice", async (req, res) => {
  try {
    const { income, expense, goal, age, savings, debt } = req.body;

    if (!income || !expense || !goal) {
      return res.status(400).json({
        error: "Missing required fields: income, expense, goal",
        required: ["income", "expense", "goal"],
      });
    }

    const monthlySavings = income - expense;
    const savingsRate = (monthlySavings / income) * 100;
    const isSavingsPositive = monthlySavings > 0;
    const savingsStatus = isSavingsPositive
      ? `Good: user can save INR ${monthlySavings} monthly (${savingsRate.toFixed(1)} percent of income).`
      : `Warning: expenses exceed income by INR ${Math.abs(monthlySavings)}.`;

    const prompt = `
User Financial Profile:
- Monthly Income: INR ${income}
- Monthly Expenses: INR ${expense}
- Monthly Savings: INR ${monthlySavings}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Current Savings: INR ${savings || 0}
- Age: ${age || "Not specified"}
- Debt: ${debt || "No debt mentioned"}
- Goal: ${goal}

${savingsStatus}

Provide financial advice with:
1. A short encouraging opener (1 sentence)
2. 2-3 specific actionable steps to achieve the goal
3. One practical warning or tip
4. A motivational closing line

Keep it under 120 words.
`;

    const advice = await callGroq(prompt);

    res.json({
      success: true,
      advice,
      metrics: {
        monthlySavings,
        savingsRate: savingsRate.toFixed(1),
        isSavingsPositive,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate advice",
      message: error.message,
    });
  }
});

/* ===============================
   SIMULATION (BUY VS SAVE) (GROQ)
================================ */
app.post("/simulate", async (req, res) => {
  try {
    const {
      income,
      expense,
      itemName,
      itemPrice,
      timeline = "flexible",
      savings = 0,
      priority = "medium",
    } = req.body;

    if (!income || !expense || !itemName || !itemPrice) {
      return res.status(400).json({
        error: "Missing required fields: income, expense, itemName, itemPrice",
      });
    }

    const monthlySavings = income - expense;
    const monthsToSave = monthlySavings > 0 ? Math.ceil(itemPrice / monthlySavings) : null;
    const canAffordNow = savings >= itemPrice;

    const prompt = `
Analyze this purchase scenario:

User Financials:
- Monthly Income: INR ${income}
- Monthly Expenses: INR ${expense}
- Monthly Savings Potential: INR ${monthlySavings}
- Current Savings: INR ${savings}
- Item: ${itemName} costing INR ${itemPrice}
- Timeline Preference: ${timeline}
- Priority Level: ${priority}

Return ONLY valid JSON with this exact structure (no extra text):
{
  "buyNow": {
    "possible": ${canAffordNow},
    "impact": "string",
    "warning": "string"
  },
  "saveForIt": {
    "monthsNeeded": ${monthsToSave ?? 999},
    "monthlyToSave": ${Math.min(Math.max(monthlySavings, 0), itemPrice)},
    "strategy": "string"
  },
  "recommendation": "string",
  "summary": "string",
  "alternativeTip": "string"
}
`;

    const simulationText = await callGroq(prompt, true);

    let simulation;
    try {
      const cleanJson = simulationText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      simulation = JSON.parse(cleanJson);
    } catch (parseError) {
      simulation = {
        buyNow: {
          possible: canAffordNow,
          impact: canAffordNow
            ? `Buying now uses ${((itemPrice / income) * 100).toFixed(1)}% of monthly income.`
            : `Need INR ${itemPrice - savings} more to afford this.`,
          warning: canAffordNow
            ? "Check if this purchase fits long-term goals."
            : "Avoid debt for non-essential purchases.",
        },
        saveForIt: {
          monthsNeeded: monthsToSave,
          monthlyToSave: Math.min(Math.max(monthlySavings, 0), itemPrice),
          strategy:
            monthlySavings > 0
              ? `Save INR ${Math.min(monthlySavings, itemPrice)} monthly for about ${monthsToSave} months.`
              : "Reduce expenses first to create savings room.",
        },
        recommendation: canAffordNow
          ? "You can afford this now, but waiting may preserve financial cushion."
          : monthlySavings > 0
            ? `Wait about ${monthsToSave} months and save systematically.`
            : "Improve cash flow before making this purchase.",
        summary: canAffordNow
          ? "Purchase is possible now, but savings discipline may still be better."
          : "Saving first is recommended based on current finances.",
        alternativeTip: "Set up automatic monthly transfer into a dedicated goal account.",
      };
    }

    res.json({
      success: true,
      simulation,
      metrics: {
        monthlySavings,
        monthsToSave,
        canAffordNow,
        savingsGap: itemPrice - savings,
        savingsRate: ((monthlySavings / income) * 100).toFixed(1),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to run simulation",
      message: error.message,
    });
  }
});

// Test Firebase Connection
app.get("/test-db", async (req, res) => {
  await db.collection("users").doc("testUser").set({
    name: "Test",
    xp: 10,
  });

  res.send("Firebase Connected");
});

app.get("/health", (req, res) => {
  res.json({
    status: "AI layer is running",
    provider: "Groq API",
    model: "llama-3.3-70b-versatile",
    endpoints: {
      "POST /save-user": "Create user profile",
      "GET /user/:name": "Get user profile",
      "POST /add-xp": "Add XP and update level",
      "POST /quiz": "Evaluate quiz and update XP",
      "POST /ai-advice": "Get financial advice",
      "POST /simulate": "Run purchase simulation",
      "GET /test-db": "Check Firebase write",
      "GET /health": "Health check",
    },
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
