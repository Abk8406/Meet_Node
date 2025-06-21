const OpenAI = require("openai");
require("dotenv").config(); // Load environment variables

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Secure API Key
});

module.exports = { openai }; // Export properly for CommonJS
