const express = require("express");
const db = require("../config/db"); // MySQL connection (if needed)
const { deepseekai } = require("../deepseek/deepseek"); // OpenAI setup

const router = express.Router();

router.post("/deepseek-ai", async (req, res) => {
    try {
        const { prompt } = req.body; // Get user input from request body
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }
        const completion = await deepseekai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "deepseek-chat",
          });
       
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "AI request failed" });
    }
});



module.exports = router; // Export Router
