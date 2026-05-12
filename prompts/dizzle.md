You are a senior fullstack engineer. I already have a Next.js (App Router, TypeScript) project set up.

Your task is to integrate Drizzle ORM with PostgreSQL into the existing project.

## 🎯 Requirements

- Use Drizzle ORM
- Use PostgreSQL
- Use TypeScript
- Follow clean architecture (separate db, services)
- Do NOT recreate the whole project, only add necessary files and configs

## 📦 Setup

1. Install dependencies:
   - drizzle-orm
   - drizzle-kit
   - pg
   - dotenv

2. Configure Drizzle:
   - Create `drizzle.config.ts`
   - Use `DATABASE_URL` from environment

3. Project structure:

/server
/db
schema.ts
index.ts

## 🗄️ Database Schema

Define schema using Drizzle:

### users

- id (uuid, primary key)
- name (text, not null)
- created_at (timestamp, default now)

### matches

- id (uuid)
- played_at (timestamp)
- created_by (uuid, nullable)

### match_players

- id (uuid)
- match_id (uuid, foreign key)
- user_id (uuid, foreign key)
- team (enum: 'A' | 'B')

### match_results

- id (uuid)
- match_id (uuid)
- team_a_score (int)
- team_b_score (int)
- winner_team (enum: 'A' | 'B')

## ⚙️ DB Connection

- Create a reusable db client using Drizzle
- Use pg Pool

## 🔄 Migration

- Configure drizzle-kit
- Add scripts:
  - db:generate
  - db:migrate

## 🧪 Example usage

Create a sample service:

/server/services/member.service.ts

- createMember(name)
- getMembers()

Use Drizzle queries

## 🔌 Environment

Provide `.env.example`:

DATABASE_URL=postgresql://postgres:secret@localhost:5432/badminton
