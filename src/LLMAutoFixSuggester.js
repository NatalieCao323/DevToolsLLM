const AutoFixSuggester = require('./AutoFixSuggester');

/**
 * LLM-Enhanced Auto Fix Suggester
 * 可选功能：用户可以选择使用 LLM 来生成更智能的修复建议
 * 支持多种模型和提供商
 */
class LLMAutoFixSuggester extends AutoFixSuggester {
  constructor(options = {}) {
    super(options);
    
    this.llmConfig = {
      enabled: options.llmEnabled || false,
      provider: options.provider || 'openai', // openai, anthropic, local, ollama
      model: options.model || 'gpt-3.5-turbo',
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
      baseURL: options.baseURL, // 支持自定义端点
      fallbackToRules: options.fallbackToRules !== false // 默认回退到规则引擎
    };
  }

  async suggestFix(error, toolCall, history = []) {
    // 如果未启用 LLM 或配置不完整，使用基础规则引擎
    if (!this.llmConfig.enabled || !this._isLLMConfigured()) {
      console.log('[AutoFix] Using rule-based suggestions (free)');
      return super.suggestFix(error, toolCall, history);
    }

    try {
      console.log(`[AutoFix] Using LLM: ${this.llmConfig.model}`);
      const llmSuggestions = await this._generateLLMFixes(error, toolCall, history);
      
      // 合并 LLM 建议和规则引擎建议
      const ruleSuggestions = await super.suggestFix(error, toolCall, history);
      
      return {
        ...ruleSuggestions,
        fixes: [...llmSuggestions, ...ruleSuggestions.fixes],
        source: 'llm_enhanced'
      };
    } catch (err) {
      console.warn('[AutoFix] LLM failed, falling back to rules:', err.message);
      
      if (this.llmConfig.fallbackToRules) {
        return super.suggestFix(error, toolCall, history);
      }
      
      throw err;
    }
  }

  async _generateLLMFixes(error, toolCall, history) {
    const provider = this.llmConfig.provider;

    switch (provider) {
      case 'openai':
        return this._generateWithOpenAI(error, toolCall, history);
      case 'anthropic':
        return this._generateWithAnthropic(error, toolCall, history);
      case 'ollama':
        return this._generateWithOllama(error, toolCall, history);
      case 'local':
        return this._generateWithLocalModel(error, toolCall, history);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async _generateWithOpenAI(error, toolCall, history) {
    const prompt = this._buildPrompt(error, toolCall, history);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.llmConfig.apiKey}`
      },
      body: JSON.stringify({
        model: this.llmConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert debugging assistant. Analyze errors and provide actionable fix suggestions with code examples.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return this._parseLLMResponse(data.choices[0].message.content);
  }

  async _generateWithOllama(error, toolCall, history) {
    // Ollama 是完全免费的本地 LLM 运行方案
    const baseURL = this.llmConfig.baseURL || 'http://localhost:11434';
    const prompt = this._buildPrompt(error, toolCall, history);

    const response = await fetch(`${baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.llmConfig.model || 'codellama',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return this._parseLLMResponse(data.response);
  }

  async _generateWithAnthropic(error, toolCall, history) {
    const prompt = this._buildPrompt(error, toolCall, history);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.llmConfig.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.llmConfig.model || 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return this._parseLLMResponse(data.content[0].text);
  }

  async _generateWithLocalModel(error, toolCall, history) {
    // 支持用户自己部署的模型（如 vLLM, text-generation-webui）
    const baseURL = this.llmConfig.baseURL || 'http://localhost:8000';
    const prompt = this._buildPrompt(error, toolCall, history);

    const response = await fetch(`${baseURL}/v1/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.llmConfig.model,
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.status}`);
    }

    const data = await response.json();
    return this._parseLLMResponse(data.choices[0].text);
  }

  _buildPrompt(error, toolCall, history) {
    return `Analyze this error and provide fix suggestions:

Error: ${error.message || error}
Tool: ${toolCall.name}
Parameters: ${JSON.stringify(toolCall.parameters, null, 2)}
Context: ${history.length} previous calls

Please provide:
1. Root cause analysis
2. 2-3 specific fix suggestions
3. Code examples for each fix
4. Confidence level (0-1) for each suggestion

Format as JSON:
{
  "fixes": [
    {
      "title": "Fix title",
      "description": "Detailed explanation",
      "code": "Code example",
      "confidence": 0.9,
      "effort": "low|medium|high"
    }
  ]
}`;
  }

  _parseLLMResponse(responseText) {
    try {
      // 尝试提取 JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.fixes || [];
      }
    } catch (e) {
      console.warn('[AutoFix] Failed to parse LLM response as JSON');
    }

    // 如果解析失败，返回文本建议
    return [{
      title: 'LLM Suggestion',
      description: responseText,
      code: '',
      confidence: 0.7,
      effort: 'medium',
      source: 'llm_text'
    }];
  }

  _isLLMConfigured() {
    const { provider, apiKey, baseURL } = this.llmConfig;

    // Ollama 和 local 不需要 API key
    if (provider === 'ollama' || provider === 'local') {
      return true;
    }

    // OpenAI 和 Anthropic 需要 API key
    if (provider === 'openai' || provider === 'anthropic') {
      return !!apiKey;
    }

    return false;
  }

  // 获取支持的免费选项
  static getFreeOptions() {
    return {
      providers: [
        {
          name: 'ollama',
          description: '本地运行，完全免费',
          models: ['codellama', 'llama2', 'mistral', 'deepseek-coder'],
          setup: 'Install Ollama from https://ollama.ai',
          cost: 'Free'
        },
        {
          name: 'local',
          description: '自部署模型，完全免费',
          models: ['Custom models via vLLM, text-generation-webui, etc.'],
          setup: 'Deploy your own model server',
          cost: 'Free (hardware cost only)'
        }
      ],
      paidOptions: [
        {
          name: 'openai',
          description: '最强大，但需付费',
          models: ['gpt-4', 'gpt-3.5-turbo'],
          cost: '$0.0005-0.03 per 1K tokens'
        },
        {
          name: 'anthropic',
          description: '高质量，需付费',
          models: ['claude-3-haiku', 'claude-3-sonnet'],
          cost: '$0.00025-0.003 per 1K tokens'
        }
      ]
    };
  }
}

module.exports = LLMAutoFixSuggester;
