import * as vscode from 'vscode';

interface NodeCategory {
    label: string;
    children: NodeItem[];
}

interface NodeItem {
    label: string;
    type: string;
    description: string;
    icon: string;
}

export class NodeLibraryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private categories: NodeCategory[] = [
        {
            label: 'Triggers',
            children: [
                { label: 'Webhook', type: 'trigger.webhook', description: 'Receive HTTP requests', icon: 'webhook' },
                { label: 'Schedule', type: 'trigger.schedule', description: 'Run on schedule', icon: 'clock' },
                { label: 'Manual', type: 'trigger.manual', description: 'Start manually', icon: 'play' },
                { label: 'Event', type: 'trigger.event', description: 'React to events', icon: 'event' }
            ]
        },
        {
            label: 'Actions',
            children: [
                { label: 'HTTP Request', type: 'action.http', description: 'Make HTTP calls', icon: 'http' },
                { label: 'Code', type: 'action.code', description: 'Run JavaScript', icon: 'code' },
                { label: 'Send Email', type: 'action.email', description: 'Send email', icon: 'mail' },
                { label: 'Write File', type: 'action.file', description: 'Write to file', icon: 'file' }
            ]
        },
        {
            label: 'Logic',
            children: [
                { label: 'IF', type: 'logic.if', description: 'Conditional branch', icon: 'split' },
                { label: 'Switch', type: 'logic.switch', description: 'Multi-way branch', icon: 'branch' },
                { label: 'Loop', type: 'logic.loop', description: 'Loop over items', icon: 'repeat' },
                { label: 'Wait', type: 'logic.wait', description: 'Wait for duration', icon: 'wait' }
            ]
        },
        {
            label: 'AI',
            children: [
                { label: 'Claude', type: 'ai.claude', description: 'Call Claude API', icon: 'bot' },
                { label: 'LLM', type: 'ai.llm', description: 'Call custom LLM', icon: 'hubot' }
            ]
        }
    ];

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
        if (!element) {
            return this.categories.map(cat => {
                const item = new vscode.TreeItem(cat.label, vscode.TreeItemCollapsibleState.Collapsed);
                item.contextValue = 'category';
                return item;
            });
        }

        if (element.contextValue === 'category') {
            const category = this.categories.find(c => c.label === element.label);
            if (category) {
                return category.children.map(node => {
                    const item = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.None);
                    item.description = node.description;
                    item.contextValue = 'node';
                    item.command = {
                        command: 'workflow.addNode',
                        title: 'Add Node',
                        arguments: [node.type, node.label]
                    };
                    return item;
                });
            }
        }

        return [];
    }
}
