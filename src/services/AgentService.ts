import * as vscode from 'vscode';
import * as path from 'path';
import { WorkflowService } from './WorkflowService';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

interface ToolCall {
    tool: string;
    args: any;
    result?: any;
}

export class AgentService {
    private context: vscode.ExtensionContext | null = null;
    private panel: vscode.WebviewPanel | null = null;
    private messages: ChatMessage[] = [];
    private toolCalls: ToolCall[] = [];

    constructor(context: vscode.ExtensionContext | null = null) {
        this.context = context;
    }

    registerAgentPanel(context: vscode.ExtensionContext) {
        this.context = context;
    }

    showAgentPanel() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'workflow-agent',
            'Workflow Agent',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewHTML();
        this.panel.webview.onDidReceiveMessage(async (message) => {
            await this.handleWebviewMessage(message);
        });

        this.panel.onDidDispose(() => {
            this.panel = null;
        });
    }

    private getWebviewHTML(): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1E1E2E;
            color: #F8FAFC;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 16px;
            border-bottom: 1px solid #3D3D5C;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header h2 {
            font-size: 16px;
            font-weight: 600;
            color: #6366F1;
        }

        .header .icon {
            font-size: 24px;
        }

        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .message {
            max-width: 90%;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.5;
        }

        .message.user {
            align-self: flex-end;
            background: #6366F1;
            color: white;
        }

        .message.assistant {
            align-self: flex-start;
            background: #2D2D3F;
            border: 1px solid #3D3D5C;
        }

        .message.system {
            align-self: center;
            background: transparent;
            color: #94A3B8;
            font-size: 12px;
        }

        .tool-call {
            align-self: flex-start;
            background: #2D2D3F;
            border: 1px solid #8B5CF6;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            color: #8B5CF6;
        }

        .input-area {
            padding: 16px;
            border-top: 1px solid #3D3D5C;
            display: flex;
            gap: 12px;
        }

        .input-area input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #3D3D5C;
            border-radius: 6px;
            background: #2D2D3F;
            color: #F8FAFC;
            font-size: 14px;
            outline: none;
        }

        .input-area input:focus {
            border-color: #6366F1;
        }

        .input-area button {
            padding: 12px 24px;
            background: #6366F1;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 200ms;
        }

        .input-area button:hover {
            background: #5558E3;
        }

        .input-area button:disabled {
            background: #3D3D5C;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="header">
        <span class="icon">🤖</span>
        <h2>Workflow Agent</h2>
    </div>

    <div class="messages" id="messages">
        <div class="message system">
            Hi! I'm your workflow assistant. Describe what you want to create, and I'll help you build it.
        </div>
    </div>

    <div class="input-area">
        <input type="text" id="input" placeholder="Describe your workflow..." />
        <button id="send">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const input = document.getElementById('input');
        const sendBtn = document.getElementById('send');
        const messagesContainer = document.getElementById('messages');

        function addMessage(role, content, isToolCall = false) {
            const div = document.createElement('div');
            div.className = isToolCall ? 'tool-call' : 'message ' + role;
            div.textContent = content;
            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        sendBtn.addEventListener('click', () => {
            const message = input.value.trim();
            if (!message) return;

            addMessage('user', message);
            input.value = '';

            vscode.postMessage({ type: 'chat', content: message });
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'response') {
                addMessage('assistant', message.content);
            } else if (message.type === 'tool') {
                addMessage('assistant', 'Using tool: ' + message.tool, true);
            } else if (message.type === 'error') {
                addMessage('assistant', 'Error: ' + message.content);
            }
        });
    </script>
</body>
</html>`;
    }

    private async handleWebviewMessage(message: any): Promise<void> {
        if (message.type === 'chat') {
            const userMessage = message.content;
            this.messages.push({
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            });

            // Process the message and generate response
            const response = await this.processMessage(userMessage);

            this.messages.push({
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            });

            this.panel?.webview.postMessage({ type: 'response', content: response });
        }
    }

    private async processMessage(message: string): Promise<string> {
        // Simple AI response - in production, this would call Claude API
        const lowerMessage = message.toLowerCase();

        // Check if user wants to create a workflow
        if (lowerMessage.includes('create') && lowerMessage.includes('workflow')) {
            const name = this.extractWorkflowName(message);
            this.toolCalls.push({
                tool: 'workflow_create',
                args: { name }
            });
            this.panel?.webview.postMessage({
                type: 'tool',
                tool: `Creating workflow "${name}"...`
            });
            return `I've started creating a new workflow called "${name}". What nodes would you like to add?`;
        }

        // Check for node-related requests
        if (lowerMessage.includes('add') && lowerMessage.includes('node')) {
            const nodeType = this.extractNodeType(message);
            const nodeName = this.extractNodeName(message);
            this.toolCalls.push({
                tool: 'workflow_add_node',
                args: { nodeType, nodeName }
            });
            this.panel?.webview.postMessage({
                type: 'tool',
                tool: `Adding ${nodeType} node: ${nodeName}`
            });
            return `I've added a ${nodeType} node called "${nodeName}" to your workflow.`;
        }

        // Help response
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return `I can help you:
- Create new workflows
- Add nodes (HTTP requests, code, conditions, etc.)
- Connect nodes together
- Edit node properties
- Run and test workflows

Just describe what you want to do!`;
        }

        // Default response
        return `I understand you want to "${message}". Describe more details about your workflow, or say "help" to see what I can do.`;
    }

    private extractWorkflowName(message: string): string {
        // Simple extraction - look for quoted strings or common patterns
        const match = message.match(/(?:called|named|for)\s+["']?(\w+)["']?/i);
        return match ? match[1] : 'new-workflow';
    }

    private extractNodeType(message: string): string {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('http') || lowerMessage.includes('request')) {
            return 'action.http';
        }
        if (lowerMessage.includes('code') || lowerMessage.includes('script')) {
            return 'action.code';
        }
        if (lowerMessage.includes('if') || lowerMessage.includes('condition')) {
            return 'logic.if';
        }
        if (lowerMessage.includes('webhook') || lowerMessage.includes('trigger')) {
            return 'trigger.webhook';
        }
        return 'action.custom';
    }

    private extractNodeName(message: string): string {
        const match = message.match(/(?:named|called)\s+["']?(\w+)["']?/i);
        return match ? match[1] : 'New Node';
    }

    getChatHistory(): ChatMessage[] {
        return this.messages;
    }

    clearChat(): void {
        this.messages = [];
        this.toolCalls = [];
    }
}
