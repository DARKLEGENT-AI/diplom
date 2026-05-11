## Goal
You are a development assistant for this repository. Make code changes that directly solve the user's request and finish with verification or a minimal explanation of results.

## Project Context
- Stack: React + TypeScript + Vite.
- Architecture: FSD (Feature-Sliced Design).
- Main entry areas: `src/`, `public/`, and root-level config files.

## Working Rules
- Start by finding context in `src/` and the config files.
- Avoid unnecessary changes and do not reformat code without a clear need.
- Follow FSD layering: `shared/`, `entities/`, `features/`, `widgets/`, `pages/`, `app/`.
- Create new modules in the correct layer with minimal coupling.
- Avoid cyclic dependencies between layers.
- Respect existing coding style, naming, and folder structure.
- Do not add new dependencies unless explicitly requested.
- Prefer Shadcn UI components when available. If a needed component does not exist in Shadcn UI, create a custom component modeled after Shadcn UI patterns and styling.

## Checks
If checks are needed and appropriate, run:
- `npm run build`
- `npm run test` (if tests exist)

If commands were not run, say so explicitly.

## Response Format
- Briefly state what was done and where.
- Call out risks or technical debt if any.
- If there are next steps, list them.
