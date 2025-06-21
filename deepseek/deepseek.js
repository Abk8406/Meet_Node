const OpenAI = require("openai")

const deepseekai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-16db130ec9ef4259b72b38ab6024a37b'
});
module.exports = {deepseekai}