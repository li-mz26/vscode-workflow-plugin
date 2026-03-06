// node definitions
export interface NodeDefinition {
    type: string;
    name: string;
    description: string;
    icon: string;
    category: 'trigger' | 'action' | 'logic' | 'ai';
    inputs: string[];
    outputs: string[];
    parameters: ParameterDefinition[];
}

export interface ParameterDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    label: string;
    description?: string;
    required?: boolean;
    default?: any;
    options?: { label: string; value: any }[];
}

export const nodeDefinitions: NodeDefinition[] = [
    // Triggers
    {
        type: 'trigger.webhook',
        name: 'Webhook',
        description: 'Receive HTTP requests',
        icon: '🪝',
        category: 'trigger',
        inputs: [],
        outputs: ['main'],
        parameters: [
            { name: 'method', type: 'string', label: 'Method', options: [
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' }
            ]},
            { name: 'path', type: 'string', label: 'Path', default: '/webhook' }
        ]
    },
    {
        type: 'trigger.schedule',
        name: 'Schedule',
        description: 'Run on schedule',
        icon: '⏰',
        category: 'trigger',
        inputs: [],
        outputs: ['main'],
        parameters: [
            { name: 'cron', type: 'string', label: 'Cron Expression', default: '0 * * * *' }
        ]
    },
    {
        type: 'trigger.manual',
        name: 'Manual Trigger',
        description: 'Start manually',
        icon: '▶️',
        category: 'trigger',
        inputs: [],
        outputs: ['main'],
        parameters: []
    },
    {
        type: 'trigger.event',
        name: 'Event Trigger',
        description: 'React to events',
        icon: '⚡',
        category: 'trigger',
        inputs: [],
        outputs: ['main'],
        parameters: [
            { name: 'eventType', type: 'string', label: 'Event Type', options: [
                { label: 'File Changed', value: 'file-changed' },
                { label: 'Git Push', value: 'git-push' },
                { label: 'Custom', value: 'custom' }
            ]}
        ]
    },
    // Actions
    {
        type: 'action.http',
        name: 'HTTP Request',
        description: 'Make HTTP calls',
        icon: '📡',
        category: 'action',
        inputs: ['main'],
        outputs: ['main', 'error'],
        parameters: [
            { name: 'url', type: 'string', label: 'URL', required: true },
            { name: 'method', type: 'string', label: 'Method', default: 'GET', options: [
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' }
            ]},
            { name: 'headers', type: 'object', label: 'Headers' },
            { name: 'body', type: 'object', label: 'Body' }
        ]
    },
    {
        type: 'action.code',
        name: 'Code',
        description: 'Run JavaScript',
        icon: '💻',
        category: 'action',
        inputs: ['main'],
        outputs: ['main'],
        parameters: [
            { name: 'code', type: 'string', label: 'Code', description: 'JavaScript code to execute' }
        ]
    },
    {
        type: 'action.email',
        name: 'Send Email',
        description: 'Send email',
        icon: '📧',
        category: 'action',
        inputs: ['main'],
        outputs: ['main'],
        parameters: [
            { name: 'to', type: 'string', label: 'To', required: true },
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'body', type: 'string', label: 'Body' }
        ]
    },
    {
        type: 'action.file',
        name: 'Write File',
        description: 'Write to file',
        icon: '📁',
        category: 'action',
        inputs: ['main'],
        outputs: ['main'],
        parameters: [
            { name: 'path', type: 'string', label: 'File Path', required: true },
            { name: 'content', type: 'string', label: 'Content' }
        ]
    },
    // Logic
    {
        type: 'logic.if',
        name: 'IF',
        description: 'Conditional branch',
        icon: '🔀',
        category: 'logic',
        inputs: ['main'],
        outputs: ['true', 'false'],
        parameters: [
            { name: 'condition', type: 'string', label: 'Condition', description: 'JavaScript expression' }
        ]
    },
    {
        type: 'logic.switch',
        name: 'Switch',
        description: 'Multi-way branch',
        icon: '🔃',
        category: 'logic',
        inputs: ['main'],
        outputs: ['case1', 'case2', 'default'],
        parameters: [
            { name: 'expression', type: 'string', label: 'Expression' }
        ]
    },
    {
        type: 'logic.loop',
        name: 'Loop',
        description: 'Loop over items',
        icon: '🔁',
        category: 'logic',
        inputs: ['main'],
        outputs: ['loop', 'done'],
        parameters: [
            { name: 'items', type: 'string', label: 'Items', description: 'Array to iterate' }
        ]
    },
    {
        type: 'logic.wait',
        name: 'Wait',
        description: 'Wait for duration',
        icon: '⏳',
        category: 'logic',
        inputs: ['main'],
        outputs: ['main'],
        parameters: [
            { name: 'duration', type: 'number', label: 'Duration (ms)', default: 1000 }
        ]
    },
    // AI
    {
        type: 'ai.claude',
        name: 'Claude AI',
        description: 'Call Claude API',
        icon: '🤖',
        category: 'ai',
        inputs: ['main'],
        outputs: ['main'],
        parameters: [
            { name: 'model', type: 'string', label: 'Model', default: 'claude-3-5-sonnet-20241022', options: [
                { label: 'Claude Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { label: 'Claude Haiku', value: 'claude-3-haiku-20240307' }
            ]},
            { name: 'prompt', type: 'string', label: 'Prompt', description: 'System prompt' },
            { name: 'temperature', type: 'number', label: 'Temperature', default: 0.7 }
        ]
    },
    {
        type: 'ai.llm',
        name: 'Custom LLM',
        description: 'Call custom LLM',
        icon: '🧠',
        category: 'ai',
        inputs: ['main'],
        outputs: ['main'],
        parameters: [
            { name: 'endpoint', type: 'string', label: 'API Endpoint', required: true },
            { name: 'model', type: 'string', label: 'Model' },
            { name: 'prompt', type: 'string', label: 'Prompt' }
        ]
    }
];

export function getNodeDefinition(type: string): NodeDefinition | undefined {
    return nodeDefinitions.find(n => n.type === type);
}

export function getNodesByCategory(category: string): NodeDefinition[] {
    return nodeDefinitions.filter(n => n.category === category);
}
