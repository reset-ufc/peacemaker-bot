/*

const axios = require('axios');

module.exports = async function getFriendlyComment(toxicComment) {
  const gptMessage = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: toxicComment
      }
    ]
  };

  const gptResponse = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', gptMessage, {
    headers: {
      'Authorization': `Bearer ${process.env.GPT_API_KEY}`
    }
  });

  return gptResponse.data.choices[0].text;
};
*/