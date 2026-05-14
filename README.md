# QW Design System

A design system and React component library for building modern web applications.

QW provides accessible, design-system-compliant UI components built on [Base UI](https://base-ui.com/). It handles keyboard navigation, focus management, and ARIA attributes so you can build accessible applications without thinking through every detail.

<img width="2560" height="1456" alt="image" src="https://github.com/user-attachments/assets/032f5a0e-b686-4440-b1ca-6182379479aa" />

## Installation

```bash
pnpm add @qw/design-system
```

### Peer Dependencies

```bash
pnpm add react react-dom @phosphor-icons/react
```

## Usage

```tsx
import { Button, Input, Dialog } from "@qw/design-system";
import "@qw/design-system/styles";
```

### Granular Imports (Tree-Shaking)

```tsx
import { Button } from "@qw/design-system/components/button";
```

### Base UI Primitives

QW re-exports all Base UI primitives for advanced use cases:

```tsx
import { Popover } from "@qw/design-system/primitives/popover";
```

## CLI

Query component documentation from the command line:

```bash
npx @qw/design-system ls          # List all components
npx @qw/design-system doc Button  # Get component docs
npx @qw/design-system docs        # Get all docs
```

## Development

See [AGENTS.md](./AGENTS.md) for comprehensive development documentation including:

- Component patterns and styling system
- Semantic color tokens
- Development workflows
- CI/CD pipeline
- Figma plugin

### Quick Start

```bash
pnpm install
pnpm dev                    # Start docs site at localhost:4321
pnpm --filter @qw/design-system test
```

### Figma Plugin

```bash
# Optional: enable token sync during build
# cp packages/qw-figma/scripts/.env.example packages/qw-figma/scripts/.env
# $EDITOR packages/qw-figma/scripts/.env  # set FIGMA_TOKEN (and optionally FIGMA_FILE_KEY)

pnpm --filter @qw/design-system-figma build
# In Figma: Plugins > Development > Import plugin from manifest...
# Select: packages/qw-figma/src/manifest.json
```

### Creating Components

```bash
pnpm --filter @qw/design-system new-component
```

## Documentation

- **AI/Agent Guide**: [AGENTS.md](./AGENTS.md)
