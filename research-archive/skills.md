# Oh My Opencode - Skills System

## Overview

Skills in Oh My Opencode are specialized workflows defined as markdown templates with YAML frontmatter. They can embed their own MCP (Model Context Protocol) servers, making them self-contained capability bundles that extend agent functionality.

---

## Skills vs Agents: Architectural Distinction

| Aspect | Skills | Agents |
|--------|--------|--------|
| **Purpose** | Specialized workflows, often self-contained | AI entities with specific roles, orchestration |
| **Configuration** | Markdown files with YAML frontmatter | `AgentConfig` objects with model, temperature, permissions |
| **Invocation** | Via `skill` tool or slash commands | Via `@agent` syntax or delegation from Sisyphus |
| **Tool Access** | Can embed own MCP servers dynamically | Predefined tool access based on role |
| **Definition Location** | `SKILL.md` files in skill directories | TypeScript configuration in `src/agents/` |
| **Orchestration** | Triggered by user or orchestrator | `Sisyphus` orchestrates and delegates |
| **Model** | Uses current session model (or specified) | Has dedicated model assignment |
| **Permissions** | Inherits from invoking context | Has own permission configuration |
| **Persistence** | Stateless per invocation | Can maintain context |

### Key Distinction
- **Agents** are AI entities designed for specific task categories (e.g., `oracle` for architecture decisions, `librarian` for documentation lookup)
- **Skills** are specialized workflows that can bring their own MCP servers, making tools automatically available when invoked

---

## Built-in Skills

### playwright

**Purpose**: Browser automation via Playwright MCP

**Use Cases**:
- Web scraping
- Browser testing
- Taking screenshots
- Visual verification
- Information gathering
- All browser interactions

**MCP Configuration**:
```typescript
mcpConfig: {
  playwright: {
    command: "npx",
    args: ["@playwright/mcp@latest"],
  },
}
```

**Disabling**:
```json
{
  "disabled_skills": ["playwright"]
}
```

---

## Built-in Slash Commands

| Command | Description | Arguments |
|---------|-------------|-----------|
| `/init-deep` | Initializes a hierarchical `AGENTS.md` knowledge base | `--create-new`, `--max-depth=N` |
| `/ralph-loop` | Starts a self-referential development loop | task description, completion promise, max iterations |
| `/cancel-ralph` | Cancels any active Ralph Loop | None |
| `/refactor` | Intelligent refactoring using LSP, AST-grep, architecture analysis | `refactoring-target`, `--scope`, `--strategy` |

---

## Skill Invocation

### Via Slash Commands

Skills can be invoked using the `slashcommand` tool:

```
/skill-name <arguments>
```

Examples:
```bash
/commit "Fix authentication bug"
/refactor src/auth.ts --strategy=extract-function
/review --scope=file
```

### Via Skill Tool

The `skill` tool directly invokes skills:

```typescript
// Internal tool invocation
await skill({
  name: "my-skill",
  arguments: "path/to/file.ts"
});
```

### Auto-Detection Hook

When `auto-slash-command` hook is enabled, the system automatically detects and executes slash commands from user prompts starting with `/`.

---

## Skill Discovery Directories

Skills are discovered from multiple locations with defined precedence (highest to lowest):

### Skill Directories

| Scope | Path | Description |
|-------|------|-------------|
| `opencode-project` | `.opencode/skill/` | Project-specific OpenCode skills |
| `project` | `.claude/skills/` | Claude Code project skills |
| `opencode` | `~/.config/opencode/skill/` | User-global OpenCode skills |
| `user` | `~/.claude/skills/` | Claude Code user skills |

### Command Directories

| Scope | Path | Description |
|-------|------|-------------|
| `opencode-project` | `.opencode/command/` | Project-specific OpenCode commands |
| `project` | `.claude/commands/` | Claude Code project commands |
| `opencode` | `~/.config/opencode/command/` | User-global OpenCode commands |
| `user` | `~/.claude/commands/` | Claude Code user commands |

**Note**: Skills from higher-priority directories override those in lower-priority ones.

---

## Creating Custom Skills

### File Structure Options

#### 1. Directory-Based Skills

```
.opencode/skill/
└── my-skill/
    ├── SKILL.md       # Required: Skill definition
    └── mcp.json       # Optional: MCP server configuration
```

#### 2. Direct Markdown Files

```
.opencode/skill/
└── my-skill.md        # Skill definition with frontmatter
```

### Skill Definition Format

Skills are Markdown files with YAML frontmatter:

```markdown
---
name: my-custom-skill
description: This is an example custom skill.
model: anthropic/claude-3-opus-20240229
argument-hint: "<file_path>"
allowed-tools: "read_file write_file"
mcp:
  my-server:
    command: node
    args: ["./server.js"]
---
This skill reads the content of the provided `<file_path>` and summarizes it.
It uses the `read_file` tool to get the content.
```

### SkillMetadata Interface

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Unique identifier for the skill |
| `description` | `string` | Yes | Brief description shown in help |
| `model` | `string` | No | Preferred model for execution |
| `argument-hint` | `string` | No | Usage hint (e.g., `/<name> <required_arg> [optional_arg]`) |
| `agent` | `string` | No | Agent to invoke for this skill |
| `subtask` | `boolean` | No | Whether skill executes as background subtask |
| `license` | `string` | No | License information |
| `compatibility` | `string` | No | Compatibility information |
| `metadata` | `Record<string, string>` | No | Additional key-value metadata |
| `allowed-tools` | `string` | No | Space-separated list of allowed tools |
| `mcp` | `SkillMcpConfig` | No | Embedded MCP server configuration |

---

## Skill Template Wrapping

When skills are loaded, their content is wrapped in a specific template structure:

```typescript
const wrappedTemplate = `<skill-instruction>
Base directory for this skill: ${resolvedPath}/
File references (@path) in this skill are relative to this directory.

${body.trim()}
</skill-instruction>

<user-request>
$ARGUMENTS
</user-request>`
```

### Template Tags

| Tag | Purpose |
|-----|---------|
| `<skill-instruction>` | Encapsulates core logic and instructions |
| `<user-request>` | Placeholder for user-provided arguments (`$ARGUMENTS`) |

### Example Flow

```
User: /analyze src/auth.ts

Template:
<skill-instruction>
Analyze the provided file...
</skill-instruction>

<user-request>
$ARGUMENTS  <-- Becomes: "src/auth.ts"
</user-request>
```

---

## Skill Parameters and Arguments

### Defining Arguments

Use the `argument-hint` field in frontmatter:

```yaml
---
name: refactor
argument-hint: "<refactoring-target> [--scope=file|module|project] [--strategy=safe|aggressive]"
---
```

### Argument Processing

1. Arguments are passed as a single string to the `slashcommand` tool
2. The `$ARGUMENTS` placeholder in the template is replaced with actual arguments
3. Skill's internal logic interprets and processes the arguments

### Example Invocation

```
/refactor src/auth.ts --scope=module --strategy=safe
```

---

## Embedded MCP Servers

Skills can embed their own MCP servers, which become automatically available when the skill is loaded.

### Configuration Methods

#### 1. YAML Frontmatter

```yaml
---
name: browser-skill
mcp:
  playwright:
    command: npx
    args: ["@anthropic-ai/mcp-playwright"]
---
```

#### 2. mcp.json File

Create `mcp.json` in the skill directory:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Or directly:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

**Priority**: `mcp.json` takes precedence over frontmatter configuration.

### ClaudeCodeMcpServer Properties

| Property | Type | Description |
|----------|------|-------------|
| `command` | `string` | Command to run the MCP server |
| `args` | `string[]` | Arguments for the command |
| `env` | `Record<string, string>` | Environment variables |
| `cwd` | `string` | Working directory |
| `url` | `string` | URL for HTTP-based MCP servers |
| `type` | `string` | Server type |
| `disabled` | `boolean` | Whether the server is disabled |

### Using skill_mcp Tool

The `skill_mcp` tool invokes embedded MCP operations:

```typescript
await skill_mcp({
  mcp_name: "playwright",
  tool_name: "browser_navigate",
  arguments: JSON.stringify({ url: "https://example.com" })
});
```

**Parameters**:
- `mcp_name`: Name of the MCP server
- `tool_name`, `resource_name`, or `prompt_name`: Operation type (only one)
- `arguments`: JSON string of arguments
- `grep`: Optional regex pattern to filter output

---

## Configuration in oh-my-opencode.json

### Configuration File Locations (Precedence Order)

1. `.opencode/oh-my-opencode.json` (project-specific)
2. `~/.config/opencode/oh-my-opencode.json` (user-specific)
3. Default values (built into plugin)

### Disabling Skills

```json
{
  "disabled_skills": ["playwright"]
}
```

### Skills Configuration Schema

#### Simple Array Format

```json
{
  "disabled_skills": ["playwright", "custom-skill"]
}
```

#### Object Configuration Format

```json
{
  "skills": {
    "my-skill": {
      "description": "My custom skill",
      "template": "Do something with $ARGUMENTS",
      "model": "anthropic/claude-sonnet-4-5",
      "agent": "oracle",
      "subtask": false,
      "argument-hint": "<input>",
      "allowed-tools": ["read_file", "write_file"],
      "disable": false
    },
    "sources": [
      "~/.my-custom-skills/",
      {
        "path": "./team-skills/",
        "recursive": true,
        "glob": "*.md"
      }
    ],
    "enable": ["skill-a", "skill-b"],
    "disable": ["skill-c"]
  }
}
```

### Full Skills Configuration Schema

```json
{
  "skills": {
    "anyOf": [
      {
        "type": "array",
        "items": { "type": "string" }
      },
      {
        "type": "object",
        "properties": {
          "sources": {
            "type": "array",
            "items": {
              "anyOf": [
                { "type": "string" },
                {
                  "type": "object",
                  "properties": {
                    "path": { "type": "string" },
                    "recursive": { "type": "boolean" },
                    "glob": { "type": "string" }
                  },
                  "required": ["path"]
                }
              ]
            }
          },
          "enable": { "type": "array", "items": { "type": "string" } },
          "disable": { "type": "array", "items": { "type": "string" } }
        },
        "additionalProperties": {
          "anyOf": [
            { "type": "boolean" },
            {
              "type": "object",
              "properties": {
                "description": { "type": "string" },
                "template": { "type": "string" },
                "from": { "type": "string" },
                "model": { "type": "string" },
                "agent": { "type": "string" },
                "subtask": { "type": "boolean" },
                "argument-hint": { "type": "string" },
                "license": { "type": "string" },
                "compatibility": { "type": "string" },
                "metadata": { "type": "object" },
                "allowed-tools": { "type": "array", "items": { "type": "string" } },
                "disable": { "type": "boolean" }
              }
            }
          ]
        }
      }
    ]
  }
}
```

### Skill Schema Validation

The `SkillsConfigSchema` in `src/config/schema.ts` defines validation:

```typescript
const SkillEntrySchema = z.union([
  z.boolean(),
  SkillDefinitionSchema
]);

const SkillDefinitionSchema = z.object({
  description: z.string().optional(),
  template: z.string(),
  model: z.string().optional(),
  agent: z.string().optional(),
  subtask: z.boolean().optional(),
  'argument-hint': z.string().optional(),
  license: z.string().optional(),
  compatibility: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  'allowed-tools': z.string().optional(),
  disable: z.boolean().optional()
});
```

---

## Claude Code Compatibility

Oh My Opencode provides full compatibility with Claude Code skills and configuration.

### Supported Claude Code Directories

| Type | Path |
|------|------|
| User skills | `~/.claude/skills/` |
| Project skills | `./.claude/skills/` |
| User commands | `~/.claude/commands/` |
| Project commands | `./.claude/commands/` |

### Disabling Claude Code Compatibility

```json
{
  "claude_code": {
    "skills": false
  }
}
```

### Migration Path

Existing Claude Code skills work seamlessly:

1. Place `SKILL.md` files in `~/.claude/skills/` or `./.claude/skills/`
2. Oh My Opencode automatically discovers and loads them
3. Skills are converted to `CommandDefinition` objects internally

```bash
# Claude Code location
~/.claude/skills/my-skill/SKILL.md

# Works automatically in Oh My Opencode
# No changes needed
```

---

## Skill Integration with Orchestration

### Sisyphus Agent Integration

The `Sisyphus` orchestrator agent is instructed to:

1. **Check Skills FIRST (BLOCKING)**: Before any other action
2. **INVOKE skill tool IMMEDIATELY**: If request matches a skill trigger

### Skill Loading Flow

```
Plugin Init
    |
createBuiltinSkills() --> Built-in skills (e.g., playwright)
    |
discoverUserClaudeSkills() --> ~/.claude/skills/
    |
discoverProjectClaudeSkills() --> ./.claude/skills/
    |
discoverOpencodeGlobalSkills() --> ~/.config/opencode/skill/
    |
discoverOpencodeProjectSkills() --> ./.opencode/skill/
    |
mergeSkills() --> Combine all with precedence
    |
createSkillTool() --> Register skill tool
```

### LoadedSkill Interface

```typescript
interface LoadedSkill {
  name: string;
  path: string;                    // Path to SKILL.md
  resolvedPath: string;            // Resolved directory path
  definition: CommandDefinition;   // name, description, template, etc.
  scope: SkillScope;               // "builtin" | "user" | "project" | etc.
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string[];
  mcpConfig?: SkillMcpConfig;      // Embedded MCP servers
  lazyContent?: LazyContentLoader; // Deferred content loading
}
```

---

## Complete Skill Example

### Directory Structure

```
.opencode/skill/api-tester/
├── SKILL.md
└── mcp.json
```

### SKILL.md

```markdown
---
name: api-tester
description: Test API endpoints with automated validation
model: anthropic/claude-sonnet-4-5
argument-hint: "<endpoint_url> [--method=GET|POST|PUT|DELETE] [--body=<json>]"
allowed-tools: "fetch write_file"
---
# API Testing Skill

This skill tests the specified API endpoint and generates a report.

## Instructions

1. Parse the endpoint URL and options from arguments
2. Make the API request using the specified method
3. Validate the response status and structure
4. Generate a test report with results

## Execution

When invoked:
1. Parse `$ARGUMENTS` for URL, method, and body
2. Execute the API call
3. Log response details
4. Create report in `./api-test-results/`
```

### mcp.json

```json
{
  "mcpServers": {
    "http-client": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-http-client"]
    }
  }
}
```

### Invocation

```
/api-tester https://api.example.com/users --method=GET
```

---

## Built-in Agents Reference

While not skills, these agents work alongside the skill system:

| Agent | Model | Purpose |
|-------|-------|---------|
| `Sisyphus` | `anthropic/claude-opus-4-5` | Primary orchestrator |
| `oracle` | `openai/gpt-5.2` | Architecture decisions, code review |
| `librarian` | `anthropic/claude-sonnet-4-5` | Multi-repo analysis, documentation |
| `explore` | `opencode/grok-code` | Fast codebase exploration |
| `frontend-ui-ux-engineer` | `google/gemini-3-pro-preview` | Visual design, UI/UX |
| `document-writer` | `google/gemini-3-pro-preview` | Technical writing |
| `multimodal-looker` | `google/gemini-3-flash` | Visual content interpretation |

---

## Best Practices

### Skill Design

1. **Single Responsibility**: Each skill should do one thing well
2. **Clear Arguments**: Use descriptive `argument-hint` values
3. **Self-Contained**: Embed MCP servers when needed for portability
4. **Documentation**: Include clear instructions in the skill body

### Naming Conventions

- Use kebab-case: `my-skill-name`
- Be descriptive: `analyze-typescript-imports`

### Argument Hints

- Use `<required>` for required arguments
- Use `[optional]` for optional arguments
- Provide clear examples: `<file_path> [--format=json]`

### Tool Restrictions

- Only allow tools the skill actually needs
- Prefer restrictive over permissive

### Organization

1. **Scope Appropriately**: Use project skills for project-specific workflows
2. **User Skills for Personal**: Global workflows in `~/.config/opencode/skill/`
3. **Avoid Conflicts**: Check for naming conflicts across scopes

### Performance

1. **Lazy Loading**: Skills use lazy content loading to minimize memory
2. **Disable Unused**: Use `disabled_skills` for skills not needed
3. **MCP Lifecycle**: `SkillMcpManager` handles connection reuse and cleanup

---

## Summary

The Oh My Opencode skills system provides:

- **Flexible Skill Definition**: Markdown files with YAML frontmatter
- **Multiple Discovery Paths**: Project, user, and Claude Code compatible directories
- **Embedded MCP Support**: Skills can bring their own tool servers
- **Orchestration Integration**: Sisyphus checks skills first before delegation
- **Full Configuration Control**: Enable, disable, and customize via `oh-my-opencode.json`
- **Claude Code Compatibility**: Seamless migration from existing Claude Code setups

Skills bridge the gap between simple slash commands and full agent capabilities, providing reusable, portable, and self-contained workflow automation.

---

## Sources

- [GitHub - code-yeongyu/oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [DeepWiki - Slash Commands and Skills](https://deepwiki.com/code-yeongyu/oh-my-opencode#5.6)
- [DeepWiki - Overview](https://deepwiki.com/code-yeongyu/oh-my-opencode#1)
- [DeepWiki - Agent System](https://deepwiki.com/code-yeongyu/oh-my-opencode#4)
- [DeepWiki - Getting Started](https://deepwiki.com/code-yeongyu/oh-my-opencode#2)
