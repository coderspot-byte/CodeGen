// openrouter.js
const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  { name: 'openai/gpt-4-turbo', tokens: 128000 },
  { name: 'mistral/mistral-large', tokens: 32000 },
  { name: 'anthropic/claude-3-opus', tokens: 200000 },
  { name: 'google/gemini-pro', tokens: 32000 }
];

function getBestModel() {
  return MODELS.reduce((a, b) => (a.tokens > b.tokens ? a : b)).name;
}

async function generateResponse(prompt, model) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model,
      messages: [
        { role: 'system', content: 'You are a helpful code generator.' },
        { role: 'user', content: prompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices?.[0]?.message?.content || 'No response';
}

module.exports = { getBestModel, generateResponse };
