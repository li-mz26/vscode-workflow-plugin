import * as vscode from 'vscode';
import * as net from 'net';

interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}

interface MCPServer {
    port: number;
    running: boolean;
    tools: MCPTool[];
}

export class MCPServerService {
    private servers: Map<number, MCPServer> = new Map();

    constructor() {
        // Register default workflow tools
        this.registerDefaultTools();
    }

    private registerDefaultTools() {
        // Default MCP tools will be available
    }

    async startServer(port: number): Promise<boolean> {
        if (this.servers.has(port) && this.servers.get(port)?.running) {
            vscode.window.showWarningMessage(`MCP server already running on port ${port}`);
            return false;
        }

        return new Promise((resolve) => {
            const server = net.createServer((socket) => {
                console.log('MCP client connected');

                socket.on('data', async (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        const response = await this.handleMCPMessage(message);
                        socket.write(JSON.stringify(response));
                    } catch (error) {
                        socket.write(JSON.stringify({ error: 'Invalid message format' }));
                    }
                });

                socket.on('error', (err) => {
                    console.error('Socket error:', err);
                });
            });

            server.listen(port, () => {
                this.servers.set(port, {
                    port,
                    running: true,
                    tools: this.getDefaultTools()
                });
                vscode.window.showInformationMessage(`MCP server started on port ${port}`);
                resolve(true);
            });

            server.on('error', (err) => {
                vscode.window.showErrorMessage(`Failed to start MCP server: ${err.message}`);
                resolve(false);
            });
        });
    }

    async stopServer(port: number): Promise<boolean> {
        const server = this.servers.get(port);
        if (!server) {
            return false;
        }

        this.servers.delete(port);
        vscode.window.showInformationMessage(`MCP server stopped on port ${port}`);
        return true;
    }

    async stopAll(): Promise<void> {
        for (const port of this.servers.keys()) {
            await this.stopServer(port);
        }
    }

    getRunningServers(): number[] {
        return Array.from(this.servers.keys());
    }

    getTools(port: number): MCPTool[] {
        return this.servers.get(port)?.tools || [];
    }

    private getDefaultTools(): MCPTool[] {
        return [
            {
                name: 'workflow_create',
                description: 'Create a new workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Workflow name' }
                    },
                    required: ['name']
                }
            },
            {
                name: 'workflow_add_node',
                description: 'Add a node to the workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeType: { type: 'string', description: 'Node type' },
                        nodeName: { type: 'string', description: 'Node name' },
                        position: {
                            type: 'object',
                            properties: {
                                x: { type: 'number' },
                                y: { type: 'number' }
                            }
                        }
                    },
                    required: ['nodeType', 'nodeName']
                }
            },
            {
                name: 'workflow_connect_nodes',
                description: 'Connect two nodes in the workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fromNodeId: { type: 'string', description: 'Source node ID' },
                        toNodeId: { type: 'string', description: 'Target node ID' }
                    },
                    required: ['fromNodeId', 'toNodeId']
                }
            },
            {
                name: 'workflow_update_node',
                description: 'Update node parameters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string', description: 'Node ID' },
                        parameters: { type: 'object', description: 'Node parameters' }
                    },
                    required: ['nodeId', 'parameters']
                }
            },
            {
                name: 'workflow_delete_node',
                description: 'Delete a node from the workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string', description: 'Node ID to delete' }
                    },
                    required: ['nodeId']
                }
            },
            {
                name: 'workflow_get',
                description: 'Get current workflow data',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'workflow_save',
                description: 'Save current workflow',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'workflow_run',
                description: 'Run the current workflow',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string', description: 'Start from specific node (optional)' }
                    },
                    required: []
                }
            }
        ];
    }

    private async handleMCPMessage(message: any): Promise<any> {
        const { method, params, id } = message;

        switch (method) {
            case 'tools/list':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        tools: this.getDefaultTools()
                    }
                };

            case 'tools/call':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({ success: true, message: 'Tool executed' })
                            }
                        ]
                    }
                };

            default:
                return {
                    jsonrpc: '2.0',
                    id,
                    error: {
                        code: -32601,
                        message: 'Method not found'
                    }
                };
        }
    }
}
