---
name: Repository Guide
type: repo
version: 1.0.0
agent: CodeActAgent
author: Suree33
---

# Blog Project Repository Guide

## Base Rules

### Core Responsibilities

1. **Code Generation & Refactoring** – Produce context-aware TypeScript/Astro code snippets and suggest improvements. Optimize code for readability, performance, and maintainability.
2. **Code Explanation & Review** – Clearly explain code segments or concepts when asked, and review existing code for potential issues or best practice violations.
3. **Debugging Support** – Analyze errors or bugs, propose fixes, and guide the developer with diagnostics (e.g. logging or breakpoints) to resolve issues.

### Guidelines

- Follow TypeScript strict typing and Astro framework best practices in all suggestions.
- Use Tailwind CSS utility classes for styling (avoid inline styles or external CSS unless instructed).
- **No unnecessary apologies or refusals.** If you encounter an error in generated code, correct it or mark it with TODO and explain.
- Keep responses concise and focused.
- If a request is unclear, ask for clarification rather than guessing.

## Overview

This repository contains a personal blog website built with Astro, Tailwind CSS, and various plugins. The site is deployed on Cloudflare Pages and uses Bun as the JavaScript runtime.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Typography plugin](https://github.com/tailwindlabs/tailwindcss-typography)
- **Markdown Enhancements**:
  - [remark-link-card](https://github.com/gladevise/remark-link-card)
  - [remark-flexible-code-titles](https://github.com/ipikuka/remark-flexible-code-titles)
- **Icons**: [Astro Icon](https://www.astroicon.dev/) with [Font Awesome 6](https://fontawesome.com/)
- **Code Quality**:
  - ESLint with Astro, Prettier, and JSX a11y plugins
  - Prettier with Astro and Tailwind plugins
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## Repository Structure

```
blog/
├── .astro/           # Astro build cache
├── .openhands/       # OpenHands configuration
├── .vscode/          # VS Code configuration
├── dist/             # Build output
├── node_modules/     # Dependencies
├── public/           # Static assets
├── src/              # Source code
│   ├── assets/       # Images and other assets
│   ├── components/   # Reusable UI components
│   ├── layouts/      # Page layouts
│   ├── pages/        # Page routes
│   ├── scripts/      # Utility scripts
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
└── various config files
```

## Development Workflow

### Setup

```bash
bun install
```

### Development

```bash
bun run dev     # Start local dev server with astro dev
```

### Building and Previewing

```bash
bun run build    # Build for production with astro build
bun run preview  # Preview production build with astro preview
```

### Code Quality

```bash
bun run format   # Run Prettier formatting with prettier
bun run lint     # Run ESLint with eslint
```

### Additional CLI Commands

For additional Astro CLI commands and options not listed above, please refer to the [Astro CLI Reference Documentation](https://docs.astro.build/ja/reference/cli-reference/).

## Coding Conventions

### Astro Components

- Keep components in the `src/components` directory
- Use `.astro` extension for Astro components
- Follow the component-based architecture pattern

### Styling

- Use Tailwind CSS classes for styling
- Maintain a consistent design language
- Use the Tailwind CSS's Typography plugin for markdown content

### Content Management

- Blog posts should be written in Markdown
- Images should be optimized before adding to the repository
- Follow accessibility best practices

## Git Workflow

- Create feature branches from the main branch
- Use descriptive commit messages
- Submit pull requests for review before merging

## Performance Considerations

- Optimize images and assets
- Minimize JavaScript usage when possible (leverage Astro's zero-JS by default approach)
- Use appropriate loading strategies for components
