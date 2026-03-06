import * as vscode from 'vscode';
import { WorkflowService } from '../../services/WorkflowService';

export class WorkflowExplorerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private workflowService: WorkflowService;

    constructor(workflowService: WorkflowService) {
        this.workflowService = workflowService;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
        const workflow = this.workflowService.getCurrentWorkflow();

        if (!workflow) {
            const emptyItem = new vscode.TreeItem('No workflow open', vscode.TreeItemCollapsibleState.None);
            emptyItem.description = 'Use "Open Workflow Folder" to start';
            return [emptyItem];
        }

        if (!element) {
            // Root level - show workflow info
            const rootItems: vscode.TreeItem[] = [];

            const workflowItem = new vscode.TreeItem(workflow.name, vscode.TreeItemCollapsibleState.Expanded);
            workflowItem.description = `v${workflow.version}`;
            workflowItem.iconPath = new vscode.ThemeIcon('workflow');
            rootItems.push(workflowItem);

            return rootItems;
        }

        if (element.label === workflow.name) {
            // Show nodes and connections
            const items: vscode.TreeItem[] = [];

            // Nodes section
            const nodesHeader = new vscode.TreeItem('Nodes', vscode.TreeItemCollapsibleState.Collapsed);
            nodesHeader.contextValue = 'nodes-section';
            items.push(nodesHeader);

            return items;
        }

        if (element.contextValue === 'nodes-section' && workflow) {
            return workflow.nodes.map(node => {
                const item = new vscode.TreeItem(node.name, vscode.TreeItemCollapsibleState.None);
                item.description = node.type;
                item.iconPath = new vscode.ThemeIcon('circle-filled');
                item.command = {
                    command: 'workflow.selectNode',
                    title: 'Select Node',
                    arguments: [node.id]
                };
                return item;
            });
        }

        return [];
    }

    refresh(): void {
        // Trigger tree view refresh
    }
}
