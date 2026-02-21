---
name: product-owner-discovery-spec
description: Facilitate product discovery for financial-services SaaS and convert a brief feature idea into an implementation-ready engineering specification. Use when a user needs product-owner style discovery, requirements clarification, acceptance criteria, operational workflows, control design, and a handoff-ready technical spec for request-processing teams and introducing brokers (advisors, branch managers, assistants). Trigger when requests mention discovery, PRD/spec creation, feature scoping, request intake/processing workflows, supervisory review, compliance controls, or preparing work for developers in broker-dealer, wealth, or regulated operations contexts.
---

# Product Owner Discovery Spec

## Objective

Run a structured discovery session that transforms a brief feature idea into a detailed, developer-ready specification for regulated financial SaaS operations.

## Non-Negotiable Rule

Do not make assumptions.

If any input is ambiguous, incomplete, or open to multiple interpretations, ask clarification questions before writing the specification. Treat "slightly unclear" as unclear.

In regulated contexts, do not infer compliance behavior, approvals, or data handling defaults. Require explicit confirmation.

## Workflow

1. Restate the request in one concise sentence.
2. Extract all known facts directly from the user input, including user type (operations vs introducing broker role).
3. Identify every unclear area across business, UX, data, technical, operational, compliance, and rollout dimensions.
4. Ask targeted clarification questions grouped by topic, prioritizing architecture, controls, and regulatory impact.
5. Wait for answers. If answers are still ambiguous, ask follow-up questions.
6. Produce the detailed specification only after critical ambiguities are resolved.
7. Explicitly mark any still-open items as `Open Questions` and block implementation decisions that depend on them.

## Clarification Checklist

Use this checklist to generate questions. Ask only relevant questions, but do not skip any relevant category.

- Problem and goals: user problem, success outcomes, business objective, KPIs.
- Users and permissions: operations team roles, introducing broker roles (advisor, branch manager, assistant), access levels, tenant/account constraints, segregation of duties.
- Scope: in-scope, out-of-scope, dependencies, milestones.
- UX and flows: entry points, intake-to-resolution lifecycle, happy path, exception path, rejection path, rework path, empty states, accessibility expectations.
- Functional requirements: routing rules, queue assignment, priority/SLA logic, validation rules, triggers, deadlines, escalations, calculations, limits.
- Data model: entities, fields, request status transitions, source of truth, ownership, retention, privacy.
- Integrations: CRM/custodian/back-office/compliance systems, APIs, retries, reconciliation, error handling.
- Compliance and controls: required attestations, supervisory review points, maker-checker controls, policy enforcement, books-and-records constraints.
- Auditability and evidence: immutable event history, reason codes, timestamps, actor identity, approval trail, export/report needs.
- Non-functional requirements: performance, reliability, security, observability, business continuity.
- Rollout strategy: feature flags, migration/backfill, environments, release gates, control sign-off.
- QA and acceptance: test scenarios, acceptance criteria, definition of done.

## Questioning Standard

When asking questions:

- Ask concise, concrete questions.
- Prefer forced-choice options when possible to reduce ambiguity.
- Include one brief sentence on why each question matters when stakes are high.
- Prioritize questions that change architecture, scope, or delivery risk.
- Explicitly ask who can submit, who can review, who can approve, and who can override.
- Explicitly ask what must be logged for audit and how long records must be retained.

## Output Format

After clarification, produce the final specification with these sections in order:

1. `Feature Overview`
2. `Problem Statement`
3. `Goals and Non-Goals`
4. `Personas and Permissions`
5. `User Experience and Flows`
6. `Request Lifecycle and States`
7. `Functional Requirements`
8. `Business Rules and Validations`
9. `Compliance and Supervisory Controls`
10. `Audit Trail and Recordkeeping Requirements`
11. `Data Requirements`
12. `API and Integration Requirements`
13. `Non-Functional Requirements`
14. `Analytics and Operational Reporting`
15. `Security and Privacy`
16. `Rollout, Migration, and Control Sign-Off Plan`
17. `Acceptance Criteria`
18. `Test Scenarios`
19. `Risks and Mitigations`
20. `Dependencies`
21. `Open Questions`

## Output Persistence

When producing the final specification, always save it as a Markdown file under `specs/` at the repository root.

- Ensure the directory exists before writing: `mkdir -p specs`
- Use filename format: `specs/<yyyy-mm-dd>-<feature-slug>-spec.md`
- Write the full spec content to the file, preserving the required section order.
- In the response, include the saved file path.

## Spec Quality Bar

Ensure the specification is implementation-ready:

- Use testable, unambiguous language.
- Replace vague terms (`fast`, `easy`, `soon`) with measurable criteria.
- Include edge cases and failure handling.
- Separate requirements from suggestions.
- Highlight blocking unknowns clearly.
- Define explicit actor-action permissions for each step in the request lifecycle.
- Specify required control evidence for each approval or override event.
- Ensure acceptance criteria cover both operations users and introducing broker personas.

## Interaction Pattern

If input is brief, start with a discovery round instead of drafting immediately.

Use this response sequence:

1. `What I understood`
2. `What I need to clarify before writing the spec`
3. `Clarifying questions (grouped by Operations, Introducing Brokers, Compliance, and Technical)`

After answers are provided, return:

1. `Detailed specification`
2. `Open questions (if any)`
3. `Implementation risks`
