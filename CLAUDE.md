# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

There is no test runner configured.

## Architecture

Next.js 16 app using the **App Router** (`src/app/`). Path alias `@/*` maps to `src/*`.

**Tech stack:**
- React 19 with React Compiler enabled (`reactCompiler: true` in `next.config.ts`)
- MUI v7 (`@mui/material`) with Emotion for styling
- TypeScript (strict mode)

**MUI setup** (`src/app/layout.tsx`):
- `AppRouterCacheProvider` wraps the app for MUI + Next.js App Router compatibility (`enableCssLayer: true`)
- `InitColorSchemeScript` handles dark/light mode without flash (attribute-based, `attribute="class"`)
- Theme is defined in `src/theme` (not yet created)
- `src/components/ModeSwitch` handles theme toggling (not yet created)

When creating `src/theme`, use MUI's `cssVariables` / `colorSchemes` approach compatible with `InitColorSchemeScript`. When creating `ModeSwitch`, use `useColorScheme()` from `@mui/material/styles`.
