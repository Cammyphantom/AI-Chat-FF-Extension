# AI Chat Sidebar - Firefox Extension

A powerful Firefox sidebar extension that provides access to multiple AI language models with Model Context Protocol (MCP) support.

## Features

- **Multiple LLM Providers**: Support for OpenAI, Anthropic, OpenRouter, Ollama (local), and custom APIs
- **Model Context Protocol**: Integration with MCP servers for enhanced AI capabilities
- **Beautiful Interface**: Modern dark theme with smooth animations and responsive design
- **Chat Management**: Message history, export functionality, and easy chat clearing
- **Flexible Settings**: Configurable temperature, API keys, and model selection
- **Context Menu Integration**: Send selected text directly to AI chat
- **Local Storage**: Persistent settings and chat history

## Installation

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension directory
6. The extension will be loaded and the sidebar will be available

## Configuration

1. Click the settings icon in the sidebar header
2. Select your preferred LLM provider
3. Enter your API key (not required for Ollama)
4. Configure your model and temperature settings
5. Add MCP servers if needed
6. Click "Save Settings"

## Supported LLM Providers

### OpenAI
- GPT-4o
- GPT-4o Mini
- GPT-4 Turbo  
- GPT-3.5 Turbo

### Anthropic
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Haiku

### OpenRouter
- 20+ models including GPT-4o, Claude 3.5 Sonnet, Gemini Pro 1.5, Llama 3.1, Mistral, and more
- Auto-selection for best available model

### Ollama (Local)
- Llama 2
- Code Llama
- Mistral
- Neural Chat
- Any other locally installed models

### Custom API
- Configure your own API endpoint
- Compatible with OpenAI-style APIs

## Model Context Protocol (MCP)

The extension supports MCP servers to enhance AI capabilities with additional tools and context. Add MCP servers in the settings panel by providing:

- Server name
- Server URL
- Enable/disable individual servers

## Usage

1. Open the Firefox sidebar (View → Sidebar → AI Chat)
2. Configure your settings if first time use
3. Type your message in the input field
4. Press Enter or click Send
5. View AI responses in real-time

## Features

- **Smart Input**: Auto-expanding textarea with keyboard shortcuts
- **Message Export**: Save chat history as JSON
- **Context Menu**: Right-click selected text to send to AI
- **Typing Indicators**: Visual feedback during AI response generation
- **Responsive Design**: Optimized for different sidebar widths

## Development

To modify or extend the extension:

1. Edit the relevant files (`sidebar.js`, `styles.css`, `background.js`)
2. Reload the extension in `about:debugging`
3. Test changes in the sidebar

## File Structure

```
├── manifest.json          # Extension manifest
├── sidebar.html           # Main sidebar interface
├── sidebar.js             # Main sidebar logic
├── styles.css             # Styling and themes
├── background.js          # Background script
├── icons/                 # Extension icons
│   ├── icon-16.svg
│   ├── icon-32.svg
│   ├── icon-48.svg
│   └── icon-128.svg
└── README.md              # This file
```

## Privacy & Security

- API keys are stored locally in Firefox's extension storage
- No data is sent to third parties except your chosen AI provider
- MCP server communications are direct between the extension and servers
- Chat history is stored locally and can be exported/cleared at any time

## Troubleshooting

### API Connection Issues
- Verify your API key is correct
- Check that your internet connection is working
- For Ollama, ensure the service is running on localhost:11434

### Sidebar Not Opening
- Try reloading the extension in about:debugging
- Check that the extension is enabled
- Restart Firefox if needed

### MCP Server Issues
- Verify the server URL is correct and accessible
- Check server logs for error messages
- Ensure the server implements MCP protocol correctly

## License

This project is open source and available under the MIT License.