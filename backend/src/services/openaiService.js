const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.client = null;
  }

  isConfigured() {
    return Boolean(this.apiKey) && this.apiKey !== 'mock-key';
  }

  getClient() {
    if (!this.isConfigured()) return null;
    if (!this.client) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  async synthesizeAnswer({ question, documentContext = '', webContext = '' }) {
    const client = this.getClient();
    if (!client) {
      const parts = [];
      if (documentContext) parts.push(`Document evidence:\n${documentContext}`);
      if (webContext) parts.push(`Web evidence:\n${webContext}`);
      if (parts.length === 0) return "I couldn't find enough information to answer that yet.";
      return parts.join('\n\n');
    }

    const completion = await client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a precise assistant. Use only the provided evidence. Prefer document facts when they conflict with web snippets. If evidence is insufficient, say so clearly. Keep answers concise and practical.'
        },
        {
          role: 'user',
          content: [
            `Question: ${question}`,
            documentContext ? `Document Context:\n${documentContext}` : '',
            webContext ? `Web Context:\n${webContext}` : '',
            'Add citations inline using [Doc N] for document evidence and [Web N] for web evidence whenever possible.'
          ]
            .filter(Boolean)
            .join('\n\n')
        }
      ]
    });

    return (
      completion?.choices?.[0]?.message?.content ||
      "I couldn't generate a response right now."
    );
  }
}

module.exports = new OpenAIService();
