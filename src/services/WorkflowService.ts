import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowNode {
    id: string;
    type: string;
    name: string;
    position: { x: number; y: number };
    parameters: Record<string, any>;
}

export interface WorkflowConnection {
    id: string;
    from: string;
    to: string;
    output: string;
    input: string;
}

export interface Workflow {
    name: string;
    version: string;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    settings: Record<string, any>;
}

export class WorkflowService {
    private currentWorkflow: Workflow | null = null;
    private currentFolderPath: string | null = null;
    private workflowFilePath: string | null = null;

    async openWorkflowFolder(folderPath: string): Promise<void> {
        this.currentFolderPath = folderPath;

        // Look for workflow.json or .workflow file
        const workflowFile = path.join(folderPath, 'workflow.json');
        const workflowDir = path.join(folderPath, '.workflow');

        if (fs.existsSync(workflowFile)) {
            this.workflowFilePath = workflowFile;
            await this.loadWorkflow(workflowFile);
        } else if (fs.existsSync(workflowDir)) {
            const mainWorkflow = path.join(workflowDir, 'main.json');
            if (fs.existsSync(mainWorkflow)) {
                this.workflowFilePath = mainWorkflow;
                await this.loadWorkflow(mainWorkflow);
            }
        } else {
            // Create a new workflow
            await this.createNewWorkflow('untitled');
        }
    }

    async loadWorkflow(filePath: string): Promise<void> {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            this.currentWorkflow = JSON.parse(content);
            vscode.window.showInformationMessage(`Loaded workflow: ${this.currentWorkflow?.name}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load workflow: ${error}`);
        }
    }

    async createNewWorkflow(name: string): Promise<void> {
        this.currentWorkflow = {
            name: name,
            version: '1.0',
            nodes: [
                {
                    id: uuidv4(),
                    type: 'trigger.manual',
                    name: 'Manual Trigger',
                    position: { x: 250, y: 100 },
                    parameters: {}
                }
            ],
            connections: [],
            settings: {}
        };

        // Save to current folder or create new folder
        if (this.currentFolderPath) {
            this.workflowFilePath = path.join(this.currentFolderPath, 'workflow.json');
        } else {
            // Create new folder in workspace
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (workspaceFolder) {
                const workflowDir = path.join(workspaceFolder, `${name}.workflow`);
                if (!fs.existsSync(workflowDir)) {
                    fs.mkdirSync(workflowDir, { recursive: true });
                }
                this.workflowFilePath = path.join(workflowDir, 'workflow.json');
            }
        }

        if (this.workflowFilePath) {
            await this.saveWorkflow();
        }

        vscode.window.showInformationMessage(`Created workflow: ${name}`);
    }

    async saveWorkflow(): Promise<void> {
        if (!this.currentWorkflow || !this.workflowFilePath) {
            return;
        }

        try {
            fs.writeFileSync(
                this.workflowFilePath,
                JSON.stringify(this.currentWorkflow, null, 2),
                'utf-8'
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save workflow: ${error}`);
        }
    }

    getCurrentWorkflow(): Workflow | null {
        return this.currentWorkflow;
    }

    addNode(type: string, name: string, position: { x: number; y: number }): WorkflowNode | null {
        if (!this.currentWorkflow) {
            return null;
        }

        const node: WorkflowNode = {
            id: uuidv4(),
            type,
            name,
            position,
            parameters: {}
        };

        this.currentWorkflow.nodes.push(node);
        this.saveWorkflow();
        return node;
    }

    updateNode(nodeId: string, updates: Partial<WorkflowNode>): boolean {
        if (!this.currentWorkflow) {
            return false;
        }

        const nodeIndex = this.currentWorkflow.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) {
            return false;
        }

        this.currentWorkflow.nodes[nodeIndex] = {
            ...this.currentWorkflow.nodes[nodeIndex],
            ...updates
        };
        this.saveWorkflow();
        return true;
    }

    removeNode(nodeId: string): boolean {
        if (!this.currentWorkflow) {
            return false;
        }

        this.currentWorkflow.nodes = this.currentWorkflow.nodes.filter(n => n.id !== nodeId);
        this.currentWorkflow.connections = this.currentWorkflow.connections.filter(
            c => c.from !== nodeId && c.to !== nodeId
        );
        this.saveWorkflow();
        return true;
    }

    addConnection(from: string, to: string, output: string = 'main', input: string = 'main'): WorkflowConnection | null {
        if (!this.currentWorkflow) {
            return null;
        }

        const connection: WorkflowConnection = {
            id: uuidv4(),
            from,
            to,
            output,
            input
        };

        this.currentWorkflow.connections.push(connection);
        this.saveWorkflow();
        return connection;
    }

    removeConnection(connectionId: string): boolean {
        if (!this.currentWorkflow) {
            return false;
        }

        this.currentWorkflow.connections = this.currentWorkflow.connections.filter(
            c => c.id !== connectionId
        );
        this.saveWorkflow();
        return true;
    }
}
