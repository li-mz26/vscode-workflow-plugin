# VSCode Workflow Plugin - 工作流可视化编排插件

## 1. Project Overview

**Project Name**: vscode-workflow-plugin

**Project Type**: VSCode Extension (Visual Studio Code Plugin)

**Core Feature Summary**: 一个类似n8n的VSCode工作流可视化编排插件，支持打开工作流文件夹、可视化编辑工作流、提供MCP服务启动能力和内置AI对话式工作流编排agent。

**Target Users**:
- 开发者需要可视化编排自动化工作流
- 需要在VSCode中创建、编辑和管理工作流的用户
- 希望使用AI辅助创建工作流的开发者

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Multi-Panel Architecture**:
1. **Main Editor Panel** - 工作流可视化画布（核心）
2. **Sidebar Panel** - 节点库和属性面板
3. **Agent Chat Panel** - AI对话面板（右侧或底部）
4. **Activity Bar** - 插件图标入口

**VSCode Layout Integration**:
- 使用Webview作为主工作流编辑器
- 侧边栏用于节点选择和属性配置
- 底部面板用于Agent对话

### 2.2 Visual Design

**Color Palette**:
- Primary: `#6366F1` (Indigo-500) - 主色调
- Secondary: `#8B5CF6` (Violet-500) - 次要色
- Accent: `#10B981` (Emerald-500) - 强调色
- Background: `#1E1E2E` (Dark) / `#FAFAFA` (Light)
- Surface: `#2D2D3F` (Dark) / `#FFFFFF` (Light)
- Text Primary: `#F8FAFC` (Dark) / `#1E293B` (Light)
- Text Secondary: `#94A3B8` (Dark) / `#64748B` (Light)
- Border: `#3D3D5C` (Dark) / `#E2E8F0` (Light)
- Error: `#EF4444` (Red-500)
- Success: `#22C55E` (Green-500)
- Warning: `#F59E0B` (Amber-500)

**Typography**:
- Font Family: `'JetBrains Mono', 'Fira Code', monospace` (code), `'Inter', system-ui, sans-serif` (UI)
- Heading Large: 24px, weight 600
- Heading Medium: 18px, weight 600
- Body: 14px, weight 400
- Small: 12px, weight 400

**Spacing System**:
- Base unit: 4px
- XS: 4px, S: 8px, M: 16px, L: 24px, XL: 32px

**Visual Effects**:
- Node shadow: `0 4px 12px rgba(0,0,0,0.15)`
- Panel shadow: `0 8px 24px rgba(0,0,0,0.2)`
- Border radius: 8px (panels), 6px (nodes), 4px (buttons)
- Transitions: 200ms ease-out
- Connection line: bezier curves with animated flow

### 2.3 Components

**Workflow Canvas**:
- 无限画布，支持缩放和平移
- 网格背景（可切换）
- 节点可拖拽、连线
- 选中状态高亮（边框+发光）

**Node Types**:
- Trigger Nodes (触发器): 圆形图标，绿色边框
- Action Nodes (动作): 矩形，蓝色边框
- Logic Nodes (逻辑): 菱形，黄色边框
- AI Nodes: 紫色边框带AI图标
- HTTP Request Nodes: 橙色边框

**Node States**:
- Default: 正常显示
- Hover: 轻微放大 (scale 1.02)
- Selected: 边框高亮+阴影增强
- Running: 脉冲动画
- Error: 红色边框+错误图标
- Disabled: 透明度50%

**Sidebar Panels**:
- Nodes Library: 可搜索的节点分类列表
- Properties Panel: 选中节点的配置表单
- Variables Panel: 工作流变量查看

**Agent Chat Panel**:
- 消息列表（用户/AI分开样式）
- 输入框+发送按钮
- 工具调用显示区域

---

## 3. Functional Specification

### 3.1 Core Features

#### F1: 工作流文件夹识别与打开
- 识别包含 `workflow.json` 或 `.workflow` 目录的文件夹
- 在VSCode中通过"打开工作流"命令或活动栏图标打开
- 自动解析工作流文件结构

#### F2: 工作流可视化编辑器
- 基于Webview的拖拽式可视化编辑器
- 支持节点拖放、连线、删除
- 支持节点属性配置面板
- 支持缩放、平移、网格对齐
- 撤销/重做支持
- 自动保存工作流

#### F3: 工作流节点库
- **Trigger Nodes**:
  - Webhook Trigger
  - Schedule Trigger (Cron)
  - Manual Trigger
  - Event Trigger (文件变化等)
- **Action Nodes**:
  - HTTP Request
  - Execute Code (JavaScript/Python)
  - Send Email
  - Write File
  - Database Operations
- **Logic Nodes**:
  - IF Condition
  - Switch
  - Loop
  - Wait
- **AI Nodes**:
  - Claude AI Call
  - Custom LLM Call

#### F4: MCP服务集成
- 启动本地MCP服务
- 配置MCP服务器端点
- 支持MCP工具调用
- 工作流中使用MCP工具节点

#### F5: AI工作流编排Agent
- 基于Claude Code的对话式AI助手
- 可理解自然语言创建工作流
- 调用插件工具API完成操作
- 提供工作流建议和优化

#### F6: Agent对话面板
- 侧边对话面板
- 展示AI响应和工具调用
- 支持上下文对话
- 可切换AI模型

### 3.2 User Interactions and Flows

**Flow 1: 打开现有工作流**
1. 用户点击活动栏图标或命令面板
2. 选择工作流文件夹
3. 工作流在可视化编辑器中打开
4. 用户可编辑或运行

**Flow 2: 创建新工作流**
1. 用户点击"新建工作流"
2. 输入工作流名称
3. 选择起始节点类型
4. 进入可视化编辑模式

**Flow 3: 使用AI创建工作流**
1. 打开Agent对话面板
2. 描述想要的工作流
3. AI解析意图并调用工具
4. 生成工作流并展示

### 3.3 Data Flow & Processing

**Key Modules**:

```
├── src/
│   ├── extension.ts           # 插件入口
│   ├── commands/              # VSCode命令
│   ├── views/
│   │   ├── WorkflowEditor/   # Webview可视化编辑器
│   │   ├── AgentChat/        # AI对话面板
│   │   └── NodeProperties/   # 属性面板
│   ├── services/
│   │   ├── WorkflowService   # 工作流解析/保存
│   │   ├── MCPServerService  # MCP服务管理
│   │   └── AgentService      # AI Agent服务
│   ├── nodes/                # 节点定义
│   └── utils/
```

**Workflow Data Format**:
```json
{
  "name": "workflow-name",
  "version": "1.0",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger/webhook",
      "position": {"x": 100, "y": 200},
      "parameters": {}
    }
  ],
  "connections": [
    {
      "from": "node-1",
      "to": "node-2",
      "output": "main",
      "input": "main"
    }
  ],
  "settings": {}
}
```

### 3.4 Edge Cases

- 空工作流文件夹处理
- 工作流文件格式错误提示
- 节点循环引用检测
- 网络请求超时处理
- AI响应超时处理
- 大型工作流性能优化

---

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] VSCode活动栏显示插件图标
- [ ] 工作流编辑器Webview正常加载
- [ ] 节点可拖拽到画布并连线
- [ ] 节点属性面板正确显示
- [ ] Agent对话面板可交互
- [ ] 暗色/亮色主题正确应用

### Functional Checkpoints
- [ ] 可打开包含workflow.json的文件夹
- [ ] 工作流自动保存到文件
- [ ] 可添加/删除/编辑节点
- [ ] 节点可正确连线
- [ ] MCP服务可启动和配置
- [ ] AI Agent可对话并生成工作流

### Technical Checkpoints
- [ ] 插件可正常安装和卸载
- [ ] Webview与扩展正常通信
- [ ] 文件系统操作正常
- [ ] 无内存泄漏
- [ ] 错误正确捕获和显示
