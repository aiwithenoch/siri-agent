# Siri Agent

Turn the Siri already on your iPhone into a personal AI agent that can reason, remember context, and take actions across your connected apps.

## Vision

Siri Agent connects a real Apple Shortcut to a secure webhook. The backend interprets the request, uses Composio to call tools such as Gmail and Google Calendar, stores user-specific memory in MongoDB Atlas, and returns a short response for Siri to speak.

```text
iPhone Siri -> Apple Shortcut -> Agent API -> Composio tools
                                      |
                                      +-> MongoDB memory
```

This repository currently contains the public landing page and interactive product simulation. The backend will be added incrementally.

## Stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS
- Vercel
- MongoDB Atlas (backend foundation)
- Composio (planned tool connections)

## Local development

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validate a production build

```bash
pnpm build
```

## Environment variables

Backend work will use:

```text
MONGODB_URI=
```

Never commit `.env` files or credentials. Environment files are ignored by Git.

## Roadmap

- Siri Shortcut onboarding
- Authenticated webhook API
- Per-user MongoDB memory
- Composio account connections and tool calling
- Streaming and spoken responses
- Audit log and permission controls

## Contributing

Issues and pull requests are welcome. Please avoid committing credentials, personal data, or production connection strings.

## License

MIT
