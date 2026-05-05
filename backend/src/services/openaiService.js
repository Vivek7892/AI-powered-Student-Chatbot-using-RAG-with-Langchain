const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.client = null;
  }

  isOpenAIConfigured() {
    return Boolean(this.apiKey) && this.apiKey !== 'mock-key' && !this.apiKey.startsWith('sk-proj-REPLACE');
  }

  isGeminiConfigured() {
    return Boolean(this.geminiApiKey);
  }

  getClient() {
    if (!this.isOpenAIConfigured()) return null;
    if (!this.client) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  async synthesizeAnswer({ question, documentContext = '', webContext = '' }) {
    const systemPrompt =
      'You are a helpful student assistant. Use only the provided evidence to answer. ' +
      'If evidence is insufficient, say so clearly. Keep answers concise and practical. ' +
      'Add citations inline using [Doc N] for document evidence and [Web N] for web evidence.';

    const userContent = [
      `Question: ${question}`,
      documentContext ? `Document Context:\n${documentContext}` : '',
      webContext ? `Web Context:\n${webContext}` : ''
    ].filter(Boolean).join('\n\n');

    // Try OpenAI first
    const client = this.getClient();
    if (client) {
      try {
        const completion = await client.chat.completions.create({
          model: this.model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ]
        });
        return completion?.choices?.[0]?.message?.content || "I couldn't generate a response right now.";
      } catch (error) {
        console.error('OpenAI error, trying Gemini fallback:', error.message);
      }
    }

    // Gemini fallback
    if (this.isGeminiConfigured()) {
      try {
        const prompt = `${systemPrompt}\n\n${userContent}`;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );
        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (error) {
        console.error('Gemini fallback error:', error.message);
      }
    }

    // Last resort: return raw context in a readable format
    const parts = [];
    if (documentContext) parts.push(`Based on your document:\n${documentContext}`);
    if (webContext) parts.push(`From the web:\n${webContext}`);
    if (parts.length === 0) {
      return "I couldn't find enough information to answer that. Please upload relevant documents or try a different question.";
    }
    return parts.join('\n\n');
  }
}

module.exports = new OpenAIService();
