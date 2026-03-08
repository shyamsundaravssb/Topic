# Topic

A modern, full-stack community discussion platform where users can explore topics, publish articles with a rich-text editor, vote, and engage in threaded discussions — powered by an AI research agent that can autonomously write and publish content.

## Features

- **Topics & Articles** — Browse community-created topics and read in-depth articles with rich formatting
- **Rich Text Editor** — Write articles using a TipTap-powered editor with link support, typography enhancements, and a formatting toolbar
- **Voting System** — Upvote or downvote articles to surface the best content
- **Threaded Discussions** — Nested comment threads on every article for in-depth conversation
- **AI Research Agent** — An autonomous LangGraph agent (Groq LLM + Tavily search) that analyzes topics, researches the web, writes articles, and publishes them
- **Authentication** — Hybrid auth with Google OAuth and email/password credentials via NextAuth v5, including email verification and password reset flows
- **User Profiles** — Profile completion flow with bio, date of birth, and username
- **Dark / Light Mode** — Theme toggle powered by `next-themes`
- **Topic Search** — Search and discover topics from the landing page
- **Browser Extension API** — Backend endpoints for a companion browser extension

## Tech Stack

| Layer              | Technology                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router)                                                                                |
| **Language**       | TypeScript                                                                                                                    |
| **Database**       | PostgreSQL via [Prisma ORM](https://www.prisma.io/)                                                                           |
| **Authentication** | [NextAuth v5](https://authjs.dev/) (Google OAuth + Credentials)                                                               |
| **AI / LLM**       | [LangChain](https://js.langchain.com/) + [LangGraph](https://langchain-ai.github.io/langgraphjs/) + [Groq](https://groq.com/) |
| **Web Search**     | [Tavily](https://tavily.com/)                                                                                                 |
| **Rich Text**      | [TipTap](https://tiptap.dev/)                                                                                                 |
| **UI Components**  | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)                                                   |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/)                                                                                   |
| **Email**          | [Resend](https://resend.com/)                                                                                                 |
| **Validation**     | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)                                                     |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # API endpoints (auth, cron)
│   ├── article/            # Article view pages
│   ├── auth/               # Auth pages (login, register, reset, verify)
│   ├── dashboard/          # Authenticated dashboard
│   ├── topic/              # Topic detail pages
│   └── user/               # User profile pages
├── components/             # Shared UI components (editor, toolbar, theme)
├── data/                   # Data access utilities
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries (db client, helpers)
├── modules/                # Feature modules
│   ├── ai/                 # LangGraph agent (analyst → planner → researcher → writer → publisher)
│   ├── articles/           # Article actions & components
│   ├── auth/               # Auth actions & components
│   ├── topics/             # Topic actions & components
│   └── users/              # User actions & components
├── schemas/                # Zod validation schemas
├── auth.ts                 # NextAuth configuration
├── middleware.ts           # Route protection middleware
└── routes.ts               # Route definitions
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration history
└── seed-bot.ts             # Bot user seeder
```

## Database Schema

The PostgreSQL database includes the following models:

- **User** — Supports both OAuth and credential-based accounts, with profile fields and a bot flag
- **Account** — OAuth provider accounts (Google) linked to users
- **Topic** — Community-created topics that group related articles
- **Article** — Rich text content published under topics by users
- **Vote** — Upvote/downvote per user per article
- **Discussion** — Threaded comments on articles with self-referencing parent/child relations
- **VerificationToken / PasswordResetToken** — Email verification and password reset tokens

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) database
- API keys for: [Groq](https://console.groq.com/), [Tavily](https://tavily.com/), [Resend](https://resend.com/), [Google OAuth](https://console.cloud.google.com/)

### 1. Clone the repository

```bash
git clone <repository-url>
cd topic
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/topic_db?schema=public"

# Auth.js
AUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Google OAuth
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Email (Resend)
RESEND_API_KEY="<your-resend-api-key>"

# AI Agent
GROQ_API_KEY="<your-groq-api-key>"
TAVILY_API_KEY="<your-tavily-api-key>"
```

### 4. Set up the database

```bash
# Generate the Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the bot user
npx ts-node prisma/seed-bot.ts
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## AI Agent Pipeline

The AI research agent uses a multi-node LangGraph state graph:

```
Analyst → Planner → Researcher → Writer → Publisher
```

1. **Analyst** — Analyzes the topic and determines a research mission
2. **Planner** — Creates a structured research plan
3. **Researcher** — Uses Tavily to search the web for relevant information
4. **Writer** — Synthesizes research into a polished article
5. **Publisher** — Saves the article to the database

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## License

This project is private and not licensed for redistribution.
