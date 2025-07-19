class ChatSidebar {
  constructor() {
    this.messages = [];
    this.settings = {
      llmProvider: 'openai',
      model: 'gpt-4',
      apiKey: '',
      temperature: 0.7,
      mcpServers: []
    };
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateModelOptions();
    this.updateUI();
  }

  setupEventListeners() {
    // Settings toggle
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.toggleSettings();
    });

    // Settings form
    document.getElementById('llmProvider').addEventListener('change', (e) => {
      this.settings.llmProvider = e.target.value;
      this.updateModelOptions();
    });

    document.getElementById('modelSelect').addEventListener('change', (e) => {
      this.settings.model = e.target.value;
    });

    document.getElementById('apiKey').addEventListener('input', (e) => {
      this.settings.apiKey = e.target.value;
    });

    document.getElementById('temperature').addEventListener('input', (e) => {
      this.settings.temperature = parseFloat(e.target.value);
      document.getElementById('tempValue').textContent = e.target.value;
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveSettings();
    });

    // MCP management
    document.getElementById('addMcpBtn').addEventListener('click', () => {
      this.showMcpDialog();
    });

    // Chat input
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', () => {
      this.adjustTextareaHeight();
      this.updateSendButton();
    });

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    document.getElementById('sendBtn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Action buttons
    document.getElementById('clearBtn').addEventListener('click', () => {
      this.clearChat();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportChat();
    });
  }

  toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
  }

  updateModelOptions() {
    const modelSelect = document.getElementById('modelSelect');
    const provider = this.settings.llmProvider;
    
    const models = {
      openai: [
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ],
      anthropic: [
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
      ],
      openrouter: [
        { value: 'openai/gpt-4o', label: 'GPT-4o' },
        { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
        { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
        { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
        { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5' },
        { value: 'meta-llama/llama-3.1-405b-instruct', label: 'Llama 3.1 405B' },
        { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
        { value: 'meta-llama/llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
        { value: 'mistralai/mistral-large', label: 'Mistral Large' },
        { value: 'mistralai/mistral-medium', label: 'Mistral Medium' },
        { value: 'mistralai/mistral-small', label: 'Mistral Small' },
        { value: 'cohere/command-r-plus', label: 'Command R+' },
        { value: 'cohere/command-r', label: 'Command R' },
        { value: 'perplexity/llama-3.1-sonar-large-128k-online', label: 'Sonar Large Online' },
        { value: 'perplexity/llama-3.1-sonar-small-128k-online', label: 'Sonar Small Online' },
        { value: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen 2.5 72B' },
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
        { value: 'nvidia/llama-3.1-nemotron-70b-instruct', label: 'Nemotron 70B' },
        { value: 'liquid/lfm-40b', label: 'Liquid LFM 40B' },
        { value: 'openrouter/auto', label: 'Auto (Best Available)' }
      ],
      ollama: [
        { value: 'llama2', label: 'Llama 2' },
        { value: 'codellama', label: 'Code Llama' },
        { value: 'mistral', label: 'Mistral' },
        { value: 'neural-chat', label: 'Neural Chat' }
      ],
      custom: [
        { value: 'custom-model', label: 'Custom Model' }
      ]
    };

    modelSelect.innerHTML = '';
    models[provider].forEach(model => {
      const option = document.createElement('option');
      option.value = model.value;
      option.textContent = model.label;
      modelSelect.appendChild(option);
    });

    // Reset model selection for new provider
    this.settings.model = models[provider][0].value;
    modelSelect.value = this.settings.model;
  }

  showMcpDialog() {
    const name = prompt('MCP Server Name:');
    if (!name) return;

    const url = prompt('MCP Server URL:');
    if (!url) return;

    const mcpServer = { id: Date.now(), name, url, enabled: true };
    this.settings.mcpServers.push(mcpServer);
    this.updateMcpList();
  }

  updateMcpList() {
    const mcpList = document.getElementById('mcpList');
    
    if (this.settings.mcpServers.length === 0) {
      mcpList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem; text-align: center; padding: 1rem;">No MCP servers configured</p>';
      return;
    }

    mcpList.innerHTML = this.settings.mcpServers.map(server => `
      <div class="mcp-item">
        <div class="mcp-info">
          <div class="mcp-name">${server.name}</div>
          <div class="mcp-url">${server.url}</div>
        </div>
        <button class="mcp-remove" onclick="chatSidebar.removeMcpServer(${server.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  removeMcpServer(id) {
    this.settings.mcpServers = this.settings.mcpServers.filter(server => server.id !== id);
    this.updateMcpList();
  }

  adjustTextareaHeight() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  }

  updateSendButton() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = !input.value.trim() || this.isLoading;
  }

  async sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || this.isLoading) return;

    // Add user message
    this.addMessage('user', message);
    input.value = '';
    this.adjustTextareaHeight();
    this.updateSendButton();

    // Show loading state
    this.setLoading(true);

    try {
      // Get AI response
      const response = await this.getAIResponse(message);
      this.addMessage('assistant', response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error. Please check your settings and try again.');
    } finally {
      this.setLoading(false);
    }
  }

  async getAIResponse(message) {
    const { llmProvider, model, apiKey, temperature } = this.settings;

    if (!apiKey && llmProvider !== 'ollama') {
      throw new Error('API key is required');
    }

    const requestBody = {
      model: model,
      messages: [
        ...this.messages.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ],
      temperature: temperature
    };

    let apiUrl, headers;

    switch (llmProvider) {
      case 'openai':
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      case 'anthropic':
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        // Convert messages format for Anthropic
        requestBody.messages = requestBody.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }));
        requestBody.max_tokens = 1000;
        break;

      case 'openrouter':
        apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chat Sidebar'
        };
        break;

      case 'ollama':
        apiUrl = 'http://localhost:11434/api/chat';
        headers = {
          'Content-Type': 'application/json'
        };
        requestBody.stream = false;
        break;

      case 'custom':
        // Allow users to implement custom API endpoints
        apiUrl = prompt('Enter custom API endpoint:');
        if (!apiUrl) throw new Error('Custom API endpoint required');
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        break;

      default:
        throw new Error('Unsupported LLM provider');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract message content based on provider
    switch (llmProvider) {
      case 'openai':
        return data.choices[0]?.message?.content || 'No response received';
      
      case 'anthropic':
        return data.content[0]?.text || 'No response received';
      
      case 'openrouter':
        return data.choices[0]?.message?.content || 'No response received';
      
      case 'ollama':
        return data.message?.content || 'No response received';
      
      case 'custom':
        return data.choices?.[0]?.message?.content || data.response || 'No response received';
      
      default:
        return 'Unsupported response format';
    }
  }

  addMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString()
    };

    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  }

  renderMessage(message) {
    const messageList = document.getElementById('messageList');
    
    // Remove welcome message if it exists
    const welcomeMessage = messageList.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.role}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const icon = message.role === 'user' 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    messageEl.innerHTML = `
      <div class="message-avatar">
        ${icon}
      </div>
      <div class="message-content">
        ${this.formatMessageContent(message.content)}
        <div class="message-time">${time}</div>
      </div>
    `;

    messageList.appendChild(messageEl);
  }

  formatMessageContent(content) {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: var(--bg-tertiary); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  setLoading(loading) {
    this.isLoading = loading;
    
    const statusText = document.getElementById('statusText');
    const typingIndicator = document.getElementById('typingIndicator');
    const sendBtn = document.getElementById('sendBtn');

    if (loading) {
      statusText.textContent = 'AI is typing...';
      typingIndicator.classList.remove('hidden');
      sendBtn.disabled = true;
    } else {
      statusText.textContent = 'Ready';
      typingIndicator.classList.add('hidden');
      this.updateSendButton();
    }
  }

  scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = [];
      const messageList = document.getElementById('messageList');
      messageList.innerHTML = `
        <div class="welcome-message">
          <svg class="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>Welcome to AI Chat</h3>
          <p>Select your preferred LLM provider and start chatting!</p>
        </div>
      `;
    }
  }

  exportChat() {
    if (this.messages.length === 0) {
      alert('No messages to export');
      return;
    }

    const chatData = {
      exported: new Date().toISOString(),
      settings: this.settings,
      messages: this.messages
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async loadSettings() {
    try {
      const result = await browser.storage.local.get('chatSettings');
      if (result.chatSettings) {
        this.settings = { ...this.settings, ...result.chatSettings };
      }
    } catch (error) {
      console.warn('Could not load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await browser.storage.local.set({ chatSettings: this.settings });
      
      // Show success feedback
      const saveBtn = document.getElementById('saveSettings');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.style.background = 'var(--success-color)';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = 'var(--primary-color)';
      }, 2000);
      
    } catch (error) {
      console.error('Could not save settings:', error);
      alert('Failed to save settings');
    }
  }

  updateUI() {
    // Update form fields with current settings
    document.getElementById('llmProvider').value = this.settings.llmProvider;
    document.getElementById('apiKey').value = this.settings.apiKey;
    document.getElementById('temperature').value = this.settings.temperature;
    document.getElementById('tempValue').textContent = this.settings.temperature;
    
    this.updateMcpList();
  }
}

// Initialize the chat sidebar when the page loads
const chatSidebar = new ChatSidebar();

// Make chatSidebar globally available for onclick handlers
window.chatSidebar = chatSidebar;