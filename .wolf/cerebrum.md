# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-06

## User Preferences

- ALWAYS use code-review-graph MCP tools FIRST for codebase exploration, before falling back to Grep/Glob/Read
- ALWAYS utilize openwolf for token optimization (anatomy.md before reading files, cerebrum.md before generating code, targeted Grep over full reads)
- Use OMC subagents: haiku for mechanical tasks, sonnet for standard impl, opus for reviews/architecture
- Run ai-slop-cleaner after each implementation task to validate generated code
- Run `bun run check-types && bun run check` after every feature (per CLAUDE.md)
- User prefers multiple-choice questions during brainstorming, one at a time
- User trusts AI recommendations — often picks the suggested option

## Key Learnings

- **Project:** kokuin — hybrid platform combining code-review-graph + openwolf for multi-user teams
- **Tech stack:** Bun workspaces + Turborepo, TanStack Start, Hono, ORPC, Better-Auth, Prisma 7 (PostgreSQL), bun:sqlite (graph engine)
- **ORPC patterns:** `os.$context<Context>()` → publicProcedure → protectedProcedure → projectProcedure → projectAdminProcedure
- **bun:sqlite returns snake_case columns** — GraphNode/GraphEdge types use snake_case to match; ParsedNode/ParsedEdge use camelCase for input
- **Better-Auth org plugin** needs Organization, Member, Invitation models in Prisma schema — add manually if CLI doesn't generate them
- **Biome errors in .wolf/ and refs/** are pre-existing and should be ignored during check — only validate your own files
- **TanStack Router** auto-generates routeTree.gen.ts — may need `bun run dev:web` briefly to trigger after new route files

## Do-Not-Repeat

- [2026-04-06] **100% anatomy miss rate** — Failed to check anatomy.md before reading files. ALWAYS check .wolf/anatomy.md first before using Read tool on any project file.
- [2026-04-06] **Missed commits from subagents** — Some agents created files but didn't commit. ALWAYS verify git log after subagent completion and commit any unstaged files.
- [2026-04-06] **Graph queries bypass overlay** — QueryEngine/SearchEngine were given `merged.getGlobalStore()` instead of using the MergedGraphStore. The overlay is never queried. Must fix: pass MergedGraphStore to engines or run queries against both stores.
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

- [2026-04-06] **Deployment model**: Hybrid (central server + local CLI/MCP). Central server for auth, project management, GitHub webhooks, shared state. Local CLI for graph builds, openwolf hooks, and merging local+global graphs.
- [2026-04-06] **GitHub integration**: Both webhook-driven (auto for main/develop branches) + CLI-push (developers sync feature branch graphs).
- [2026-04-06] **Graph storage**: PostgreSQL for metadata + SQLite per branch on filesystem. Adapter-based so we can migrate to S3/object storage later.
- [2026-04-06] **OpenWolf split**: Shared (anatomy, buglog, identity, config, decision log, project do-not-repeat) vs Local (user preferences, personal do-not-repeat, memory, token-ledger). Cerebrum splits into shared-cerebrum.md + local-cerebrum.md.
- [2026-04-06] **Auth methods**: Three methods — email/password (traditional), Google OAuth 2.0 (SSO + domain restriction), GitHub OAuth (repo access verification + webhook setup). CLI uses OAuth device flow with all three options on the /device page.
- [2026-04-06] **MCP auth**: OAuth device flow (`kokuin login` → browser → choose auth method → local token). Auto project detection from git remote.
- [2026-04-06] **Graph merge strategy**: Shadow copy with live sync (C). Pull global graph on session start, apply local overlay, WebSocket push for delta updates, polling fallback.
- [2026-04-06] **CLI structure**: Subcommands `kokuin graph ...` and `kokuin wolf ...`. Reads are merged (local+global) by default, writes are local, sync is explicit. `--local`/`--global` flags for isolation.
- [2026-04-06] **Domain restriction**: Both levels (C). Global allowlist at instance level + per-project domain restrictions.
- [2026-04-06] **App roles**: apps/web = admin dashboard (no AI chat, delete ai.tsx). apps/tui = CLI client. apps/docs = documentation (later). MCP server = AI tool interface.
- [2026-04-06] **code-review-graph integration**: Hybrid port (Approach 3). Port storage/query/sync layers to TypeScript. Keep parser as a stateless Python worker (19 languages, too complex/stable to rewrite). Communicate via job queue.
<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
