# Setup for Antigravity Environment

Эти команды используются **ТОЛЬКО для локальной разработки в antigravity среде**.
These commands are for **LOCAL DEVELOPMENT in antigravity environment ONLY**.

## Installation Commands

### Agents
```bash
npx claude-code-templates@latest --agent development-team/frontend-developer
npx claude-code-templates@latest --agent development-tools/code-reviewer
npx claude-code-templates@latest --agent development-team/ui-ux-designer
npx claude-code-templates@latest --agent development-team/backend-architect
npx claude-code-templates@latest --agent development-team/fullstack-developer
npx claude-code-templates@latest --agent expert-advisors/architect-review
npx claude-code-templates@latest --agent development-tools/error-detective
npx claude-code-templates@latest --agent development-tools/test-engineer
```

### Skills
```bash
npx claude-code-templates@latest --skill creative-design/frontend-design
npx claude-code-templates@latest --skill development/senior-frontend
npx claude-code-templates@latest --skill development/senior-architect
npx claude-code-templates@latest --skill development/senior-backend
npx claude-code-templates@latest --skill development/code-reviewer
npx claude-code-templates@latest --skill web-development/react-best-practices
npx claude-code-templates@latest --skill creative-design/ui-design-system
npx claude-code-templates@latest --skill development/git-commit-helper
npx claude-code-templates@latest --skill creative-design/canvas-design
npx claude-code-templates@latest --skill development/senior-fullstack
npx claude-code-templates@latest --skill creative-design/ui-ux-pro-max
npx claude-code-templates@latest --skill development/senior-prompt-engineer
```

### Settings
```bash
npx claude-code-templates@latest --setting statusline/context-monitor
npx claude-code-templates@latest --setting global/git-commit-settings
npx claude-code-templates@latest --setting statusline/git-branch-statusline
npx claude-code-templates@latest --setting permissions/allow-git-operations
npx claude-code-templates@latest --setting api/vertex-configuration
npx claude-code-templates@latest --setting statusline/vercel-deployment-monitor
npx claude-code-templates@latest --setting partnerships/glm-coding-plan
```

## Notes
- ⚠️ These are local development tools only
- Do not commit `.env` files to git
- This configuration is specific to antigravity environment
