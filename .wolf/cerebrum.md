# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-06

## User Preferences

- ALWAYS use code-review-graph MCP tools FIRST for codebase exploration, before falling back to Grep/Glob/Read
- ALWAYS utilize openwolf for token optimization (anatomy.md before reading files, cerebrum.md before generating code, targeted Grep over full reads)
<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** kokuin

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
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
