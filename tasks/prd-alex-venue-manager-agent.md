## PRD — Alex: Venue Manager Agent (OpenAI Agents SDK aligned)

### 1. Introduction / Overview
Alex is a virtual venue manager agent that analyzes POS data, enriches it with external signals (events, weather, holidays), and provides descriptive, diagnostic, predictive, and prescriptive insights. Alex supports both chat and voice interactions and surfaces anomalies, opportunities, and forecasts with actionable recommendations. The implementation follows OpenAI Agents SDK best practices for prompts, tools, handoffs, tracing, and evaluation.

### 2. Goals
- **Comprehensive insights**: Daily/weekly/monthly summaries, anomaly detection, key drivers, and recommended actions.
- **Forecasting**: Short- and medium-term demand forecasting on daily and weekly horizons with confidence bands.
- **Decision support**: Data-backed suggestions (staffing, inventory, events preparation) grounded in POS and external signals.
- **Fast UX**: P95 latency under 3 seconds for descriptive insights; heavier tasks run as background jobs.
- **SDK alignment**: Use recommended prompt prefix, structured tools with `zod`, optional handoffs, tracing, and evals.

### 3. User Stories
- As a venue manager, I want a daily summary at open with yesterday’s revenue, top items, anomalies, and today’s weather/events impact so I can prepare staff and stock.
- As a venue manager, I want 7/30-day daily forecasts and 12-week weekly forecasts with factors (weather, events) so I can plan labor and inventory.
- As an HQ analyst, I want multi-venue comparisons and cohort trends to identify outliers and best practices.
- As a venue manager, I want to ask free-form questions in chat/voice and receive charts/widgets embedded in the response.
- As an HQ analyst, I want Alex to cite sources for external data (events/weather/holidays) and note uncertainty.
- As a venue manager, I want high-risk or costly operations to require explicit approval before execution.

### 4. Functional Requirements (numbered)
1) **Interaction modes**
   - 1.1 Text chat in existing web UI (`client/src/components/chat/*`).
   - 1.2 Voice via Realtime Agent (browser/WebRTC) with text transcripts enabled for history and UI display.

2) **Data sources (internal)**
   - 2.1 POS sales data (existing DB; read-only analytics).
   - 2.2 Product/category hierarchy.
   - 2.3 Venue metadata (location, capacity, trading hours).
   - 2.4 Staff/rosters (if available) to connect labor with demand.
   - 2.5 Inventory (if available) to flag stock risks vs forecast.

3) **Data sources (external)**
   - 3.1 Weather (historical + forecast) for venue location(s).
   - 3.2 Local events (e.g., Ticketmaster/Eventbrite/Google) near venue(s).
   - 3.3 Holidays/calendar for the venue’s region.
   - 3.4 v1 includes read-only retrieval and source citation; writes or bookings are out of scope.

4) **Insights scope**
   - 4.1 Descriptive: sales KPIs, category mix, time-of-day patterns.
   - 4.2 Diagnostic: drivers/attribution (e.g., weather, events, promos).
   - 4.3 Predictive: demand forecasts (7d/30d daily; 12w weekly) with uncertainty.
   - 4.4 Prescriptive: recommended staffing, ordering, and promo actions.

5) **Forecast horizons & granularity**
   - 5.1 7-day forecast (daily granularity).
   - 5.2 30-day forecast (daily granularity).
   - 5.3 12-week forecast (weekly granularity).

6) **Delivery surfaces**
   - 6.1 Chat UI responses with inline tables/text and images for charts.
   - 6.2 Dashboard widgets/cards leveraging existing components: `sales-overview.tsx`, `calendar-heatmap.tsx`, `venue-breakdown.tsx`, charts under `components/charts/*`, and `ui/*` primitives.

7) **Tooling (v1)**
   - 7.1 DB analytics tool (read-only): parameterized, whitelisted queries executed server-side; never accept raw SQL from the LLM.
   - 7.2 Web search/events tool: server-side calls to selected providers with normalization and source attribution.
   - 7.3 Weather tool: server-side calls to weather provider with historical and forecast endpoints.
   - 7.4 Tools are defined with `zod` schemas; all inputs validated; safe defaults and rate limits.

8) **Guardrails & approvals**
   - 8.1 Output moderation and external fact checks for claims based on web/events/weather.
   - 8.2 Human approval (`needsApproval: true`) before sensitive or costly tool executions (e.g., wide web scraping bursts, heavy/expensive analytics, or any operation beyond read-only retrieval).

9) **Performance**
   - 9.1 P95 response < 3s for descriptive queries using cached/aggregated metrics.
   - 9.2 Background jobs for heavy analytics/forecasting with queued updates to the UI.

10) **Orchestration**
   - 10.1 v1 uses a single agent (Alex) with tools.
   - 10.2 Design for multi-agent expansion (handoffs): EventScout, Forecaster, ReportWriter as sub-agents or `agent.asTool()`.

11) **Tracing & evaluation**
   - 11.1 Enable Agents SDK built-in tracing.
   - 11.2 Phase 2: add business KPI evals (accuracy, usefulness) and UI feedback (thumbs up/down) in chat.

12) **Auth & access**
   - 12.1 Use existing app auth; scope data by venue/org. Deny cross-venue data access per user permissions.
   - 12.2 Server enforces access controls for all tools; never trust client inputs.

13) **Prompting & context**
   - 13.1 Use `RECOMMENDED_PROMPT_PREFIX` as a prefix in the agent’s instructions.
   - 13.2 Optionally use stored prompt configuration (`promptId`, `version`, `variables`) where supported to version Alex’s core prompt.
   - 13.3 Keep existing context files (C) with minor edits; consolidate key domain knowledge into the core system prompt and reference appendices.
   - 13.4 All tool descriptions should clearly state capabilities, limits, and required parameters.

14) **Safety & privacy**
   - 14.1 No PII exposure; redact sensitive inputs in logs/traces.
   - 14.2 Strict rate limits and backoff for external providers; respect provider ToS.

15) **Observability & error handling**
   - 15.1 Structured logs for tool calls, durations, cache hits/misses, and errors.
   - 15.2 User-visible soft errors with graceful fallbacks (e.g., stale cached insights labeled as such).

### 5. Non-Goals (Out of Scope for v1)
- Automated procurement/ordering or staff scheduling changes.
- Payment/refund operations or changes to POS records.
- Off-platform notifications (Email/Slack) and PDF report generation (may come later).
- Multi-agent orchestration as default (will be designed for, but not enabled by default in v1).

### 6. Design Considerations (UI/UX)
- Use existing chat and dashboard components:
  - `client/src/components/chat/chat-interface.tsx`, `message-bubble.tsx` for interaction.
  - `components/sales/*`, `components/charts/*`, and `components/ui/*` for visualizations.
- Present source citations inline for external data.
- For voice: announce tool execution to “buy time” during long calls; keep transcripts enabled so text shows in history.
- Provide “Explain this” and “Why?” affordances that request diagnostic context from Alex.

### 7. Technical Considerations (SDK best practices)
1) **Agent definition (text)**
   - Use `@openai/agents` with instructions prefixed by `RECOMMENDED_PROMPT_PREFIX`.
   - Consider storing prompt via `prompt: { promptId, version, variables }` to version Alex’s core behavior.

2) **Realtime Agent (voice)**
   - Use `@openai/agents/realtime` in browser; tools execute where the session runs. For sensitive actions, tools should call backend endpoints.
   - Enable transcripts for text history; note that interrupted responses may lack transcripts.

3) **Tools**
   - Define tools with `zod` schemas and concise descriptions; validate inputs; add `needsApproval: true` for sensitive calls.
   - DB analytics tool executes whitelisted server-side aggregations only; no raw SQL from the LLM.
   - Web/events and weather tools run on server; include provider, parameters, and source citation in results.

4) **Handoffs and agents-as-tools**
   - Future: use `agent.asTool()` for summarization/report writing; or explicit handoff to specialized agents for forecasting or event scouting.

5) **Local MCP (optional later)**
   - Optionally expose local tools via MCP server and attach to agent for filesystem or other local capabilities.

6) **Caching & background jobs**
   - Precompute daily aggregates on schedule; cache common queries; background long-running forecasts and push updates to UI.

7) **Tracing & evals**
   - Enable SDK tracing. In Phase 2, add business evals and UI feedback for continuous improvement.

### 8. Acceptance Criteria
- Text chat returns descriptive insight queries within 3 seconds P95 for cached aggregates.
- Weather, events, and holiday enrichment show attributed sources in responses.
- 7/30-day daily and 12-week weekly forecasts are generated and visualized; uncertainty is communicated.
- Sensitive/expensive tool calls emit approval requests and are blockable from the UI.
- Voice agent supports asking questions and reading out synthesized summaries; transcripts appear in chat history.
- Tracing is enabled; errors surface with actionable messages.

### 9. Success Metrics
- **Time-to-insight reduction**: -50% vs current manual workflows.
- **Forecast accuracy**: MAPE ≤ 15% on 7-day horizon, ≤ 20% on 30-day, ≤ 25% weekly 12-week.
- **Engagement**: ≥ 3 weekly active insight sessions per active venue manager; ≥ 30% of sessions use follow-up questions.
- **Anomaly detection utility**: ≥ 60% of flagged anomalies acknowledged as useful by users (thumbs up or action taken).
- **SLA**: ≥ 95% of descriptive queries under 3s; ≥ 99% tool call success rate with retries.

### 10. Open Questions
- Which specific event and weather providers should we use first (cost, coverage, reliability)? E.g., Open‑Meteo vs. OpenWeather; Ticketmaster vs. Eventbrite vs. PredictHQ.
- Do we have roster and inventory data available now, or should those be stubbed and added later?
- Do HQ analysts require cross-venue rollups in v1, or is venue-scoped sufficient for initial release?
- Any regulatory or brand requirements for voice features (e.g., explicit consent notices)?

### 11. Implementation Notes (grounded in current codebase)
- UI integration with `client/src/components/chat/*` and existing sales widgets (`components/sales/*`) for presenting insights.
- Server integration in `server/services/agent.ts` and `server/services/openai.ts` to instantiate the Agent and tools. Add dedicated server endpoints for external data tools with normalization and caching.
- Preserve existing context under `context/*.json`; elevate key parts into Alex’s core system prompt and keep appendices for domain specifics.
- Enforce venue/org scoping via existing hooks (e.g., `client/src/hooks/useAuth.ts`) and server-side checks.


