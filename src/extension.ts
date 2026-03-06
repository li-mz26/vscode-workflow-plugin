import * as vscode from 'vscode';
import { WorkflowCommands } from './commands/WorkflowCommands';
import { WorkflowService } from './services/WorkflowService';
import { MCPServerService } from './services/MCPServerService';
import { AgentService } from './services/AgentService';
import { NodeLibraryProvider } from './views/NodeProperties/NodeLibraryProvider';
import { WorkflowExplorerProvider } from './views/NodeProperties/WorkflowExplorerProvider';

let workflowService: WorkflowService;
let mcpService: MCPServerService;
let agentService: AgentService;

export function activate(context: vscode.ExtensionContext) {
    console.log('VSCode Workflow Plugin activating...');

    // Initialize services
    workflowService = new WorkflowService();
    mcpService = new MCPServerService();
    agentService = new AgentService(context);

    // Register commands
    const commands = new WorkflowCommands(workflowService, mcpService, agentService);
    commands.register(context);

    // Register tree view providers
    const nodeLibraryProvider = new NodeLibraryProvider();
    const workflowExplorerProvider = new WorkflowExplorerProvider(workflowService);

    vscode.window.registerTreeDataProvider('node-library', nodeLibraryProvider);
    vscode.window.registerTreeDataProvider('workflow-explorer', workflowExplorerProvider);

    // Register Webview providers
    agentService.registerAgentPanel(context);

    console.log('VSCode Workflow Plugin activated');
}

export function deactivate() {
    console.log('VSCode Workflow Plugin deactivated');
    mcpService?.stopAll();
}
