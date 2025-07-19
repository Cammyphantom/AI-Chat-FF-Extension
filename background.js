// Background script for the Firefox extension
// Handles extension lifecycle and browser integration

class ChatExtensionBackground {
  constructor() {
    this.init();
  }

  init() {
    // Listen for extension installation/update
    browser.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    // Listen for sidebar panel events
    browser.sidebarAction.onToggle?.addListener((state) => {
      console.log('Sidebar toggled:', state);
    });

    // Handle messages from content scripts or sidebar
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      return this.handleMessage(message, sender, sendResponse);
    });

    // Set up context menus
    this.setupContextMenus();
  }

  handleInstall(details) {
    if (details.reason === 'install') {
      console.log('AI Chat Sidebar extension installed');
      
      // Initialize default settings
      this.initializeDefaultSettings();
      
      // Open sidebar by default
      browser.sidebarAction.open?.();
    } else if (details.reason === 'update') {
      console.log('AI Chat Sidebar extension updated');
    }
  }

  async initializeDefaultSettings() {
    const defaultSettings = {
      llmProvider: 'openai',
      model: 'gpt-4',
      apiKey: '',
      temperature: 0.7,
      mcpServers: [],
      theme: 'dark',
      autoSave: true
    };

    try {
      const result = await browser.storage.local.get('chatSettings');
      if (!result.chatSettings) {
        await browser.storage.local.set({ chatSettings: defaultSettings });
        console.log('Default settings initialized');
      }
    } catch (error) {
      console.error('Failed to initialize default settings:', error);
    }
  }

  setupContextMenus() {
    // Add context menu item to send selected text to AI chat
    browser.contextMenus.create({
      id: 'send-to-ai-chat',
      title: 'Send to AI Chat',
      contexts: ['selection']
    });

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'send-to-ai-chat' && info.selectionText) {
        this.sendTextToChat(info.selectionText);
      }
    });
  }

  async sendTextToChat(text) {
    try {
      // Open sidebar if it's not already open
      await browser.sidebarAction.open();
      
      // Send message to sidebar
      await browser.runtime.sendMessage({
        type: 'SEND_TEXT_TO_CHAT',
        text: text
      });
    } catch (error) {
      console.error('Failed to send text to chat:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'GET_ACTIVE_TAB_INFO':
        return this.getActiveTabInfo();
      
      case 'SAVE_SETTINGS':
        return this.saveSettings(message.settings);
      
      case 'GET_SETTINGS':
        return this.getSettings();
      
      case 'EXPORT_CHAT':
        return this.handleChatExport(message.data);
      
      case 'MCP_REQUEST':
        return this.handleMcpRequest(message.data);
      
      default:
        console.warn('Unknown message type:', message.type);
        return false;
    }
  }

  async getActiveTabInfo() {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      return {
        title: activeTab.title,
        url: activeTab.url,
        id: activeTab.id
      };
    } catch (error) {
      console.error('Failed to get active tab info:', error);
      return null;
    }
  }

  async saveSettings(settings) {
    try {
      await browser.storage.local.set({ chatSettings: settings });
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  }

  async getSettings() {
    try {
      const result = await browser.storage.local.get('chatSettings');
      return result.chatSettings || {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  async handleChatExport(chatData) {
    try {
      // Handle chat export functionality
      const blob = new Blob([JSON.stringify(chatData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      
      // Use downloads API to save file
      await browser.downloads.download({
        url: url,
        filename: `ai-chat-export-${new Date().toISOString().split('T')[0]}.json`,
        saveAs: true
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to export chat:', error);
      return { success: false, error: error.message };
    }
  }

  async handleMcpRequest(data) {
    try {
      // Handle Model Context Protocol requests
      // This would integrate with MCP servers configured by the user
      
      const { serverId, method, params } = data;
      
      // Get MCP server configuration
      const settings = await this.getSettings();
      const mcpServer = settings.mcpServers?.find(server => server.id === serverId);
      
      if (!mcpServer) {
        throw new Error('MCP server not found');
      }
      
      // Make request to MCP server
      const response = await fetch(mcpServer.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: method,
          params: params
        })
      });
      
      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
      
    } catch (error) {
      console.error('MCP request failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize the background script
new ChatExtensionBackground();