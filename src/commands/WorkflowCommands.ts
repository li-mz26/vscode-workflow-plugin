import * as vscode from 'vscode';
import { WorkflowService } from '../services/WorkflowService';
import { MCPServerService } from '../services/MCPServerService';
import { AgentService } from '../services/AgentService';

export class WorkflowCommands {
    constructor(
        private workflowService: WorkflowService,
        private mcpService: MCPServerService,
        private agentService: AgentService
    ) {}

    register(context: vscode.ExtensionContext) {
        // Open workflow folder
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.open', async () => {
                const folder = await vscode.window.showOpenDialog({
                    canSelectFolders: true,
                    canSelectFiles: false,
                    openLabel: 'Select Workflow Folder'
                });

                if (folder && folder[0]) {
                    await this.workflowService.openWorkflowFolder(folder[0].fsPath);
                }
            })
        );

        // Create new workflow
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.create', async () => {
                const name = await vscode.window.showInputBox({
                    prompt: 'Enter workflow name',
                    placeHolder: 'my-workflow'
                });

                if (name) {
                    await this.workflowService.createNewWorkflow(name);
                }
            })
        );

        // Run workflow
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.run', async () => {
                await vscode.window.showInformationMessage('Running workflow...');
            })
        );

        // Stop workflow
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.stop', async () => {
                await vscode.window.showInformationMessage('Workflow stopped');
            })
        );

        // Start MCP server
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.startMCP', async () => {
                const port = await vscode.window.showInputBox({
                    prompt: 'Enter MCP server port',
                    placeHolder: '3000',
                    value: '3000'
                });

                if (port) {
                    await this.mcpService.startServer(parseInt(port));
                    vscode.window.showInformationMessage(`MCP server started on port ${port}`);
                }
            })
        );

        // Stop MCP server
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.stopMCP', async () => {
                await this.mcpService.stopAll();
                vscode.window.showInformationMessage('MCP server stopped');
            })
        );

        // Open agent chat
        context.subscriptions.push(
            vscode.commands.registerCommand('workflow.agentChat', async () => {
                this.agentService.showAgentPanel();
            })
        );
    }
}
