## Relevant Files

- `server/services/agent.ts` - Current agent chat + function-calling implementation to migrate/wrap with the Agents SDK.
- `server/services/openai.ts` - OpenAI client and context composition; integrate Alex prompt/versioning and tracing.
- `server/routes.ts` - API endpoints for chat; update to route through Agents SDK-backed handler(s).
- `server/index.ts` - Server bootstrap; may register new routes (voice, tools, approvals).
- `server/storage.ts` / `server/postgres-storage.ts` - Data access used by analytics tools; ensure venue/org scoping enforced server-side.
- `client/src/components/chat/chat-interface.tsx` - Chat UI; wire to new endpoints and optionally add voice toggle.
- `client/src/components/chat/message-bubble.tsx` - Renders responses and charts; add source attributions and approval prompts.
- `client/src/components/charts/chart-display.tsx` - Chart rendering for insights and forecasts.
- `client/src/hooks/useConversations.ts` - Conversation state; ensure compatibility with new message payloads.
- `client/src/hooks/use-chat.tsx` - Legacy hook; keep compatible or consolidate.
- `context/compiled/alex_context.compiled.json` - Existing compiled context; elevate key parts into Alex’s system prompt.
- `context/context.base.json` and related files - Modular context; keep as appendices.
- `shared/schema.ts` - Types shared client/server; extend for tool results, approvals, and tracing metadata.

- Proposed new files:
  - `server/services/agents/alex.ts` - Alex agent definition (instructions + tool registry) using OpenAI Agents SDK.
  - `server/services/tools/db-analytics.ts` - Read-only analytics tool with parameterized, whitelisted queries.
  - `server/services/tools/events.ts` - Local events provider fetcher with normalization and source attribution.
  - `server/services/tools/weather.ts` - Weather provider client with historical + forecast and caching.
  - `server/services/tools/moderation.ts` - Output moderation/fact-checking helpers.
  - `server/services/tools/cache.ts` - Caching utilities for aggregates/tool results.
  - `server/services/approvals.ts` - Human-approval workflow (persist approval requests/outcomes).
  - `server/services/realtime.ts` - Realtime voice session bootstrap (browser/WebRTC) if added in v1.
  - `client/src/components/chat/voice-toggle.tsx` - UI toggle and session control for voice agent (optional in v1).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `db-analytics.ts` and `db-analytics.test.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests if/when Jest is configured.

## Tasks

- [ ] 1.0 Define Alex agent with OpenAI Agents SDK (instructions, `RECOMMENDED_PROMPT_PREFIX`, prompt versioning, tracing enabled)
- [ ] 2.0 Implement tools: DB analytics (read-only), events, and weather with `zod` schemas, rate limits, and source attribution
- [ ] 3.0 Wire server routes to Agents SDK (chat handler), keep conversation history, and return structured payloads (text, charts, sources)
- [ ] 4.0 Integrate client chat UI to new endpoints; render citations, approvals, and charts using existing components
- [ ] 5.0 Add forecasting (7/30-day daily, 12-week weekly) with background job execution and dashboard widgets
- [ ] 6.0 Implement guardrails: output moderation/fact-checks and human approval flow for sensitive/expensive tool calls
- [ ] 7.0 Enable observability: tracing, basic evals/feedback in UI, and capture success metrics


