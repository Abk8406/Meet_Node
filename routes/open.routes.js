const express = require("express");
const db = require("../config/db"); // MySQL connection (if needed)
const { openai } = require("../openAI/openai"); // OpenAI setup

const router = express.Router();

router.post("/ai-abk", async (req, res) => {
    try {
        const { prompt } = req.body; // Get user input from request body
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        res.json({ message: completion.choices[0].message.content });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "AI request failed" });
    }
});

module.exports = router; // Export Router
