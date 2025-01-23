const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

async function llmRequest(prompt, toxicComment) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    return await groq.chat.completions.create({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: toxicComment },
      ],
      model: 'llama3-70b-8192',
    });
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

function getPrompts() {
  const filePath = path.join(__dirname, '../prompts/prompts.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function getCommentSuggestions(toxicComment, language) {
  try {
    const prompts = getPrompts();
    const promptKey = `prompt_recommendation_${language}`;

    if (!prompts[promptKey]) {
      throw new Error(`Language '${language}' not supported`);
    }

    const friendlyComment = await llmRequest(prompts[promptKey], toxicComment);
    const classification = await llmRequest(
      prompts.prompt_classification_en,
      toxicComment,
    );

    return {
      friendlyComment: JSON.parse(
        friendlyComment.choices[0].message.content
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201c\u201d]/g, '"'),
      ),
      classification: JSON.parse(
        classification.choices[0].message.content
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201c\u201d]/g, '"'),
      ),
    };
  } catch (error) {
    console.error('Comment suggestions error:', error);
    throw error;
  }
}

module.exports = { getCommentSuggestions };
