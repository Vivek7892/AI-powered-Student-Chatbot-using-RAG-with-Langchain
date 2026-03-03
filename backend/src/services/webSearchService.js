class WebSearchService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    this.baseUrl = 'https://api.tavily.com/search';
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async search(query, options = {}) {
    if (!this.isConfigured()) {
      return {
        enabled: false,
        answer: '',
        results: [],
        error: 'TAVILY_API_KEY is not configured'
      };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: 'basic',
          include_answer: true,
          include_raw_content: false,
          max_results: Math.min(options.maxResults || 5, 10)
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();
      const results = Array.isArray(data.results)
        ? data.results.map((item) => ({
            title: item.title || 'Untitled source',
            url: item.url || '',
            snippet: item.content || '',
            score: item.score || 0
          }))
        : [];

      return {
        enabled: true,
        answer: data.answer || '',
        results
      };
    } catch (error) {
      console.error('Web search failed:', error.message);
      return {
        enabled: true,
        answer: '',
        results: [],
        error: error.message
      };
    }
  }
}

module.exports = new WebSearchService();
