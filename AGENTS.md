# Pitaya Vision — AGENTS.md

> **Vision** is the Creative Suite of the PitayaCore ecosystem.

---

# Product Philosophy

Vision is **NOT**:

* an AI playground
* a prompt editor
* a ComfyUI frontend
* a model testing application
* an administration dashboard

Vision **IS**:

* a Creative Operating System
* an AI-powered Creative Suite
* a business productivity platform
* the first official vertical of PitayaCore

Every implementation must answer one question:

> **Does this help customers create better creative work?**

If the answer is **No**, reconsider the implementation.

---

# Core Principles

Always follow these principles.

## Validate First

Build the smallest valuable solution.

Avoid unnecessary complexity.

---

## Scale Later

Do not design enterprise architectures before validation.

Avoid premature optimization.

---

## Reuse Before Building

Before implementing a feature ask:

* Can PitayaCore already do this?
* Can another Suite reuse this?
* Should this become part of PitayaCore?

If yes:

Implement it in PitayaCore.

---

## Platform First

PitayaCore is the platform.

Vision is a vertical.

Vision consumes capabilities.

PitayaCore owns business logic.

---

# Architecture

```
Vision React (PWA)

        │

        ▼

Vision API (NestJS)

        │

        ▼

PitayaCore API

        │

        ▼

Suites

Identity

Agents

Skills

Characters

Assets

Credits

Providers

Knowledge

Memory

Creative Runtime
```

---

# Quick Start

```bash
# API (NestJS :3016)
cd api
npm install
npm run start:dev

# Web (Vite :3000, proxies /api → :3016)
cd web
npm install
npm run dev
```

Build & verify:
```bash
cd api
npm run build        # nest build
npm run lint         # eslint --fix
npm run test         # jest

cd web
npm run build        # tsc -b && vite build
```

Prisma (dual schema — MySQL + Postgres):
```bash
cd api
npm run prisma:generate   # generates both clients
npm run prisma:migrate    # pushes both schemas
```

---

# Architecture

```
web (:3000) ──Vite proxy──▶ api (:3016) ──POST──▶ PitayaCore (remote)
                             │                      pitayacore-api.pitayacode.io
                             │                      /api/agents/creative-director/chat
                             │                      /api/tenants/:id/chat-sessions/:id/messages
                             ├─ MySQL (pitayavisual_db)
                             └─ Postgres (pitayavisual_vector)
```

- **web/**: React + Vite + Tailwind. Proxies `/api` requests to NestJS on `:3016`.
- **api/**: NestJS monolith. Modules: `ai`, `chat`, `campaign`, `asset`, `brand`, `character`, `storage`, `dashboard`.
- **Docker**: `docker-compose.yml` uses external `pitaya_net` network (shared with PitayaCore stack).

---

# Agent Service — CRITICAL

**NEVER use OpenAI directly.** All agents run on remote PitayaCore.

**Always use production as default:** `https://pitayacore-api.pitayacode.io`

Endpoint: `POST https://pitayacore-api.pitayacode.io/api/agents/creative-director/chat`

Headers:
```
Content-Type: application/json
x-api-key: {PITAYACORE_API_KEY}
x-user-role: ADMIN
x-tenant-id: {tenantId}
```

Body: `{ "message": "..." }`

Response: `{ "content": "...", "role": "assistant", "conversationId": "..." }`

The `content` contains conversational text with embedded JSON. The `AgentService` extracts JSON with regex `/\{[\s\S]*\}/`.

Fallback order: PitayaCore remote → hardcoded response (if remote fails).

**NO OpenAI fallback.** Only the PitayaCore remote agent is used.

Source: `api/src/modules/ai/agent.service.ts`

---

# Image Generation — Fal.ai (CRITICAL)

**ALL images are generated via remote Fal.ai in PitayaCore.** NO local fallback.

Vision's ChatService calls PitayaCore's endpoint which handles the entire pipeline:
- Creative strategy (via Gemini)
- Image generation (via Fal.ai FLUX)
- Returns generated image URL

Endpoint: `POST /api/tenants/:tenantId/chat-sessions/:id/messages`

**NEVER** generate images locally. If PitayaCore fails, propagate the error.

Source: `api/src/modules/chat/chat.service.ts`

---

# Environment Variables

**API** (`api/.env`):
| Variable | Value |
|----------|-------|
| `PITAYACORE_URL` | `https://pitayacore-api.pitayacode.io` |
| `PITAYACORE_API_KEY` | `{your_pitayacore_api_key}` |
| `DATABASE_URL` | MySQL — `pitayavisual_db` |
| `VECTOR_DATABASE_URL` | Postgres — `pitayavisual_vector` |

**Web** (`web/.env`):
| Variable | Value |
|----------|-------|
| `VITE_PITAYACORE_URL` | `https://pitayacore-api.pitayacode.io` |
| `VITE_PITAYACORE_API_KEY` | `{your_pitayacore_api_key}` |

---

# PitayaCore Connection

**DEFAULT: Always use production** — `https://pitayacore-api.pitayacode.io`

| Env | URL |
|-----|-----|
| Production (default) | `https://pitayacore-api.pitayacode.io` |
| Local (development only) | `http://localhost:3014` |

Health check: `GET {url}/api/api/health` → `{ "status": "ok" }`

The web frontend has a Settings page that tests connectivity and stores the active connection in `localStorage` (`pitaya_vision_active_connection`).

---

# Technology Stack

Frontend

* React
* Vite
* TypeScript
* TailwindCSS
* ShadCN UI
* React Query
* React Hook Form

Backend

* NestJS
* Prisma
* TypeScript

Database

* MySQL
* PostgreSQL + pgvector

Infrastructure

* Docker
* Docker Compose

Storage

* Cloudflare R2

---

Frontend

* React
* Vite
* TypeScript
* TailwindCSS
* ShadCN UI
* React Query
* React Hook Form

Backend

* NestJS
* Prisma
* TypeScript

Database

* MySQL
* PostgreSQL + pgvector

Infrastructure

* Docker
* Docker Compose

Storage

* Cloudflare R2

---

# Vision Responsibilities

Vision owns:

* User Experience
* User Interface
* Creative Workflows
* Creative Chat
* Campaign Experience
* Character Experience
* Brand Experience
* Asset Experience

Vision should NOT own:

* Authentication
* Agent Runtime
* Prompt Engineering
* Credits
* AI Providers
* Character Registry
* Asset Registry
* Business Rules

---

# PitayaCore Responsibilities

PitayaCore owns:

* Identity
* Agents
* Skills
* Credits
* Assets
* Characters
* Providers
* Memory
* Knowledge
* Feature Flags
* Runtime
* AI orchestration

PitayaCore is the single source of truth.

---

# PitayaCore First

Before implementing anything ask:

Can this capability live in PitayaCore?

If yes:

Implement there.

Vision consumes APIs.

Never duplicate:

* Authentication
* Characters
* Assets
* Credits
* Skills
* Agents
* Providers
* Feature Flags

---

# AI Provider Abstraction

Vision must never know which provider generates content.

Vision only requests:

* Generate Image
* Generate Video
* Analyze Image
* Edit Image

PitayaCore selects:

* Gemini
* Fal.ai
* Nano Banana
* Flux
* ComfyUI
* OpenAI
* Future providers

Never hardcode providers inside Vision.

---

# AI Agents

All AI agents live in PitayaCore.

Vision invokes them.

Never place prompt engineering inside React components.

Never place prompt engineering inside controllers.

Prompts belong to Agent Registry.

Business workflows belong to PitayaCore.

---

# Current Production Agent

Default:

Creative Director

Endpoint:

POST

/api/agents/creative-director/chat

Headers

Content-Type: application/json

x-api-key

x-user-role

x-tenant-id

Never bypass this service.

---

# Image Generation

Vision never generates images directly.

Vision requests image generation.

PitayaCore performs:

Creative Strategy

↓

Agent Orchestration

↓

Provider Selection

↓

Image Generation

↓

Asset Registration

↓

Response

Current production provider:

Fal.ai

Future providers may change without requiring Vision modifications.

---

# Creative Philosophy

Vision should always feel closer to:

* Canva
* Adobe Express
* Figma
* Notion
* ChatGPT

Never imitate:

* ERP
* CRM
* Monitoring Dashboard
* AI Playground

---

# UX Principles

Users create.

Users do NOT configure AI.

Avoid exposing:

* LoRA
* Embeddings
* Pipelines
* Prompt Engineering
* Providers
* Models

Users interact with:

* Creative Chat
* Characters
* Brands
* Campaigns
* Assets

---

# Dashboard Principles

The dashboard exists to inspire creation.

Not to display analytics.

Priority order:

1. Create

2. Continue Working

3. Characters

4. Campaigns

5. Assets

6. Insights

Analytics belong to a dedicated Analytics page.

---

# Character Philosophy

Characters are strategic reusable assets.

A Character may participate in:

* Campaigns
* Brands
* Workflows
* Multiple verticals

Characters must never depend on:

* Nano Banana
* Flux
* ComfyUI

Characters are provider-independent.

---

# Code Style

Prefer:

Composition over inheritance.

Small React components.

Reusable hooks.

Reusable UI components.

Thin controllers.

Business logic inside services.

No duplicated logic.

Use feature folders.

Follow existing architecture.

---

# Component Rules

Avoid components larger than 300 lines.

Extract:

* hooks
* dialogs
* forms
* cards
* utilities

Keep components readable.

---

# API Rules

Never access databases directly from Vision frontend.

Always use:

NestJS API

↓

PitayaCore API

↓

Business Logic

↓

Database

---

# Environment

Default environment:

Production

```
PITAYACORE_URL=https://pitayacore-api.pitayacode.io
```

Local only for development.

Never hardcode URLs.

---

# Security

Never commit:

* API Keys
* Tokens
* Passwords
* Secrets

Use environment variables.

Rotate exposed credentials immediately.

Never expose secrets in logs.

---

# Build Philosophy

Before implementing any feature ask:

Does this generate customer value?

Can another vertical reuse it?

Should this live in PitayaCore?

Can it remain provider-independent?

If the answer is no,

redesign before coding.

---

# Product Direction

Vision is building a Creative Operating System.

The experience must feel:

Simple

Elegant

Creative

Professional

Premium

Business-focused

Never expose technical AI complexity.

Hide complexity.

Expose creativity.

---

# Golden Rule

Always optimize for:

Customer Value

↓

Business Outcomes

↓

Reusability

↓

Maintainability

↓

Technical Elegance

Never optimize for technology before validating customer value.
