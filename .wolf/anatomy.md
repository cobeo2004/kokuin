# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-06T04:01:03.175Z
> Files: 322 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.cursorrules` (~467 tok)
- `.mcp.json` (~50 tok)
- `.opencode.json` (~55 tok)
- `.windsurfrules` (~467 tok)
- `AGENTS.md` — MCP Tools: code-review-graph (~438 tok)
- `CLAUDE.md` — OpenWolf (~495 tok)
- `GEMINI.md` — MCP Tools: code-review-graph (~438 tok)

## .claude/

- `settings.json` (~626 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .claude/skills/

- `debug-issue.md` — Debug Issue (~192 tok)
- `explore-codebase.md` — Explore Codebase (~221 tok)
- `refactor-safely.md` — Refactor Safely (~219 tok)
- `review-changes.md` — Review Changes (~187 tok)

## .code-review-graph/

- `.gitignore` — Git ignore rules (~38 tok)

## .cursor/

- `mcp.json` (~50 tok)

## refs/code-review-graph/

- `.gitignore` — Git ignore rules (~260 tok)
- `.mcp.json` (~37 tok)
- `CHANGELOG.md` — Change log (~3325 tok)
- `CLAUDE.md` — CLAUDE.md - Project Context for Claude Code (~1407 tok)
- `CODE_OF_CONDUCT.md` — Code of Conduct (~147 tok)
- `CONTRIBUTING.md` — Contributing to code-review-graph (~603 tok)
- `LICENSE` — Project license (~286 tok)
- `marketing-diagram.excalidraw` (~18501 tok)
- `pyproject.toml` — Python project configuration (~867 tok)
- `README.md` — Project documentation (~3990 tok)
- `SECURITY.md` — Security Policy (~559 tok)

## refs/code-review-graph/.claude-plugin/

- `marketplace.json` (~192 tok)
- `plugin.json` (~199 tok)

## refs/code-review-graph/.github/workflows/

- `ci.yml` — CI: CI (~797 tok)
- `publish.yml` — CI: Publish to PyPI (~177 tok)

## refs/code-review-graph/code-review-graph-vscode/

- `.gitignore` — Git ignore rules (~9 tok)
- `.vscodeignore` — test/\*\* (~27 tok)
- `CHANGELOG.md` — Change log (~316 tok)
- `esbuild.mjs` — isWatch: main (~344 tok)
- `LICENSE` — Project license (~286 tok)
- `package-lock.json` — npm lock file (~40629 tok)
- `package.json` — Node.js package manifest (~2627 tok)
- `README.md` — Project documentation (~907 tok)
- `tsconfig.json` — TypeScript configuration (~150 tok)

## refs/code-review-graph/code-review-graph-vscode/media/walkthrough/

- `build.md` — Build Your Graph (~75 tok)
- `explore.md` — Explore Your Code (~123 tok)
- `install.md` — Install the Backend (~82 tok)

## refs/code-review-graph/code-review-graph-vscode/src/

- `extension.ts` — Locate the graph database file in the workspace. (~8954 tok)

## refs/code-review-graph/code-review-graph-vscode/src/backend/

- `cli.ts` — Check whether the CLI binary is reachable. (~1834 tok)
- `sqlite.ts` — Read-only SQLite reader for the code-review-graph database. (~5034 tok)
- `watcher.ts` — Return a debounced version of `fn` that delays invocation until `ms` (~547 tok)

## refs/code-review-graph/code-review-graph-vscode/src/features/

- `blastRadius.ts` — Register the cursor-aware blast radius command. (~856 tok)
- `cursorResolver.ts` — Resolve the innermost graph node at the current cursor position. (~347 tok)
- `navigation.ts` — Register the navigation commands: findCallers, findTests, and search. (~2076 tok)
- `reviewAssistant.ts` — SCM integration for code review. (~1029 tok)
- `scmDecorations.ts` — SCM file decoration provider. (~1424 tok)
- `search.ts` — Quick search command with live filtering. (~1060 tok)

## refs/code-review-graph/code-review-graph-vscode/src/onboarding/

- `installer.ts` — Handles auto-detection and installation of the Python backend. (~1088 tok)
- `welcome.ts` — Register command handlers for the walkthrough steps defined in (~1028 tok)

## refs/code-review-graph/code-review-graph-vscode/src/views/

- `graphWebview.ts` — Webview panel for the interactive graph visualization. (~5085 tok)
- `statusBar.ts` — Number of milliseconds in one hour. (~750 tok)
- `treeItems.ts` — FileTreeItem – represents a source file in the code graph (~2190 tok)
- `treeView.ts` — Exports CodeGraphTreeProvider, BlastRadiusTreeProvider, StatsTreeProvider (~2100 tok)

## refs/code-review-graph/code-review-graph-vscode/src/webview/

- `graph.ts` — Webview entry point for the D3.js force-directed graph visualization. (~7492 tok)

## refs/code-review-graph/code-review-graph-vscode/test/

- `sqlite.test.ts` — Tests for the SqliteReader module. (~5002 tok)

## refs/code-review-graph/code_review_graph/

- `__init__.py` — Code Review Graph - MCP server for persistent incremental code knowledge graphs. (~32 tok)
- `__main__.py` — Allow running as: python -m code_review_graph (~24 tok)
- `changes.py` — Change impact analysis for code review. (~2947 tok)
- `cli.py` — CLI entry point for code-review-graph. (~5729 tok)
- `communities.py` — Community/cluster detection for the code knowledge graph. (~5743 tok)
- `constants.py` — Shared constants for code-review-graph. (~117 tok)
- `embeddings.py` — Vector embedding support for semantic code search. (~4762 tok)
- `flows.py` — Execution flow detection, tracing, and criticality scoring. (~4400 tok)
- `graph.py` — SQLite-backed knowledge graph storage and query engine. (~9452 tok)
- `hints.py` — Context-aware hints system for MCP tool responses. (~3426 tok)
- `incremental.py` — Incremental graph update logic. (~5183 tok)
- `main.py` — MCP server entry point for Code Review Graph. (~5928 tok)
- `migrations.py` — Schema migration framework for the code-review-graph SQLite database. (~1956 tok)
- `parser.py` — Tree-sitter based multi-language code parser. (~30989 tok)
- `prompts.py` — MCP prompt templates for Code Review Graph. (~2584 tok)
- `refactor.py` — Graph-powered refactoring operations. (~4346 tok)
- `registry.py` — Multi-repo registry and connection pool. (~2314 tok)
- `search.py` — Hybrid search engine combining FTS5 (BM25) and vector embeddings. (~3690 tok)
- `skills.py` — Claude Code skills and hooks auto-install. (~4920 tok)
- `tsconfig_resolver.py` — TypeScript tsconfig.json path alias resolver. (~2552 tok)
- `visualization.py` — Interactive D3.js graph visualization for code knowledge graphs. (~11175 tok)
- `wiki.py` — Wiki generation from community structure. (~2735 tok)

## refs/code-review-graph/code_review_graph/eval/

- `__init__.py` — Evaluation framework for code-review-graph. (~292 tok)
- `reporter.py` — Markdown report generator for evaluation benchmark results. (~2285 tok)
- `runner.py` — Evaluation runner: orchestrates benchmark execution across repositories. (~1386 tok)
- `scorer.py` — Scoring metrics for evaluating graph-based code review quality. (~736 tok)

## refs/code-review-graph/code_review_graph/eval/benchmarks/

- `__init__.py` — Benchmark modules for the evaluation framework. (~16 tok)
- `build_performance.py` — Build performance benchmark: measures timing of graph operations. (~546 tok)
- `flow_completeness.py` — Flow completeness benchmark: evaluates entry point detection and flow tracing. (~323 tok)
- `impact_accuracy.py` — Impact accuracy benchmark: measures precision/recall of change impact analysis. (~960 tok)
- `search_quality.py` — Search quality benchmark: measures search result ranking via MRR. (~540 tok)
- `token_efficiency.py` — Token efficiency benchmark: compares naive, standard, and graph-based token counts. (~948 tok)

## refs/code-review-graph/code_review_graph/eval/configs/

- `express.yaml` (~199 tok)
- `fastapi.yaml` (~215 tok)
- `flask.yaml` (~211 tok)
- `gin.yaml` (~231 tok)
- `httpx.yaml` — Declares checker (~192 tok)
- `nextjs.yaml` (~225 tok)

## refs/code-review-graph/code_review_graph/tools/

- `__init__.py` — MCP tool definitions for the Code Review Graph server. (~1227 tok)
- `_common.py` — Shared utilities for tool sub-modules. (~1074 tok)
- `build.py` — Tool 1: build_or_update_graph. (~1435 tok)
- `community_tools.py` — Tools 13, 14, 15: community listing, detail, architecture overview. (~1672 tok)
- `docs.py` — Tools 7, 8, 19, 20: embed_graph, get_docs_section, wiki tools. (~2157 tok)
- `flows_tools.py` — Tools 10, 11: list_flows, get_flow. (~1600 tok)
- `query.py` — Tools 2, 3, 5, 6, 9: query / search / stats helpers. (~5143 tok)
- `refactor_tools.py` — Tools 17, 18: refactor_func, apply_refactor_func. (~1484 tok)
- `registry_tools.py` — Tools 21, 22: list_repos_func, cross_repo_search_func. (~1079 tok)
- `review.py` — Tools 4, 12, 16: review context, affected flows, detect changes. (~3956 tok)

## refs/code-review-graph/diagrams/

- `generate_diagrams.py` — Generate 6 Excalidraw diagrams for code-review-graph Medium article. (~7502 tok)

## refs/code-review-graph/docs/

- `architecture.md` — Architecture (~1464 tok)
- `COMMANDS.md` — All Available Commands (~1682 tok)
- `FEATURES.md` — Features (~1979 tok)
- `INDEX.md` — Documentation Index (~176 tok)
- `LEGAL.md` — Legal & Privacy (~104 tok)
- `LLM-OPTIMIZED-REFERENCE.md` — LLM-OPTIMIZED REFERENCE -- code-review-graph v2.1.0 (~876 tok)
- `ROADMAP.md` — Roadmap (~572 tok)
- `schema.md` — Knowledge Graph Schema (~1593 tok)
- `TROUBLESHOOTING.md` — Troubleshooting (~758 tok)
- `USAGE.md` — Code Review Graph — User Guide (~1015 tok)

## refs/code-review-graph/docs/superpowers/plans/

- `2026-03-20-notebook-databricks-support.md` — Notebook & Databricks Support Implementation Plan (~8146 tok)

## refs/code-review-graph/docs/superpowers/specs/

- `2026-03-16-vscode-extension-design.md` — VS Code Extension for code-review-graph (~3561 tok)
- `2026-03-20-notebook-databricks-support-design.md` — Notebook & Databricks Support Design (~1852 tok)
- `2026-03-31-accessibility-audit-fixes-design.md` — Accessibility Audit Fixes — Design Spec (~2319 tok)

## refs/code-review-graph/evaluate/reports/

- `summary.md` — Evaluation Report (~1466 tok)

## refs/code-review-graph/evaluate/results/

- `express_build_performance_2026-03-26.csv` (~45 tok)
- `express_flow_completeness_2026-03-26.csv` (~34 tok)
- `express_impact_accuracy_2026-03-26.csv` (~58 tok)
- `express_search_quality_2026-03-26.csv` (~50 tok)
- `express_token_efficiency_2026-03-26.csv` (~98 tok)
- `fastapi_build_performance_2026-03-26.csv` (~45 tok)
- `fastapi_flow_completeness_2026-03-26.csv` (~34 tok)
- `fastapi_impact_accuracy_2026-03-26.csv` (~58 tok)
- `fastapi_search_quality_2026-03-26.csv` (~62 tok)
- `fastapi_token_efficiency_2026-03-26.csv` (~103 tok)
- `flask_build_performance_2026-03-26.csv` (~44 tok)
- `flask_flow_completeness_2026-03-26.csv` (~34 tok)
- `flask_impact_accuracy_2026-03-26.csv` (~59 tok)
- `flask_search_quality_2026-03-26.csv` (~58 tok)
- `flask_token_efficiency_2026-03-26.csv` (~101 tok)
- `gin_build_performance_2026-03-26.csv` (~44 tok)
- `gin_flow_completeness_2026-03-26.csv` (~33 tok)
- `gin_impact_accuracy_2026-03-26.csv` (~75 tok)
- `gin_search_quality_2026-03-26.csv` (~45 tok)
- `gin_token_efficiency_2026-03-26.csv` (~134 tok)
- `httpx_build_performance_2026-03-26.csv` (~44 tok)
- `httpx_flow_completeness_2026-03-26.csv` (~34 tok)
- `httpx_impact_accuracy_2026-03-26.csv` (~58 tok)
- `httpx_search_quality_2026-03-26.csv` (~55 tok)
- `httpx_token_efficiency_2026-03-26.csv` — Declares checker (~90 tok)
- `nextjs_build_performance_2026-03-26.csv` (~44 tok)
- `nextjs_flow_completeness_2026-03-26.csv` (~34 tok)
- `nextjs_impact_accuracy_2026-03-26.csv` (~59 tok)
- `nextjs_search_quality_2026-03-26.csv` (~66 tok)
- `nextjs_token_efficiency_2026-03-26.csv` (~105 tok)

## refs/code-review-graph/hooks/

- `hooks.json` (~130 tok)
- `session-start.sh` — Checks for the code-review-graph knowledge graph and outputs (~319 tok)

## refs/code-review-graph/skills/build-graph/

- `SKILL.md` — Build Graph (~379 tok)

## refs/code-review-graph/skills/review-delta/

- `SKILL.md` — Review Delta (~545 tok)

## refs/code-review-graph/skills/review-pr/

- `SKILL.md` — Review PR (~602 tok)

## refs/code-review-graph/tests/

- `__init__.py` (~0 tok)
- `test_changes.py` — Tests for change impact analysis (changes.py). (~4904 tok)
- `test_communities.py` — Tests for community/cluster detection. (~3236 tok)
- `test_embeddings.py` — Tests for the embeddings module. (~3063 tok)
- `test_eval.py` — Tests for the evaluation framework (scorer, reporter, runner, benchmarks). (~3149 tok)
- `test_flows.py` — Tests for execution flow detection, tracing, and scoring. (~4086 tok)
- `test_graph.py` — Tests for the graph storage and query engine. (~1913 tok)
- `test_hints.py` — Tests for the context-aware hints system. (~2312 tok)
- `test_incremental.py` — " in patterns (~2413 tok)
- `test_integration_git.py` — Integration tests exercising git-dependent code with real temporary repos. (~1486 tok)
- `test_integration_v2.py` — Comprehensive end-to-end integration test for the v2 pipeline. (~4864 tok)
- `test_migrations.py` — Tests for the schema migration framework. (~1420 tok)
- `test_multilang.py` — Tests for Go, Rust, Java, C, C++, C#, Ruby, PHP, Kotlin, Swift, Solidity, and Vue parsing. (~8462 tok)
- `test_notebook.py` — Tests for Jupyter notebook (.ipynb) parsing. (~4115 tok)
- `test_parser.py` — Tests for the Tree-sitter parser module. (~5526 tok)
- `test_prompts.py` — Tests for MCP prompt templates. (~1438 tok)
- `test_refactor.py` — Tests for graph-powered refactoring operations. (~4122 tok)
- `test_registry.py` — Tests for multi-repo registry and connection pool. (~2402 tok)
- `test_search.py` — Tests for the hybrid search engine. (~2587 tok)
- `test_skills.py` — Tests for skills and hooks auto-install. (~3168 tok)
- `test_tools.py` — Tests for MCP tool functions. (~7592 tok)
- `test_tsconfig_resolver.py` — Tests for the TsconfigResolver class. (~582 tok)
- `test_visualization.py` — Tests for graph visualization export. (~2097 tok)
- `test_wiki.py` — Tests for wiki generation. (~2045 tok)

## refs/code-review-graph/tests/fixtures/

- `alias_importer.ts` — Exports formatUser (~48 tok)
- `caller_example.py` — Fixture that imports and calls functions from sample_python. (~55 tok)
- `multi_call_example.py` — Fixture with multiple calls to the same function from one caller. (~140 tok)
- `sample_databricks_export.py` — Databricks notebook source (~194 tok)
- `sample_databricks_notebook.ipynb` (~392 tok)
- `sample_go.go` — Interface: UserRepository (5 methods) (~240 tok)
- `sample_notebook.ipynb` — Declares DataProcessor (~378 tok)
- `sample_python.py` — Sample Python file for testing the parser. (~350 tok)
- `sample_rust.rs` — User: new, create_user (~265 tok)
- `sample_typescript.ts` — Exports handleGetUser (~255 tok)
- `sample_vitest.test.ts` — Declares repo (~140 tok)
- `sample_vue.vue` — Vue: setup, TS (~171 tok)
- `sample.c` — include <stdio.h> (~128 tok)
- `sample.cpp` — include <iostream> (~186 tok)
- `Sample.cs` — Interface: User (6 members) (~250 tok)
- `sample.dart` — Animal: speak, swim, speak, \_run (~178 tok)
- `sample.kt` — Data class: User (3 properties) (~162 tok)
- `sample.lua` — sample.lua - Comprehensive Lua test fixture for tree-sitter parsing (~865 tok)
- `sample.php` — Interface: Repository (6 methods) (~246 tok)
- `sample.pl` (~120 tok)
- `sample.R` (~135 tok)
- `sample.rb` — User: initialize, to_s, initialize, find_by_id + 2 more (~153 tok)
- `sample.scala` — Declares User (~253 tok)
- `sample.sol` — SPDX-License-Identifier: MIT (~1727 tok)
- `sample.swift` — Protocol: UserRepository (5 requirements) (~165 tok)
- `sample.xs` — include "EXTERN.h" (~121 tok)
- `SampleJava.java` — User: getId, getName, getEmail, findById + 3 more (~375 tok)
- `test_sample.py` — Tests for sample_python.py - used to verify TESTED_BY edge detection. (~166 tok)
- `test_sample.R` (~37 tok)
- `tsconfig.json` — TypeScript configuration (~39 tok)

## refs/code-review-graph/tests/fixtures/src/lib/

- `utils.ts` — Exports cn (~22 tok)

## refs/openwolf/

- `.gitignore` — Git ignore rules (~127 tok)
- `CODE_OF_CONDUCT.md` — Code of Conduct (~370 tok)
- `CONTRIBUTING.md` — Contributing to OpenWolf (~682 tok)
- `LICENSE` — Project license (~9217 tok)
- `package.json` — Node.js package manifest (~562 tok)
- `pnpm-lock.yaml` — pnpm lock file (~42497 tok)
- `README.md` — Project documentation (~2412 tok)
- `tsconfig.hooks.json` — TypeScript hooks build configuration (~96 tok)
- `tsconfig.json` — TypeScript configuration (~140 tok)

## refs/openwolf/.github/workflows/

- `docs.yml` — CI: Deploy Docs (~261 tok)

## refs/openwolf/bin/

- `openwolf.ts` — Declares major (~97 tok)

## refs/openwolf/docs/

- `commands.md` — Commands (~2093 tok)
- `configuration.md` — Configuration (~1067 tok)
- `dashboard.md` — Dashboard (~1227 tok)
- `designqc.md` — Design QC (~1351 tok)
- `getting-started.md` — Getting Started (~1341 tok)
- `hooks.md` — Hooks (~1320 tok)
- `how-it-works.md` — How It Works (~2146 tok)
- `index.md` (~10 tok)
- `package-lock.json` — npm lock file (~32008 tok)
- `package.json` — Node.js package manifest (~100 tok)
- `reframe.md` — Reframe (~1162 tok)
- `troubleshooting.md` — Troubleshooting (~1802 tok)
- `updating.md` — Update and Restore (~920 tok)

## refs/openwolf/docs/.vitepress/

- `config.ts` (~1149 tok)

## refs/openwolf/docs/.vitepress/theme/

- `custom.css` — Styles: 15 rules, 64 vars (~972 tok)
- `index.ts` (~94 tok)
- `tailwind.css` — Styles: 1 rules (~7 tok)

## refs/openwolf/docs/.vitepress/theme/components/

- `HeroLanding.vue` — Vue: anatomy.md, setup, TS (~11205 tok)

## refs/openwolf/docs/public/

- `CNAME` (~4 tok)

## refs/openwolf/src/buglog/

- `bug-matcher.ts` — Re-export from bug-tracker for convenience (~32 tok)
- `bug-tracker.ts` — Exports getBugLogPath, readBugLog, logBug, findSimilarBugs, searchBugs (~993 tok)

## refs/openwolf/src/cli/

- `bug-cmd.ts` — Exports bugSearch (~310 tok)
- `cron-cmd.ts` — Exports cronList, cronRun, cronRetry (~1277 tok)
- `daemon-cmd.ts` — Exports daemonStart, daemonStop, daemonRestart, daemonLogs (~1519 tok)
- `dashboard.ts` — Exports dashboardCommand (~816 tok)
- `designqc-cmd.ts` — Exports designqcCommand (~478 tok)
- `index.ts` — Exports createProgram (~1448 tok)
- `init.ts` — Exports initCommand (~6159 tok)
- `registry.ts` — Central registry of all OpenWolf-managed projects. (~852 tok)
- `scan.ts` — Exports scanCommand (~441 tok)
- `status.ts` — Exports statusCommand (~1067 tok)
- `update.ts` — openwolf update — Update all registered OpenWolf projects. (~4976 tok)

## refs/openwolf/src/daemon/

- `cron-engine.ts` — Exports CronEngine (~3393 tok)
- `file-watcher.ts` — Exports startFileWatcher (~510 tok)
- `health.ts` — Exports getHealth (~314 tok)
- `wolf-daemon.ts` — API routes: GET, POST (6 endpoints) (~3009 tok)

## refs/openwolf/src/dashboard/app/

- `App.tsx` — ProjectOverview — uses useState (~1212 tok)
- `index.html` — OpenWolf Dashboard (~159 tok)
- `main.tsx` — root (~76 tok)
- `vite.config.ts` — Vite build configuration (~132 tok)

## refs/openwolf/src/dashboard/app/components/layout/

- `Header.tsx` — Header (~254 tok)
- `Layout.tsx` — Layout (~60 tok)
- `Sidebar.tsx` — navItems (~1391 tok)

## refs/openwolf/src/dashboard/app/components/panels/

- `ActivityTimeline.tsx` — ActivityTimeline — uses useState, useMemo (~1385 tok)
- `AISuggestions.tsx` — sections (~843 tok)
- `AnatomyBrowser.tsx` — buildTree — uses useState, useMemo (~1663 tok)
- `BugLog.tsx` — BugLog — uses useState (~1604 tok)
- `CerebrumViewer.tsx` — CerebrumViewer — uses useState (~2169 tok)
- `CronStatus.tsx` — CronStatus — renders table — uses useState (~2121 tok)
- `DesignQC.tsx` — DesignQC (~793 tok)
- `MemoryViewer.tsx` — MemoryViewer — renders table — uses useState (~1350 tok)
- `ProjectOverview.tsx` — ProjectOverview (~1112 tok)
- `TokenUsage.tsx` — TokenUsage — renders chart (~1568 tok)

## refs/openwolf/src/dashboard/app/components/shared/

- `EmptyState.tsx` — EmptyState (~141 tok)
- `LiveIndicator.tsx` — LiveIndicator (~74 tok)
- `StatusBadge.tsx` — variants (~447 tok)
- `TokenBadge.tsx` — TokenBadge (~117 tok)

## refs/openwolf/src/dashboard/app/hooks/

- `useLiveUpdates.ts` — Exports useLiveUpdates (~109 tok)
- `useTheme.ts` — Exports Theme, useTheme (~202 tok)
- `useWolfData.ts` — Exports WolfData, useWolfData (~1609 tok)

## refs/openwolf/src/dashboard/app/lib/

- `file-parsers.ts` — Exports AnatomyEntry, MemorySession, CerebrumData, parseAnatomy + 2 more (~1048 tok)
- `utils.ts` — Exports cn, relativeTime, formatTokens, formatSchedule (~304 tok)
- `wolf-client.ts` — Exports WolfClient (~435 tok)

## refs/openwolf/src/dashboard/app/styles/

- `globals.css` — Styles: 12 rules, 46 vars, 1 animations (~771 tok)

## refs/openwolf/src/designqc/

- `designqc-capture.ts` — Capture a full page as sectioned viewport-height screenshots. (~2561 tok)
- `designqc-engine.ts` — Exports DesignQCEngine (~1707 tok)
- `designqc-types.ts` — Exports DesignQCOptions, Viewport, Screenshot, CaptureResult, DEFAULT_VIEWPORTS (~193 tok)

## refs/openwolf/src/hooks/

- `post-read.ts` — SessionData: main (~804 tok)
- `post-write.ts` — SessionData: main, summarizeEdit, extractCalls, autoDetectBugFix (~6165 tok)
- `pre-read.ts` — SessionData: main (~942 tok)
- `pre-write.ts` — BugEntry: main, checkCerebrum, checkBugLog, tokenize (~1588 tok)
- `session-start.ts` — Declares main (~967 tok)
- `shared.ts` — Bail out silently if .wolf/ directory doesn't exist in the current project. (~7664 tok)
- `stop.ts` — Check if files were edited multiple times but buglog.json wasn't updated. (~2005 tok)

## refs/openwolf/src/scanner/

- `anatomy-scanner.ts` — Scan the project and return the anatomy content and file count WITHOUT writing to disk. (~2598 tok)
- `description-extractor.ts` — ─── Known files ───────────────────────────────────────────── (~12506 tok)
- `project-root.ts` — Exports findProjectRoot (~260 tok)

## refs/openwolf/src/templates/

- `anatomy.md` — anatomy.md (~49 tok)
- `buglog.json` (~10 tok)
- `cerebrum.md` — Cerebrum (~164 tok)
- `claude-md-snippet.md` — OpenWolf (~57 tok)
- `claude-rules-openwolf.md` (~313 tok)
- `config.json` (~454 tok)
- `cron-manifest.json` (~927 tok)
- `cron-state.json` (~38 tok)
- `identity.md` — Identity (~86 tok)
- `memory.md` — Memory (~35 tok)
- `OPENWOLF.md` — OpenWolf Operating Protocol (~1635 tok)
- `reframe-frameworks.md` — OpenWolf Reframe — UI Framework Knowledge Base (~6554 tok)
- `token-ledger.json` (~121 tok)

## refs/openwolf/src/tracker/

- `token-estimator.ts` — Exports ContentType, detectContentType, estimateTokens (~222 tok)
- `token-ledger.ts` — Exports getLedgerPath, readLedger, writeLedger, incrementSessions, addSessionToLedger (~782 tok)
- `waste-detector.ts` — Exports detectWaste (~1130 tok)

## refs/openwolf/src/utils/

- `fs-safe.ts` — Exports readJSON, writeJSON, readText, writeText, appendText (~565 tok)
- `logger.ts` — Exports LogLevel, Logger (~409 tok)
- `paths.ts` — Exports normalizePath, getWolfDir, resolveWolfFile, ensureDir, relativeToCwd (~204 tok)
- `platform.ts` — Exports isWindows, isMac, isLinux, whichCommand (~99 tok)
