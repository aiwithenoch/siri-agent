# Siri Agent

Turn the Siri already on your iPhone into a personal AI agent that can reason, remember context, and take actions across your connected apps.

## Vision

Siri Agent connects a real Apple Shortcut to a secure webhook. The backend interprets the request, uses Composio to call tools such as Gmail and Google Calendar, stores user-specific memory in MongoDB Atlas, and returns a short response for Siri to speak.

```text
iPhone Siri -> Apple Shortcut -> Agent API -> Composio tools
                                      |
                                      +-> MongoDB memory
```

The repository includes the public landing page, live agent onboarding, a secure Siri webhook, and MongoDB-backed conversational memory.

The Apple Shortcut is named `Agent`. The dependable voice flow is: say
“Hey Siri, Agent,” then speak the request when the shortcut starts listening.

## Stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS
- Vercel
- MongoDB Atlas
- Google Gemini
- Composio hosted OAuth connections

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
GEMINI_API_KEY=
COMPOSIO_API_KEY=
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_KEY=
DODO_PAYMENTS_PRODUCT_ID=
DODO_PAYMENTS_ENVIRONMENT=test_mode
NEXT_PUBLIC_APP_URL=https://siriagent.aiwithenoch.com
NEXT_PUBLIC_SHORTCUT_INSTALL_URL=
```

The Dodo product must be a monthly `$5` subscription. Checkout overrides its trial to one day,
requires a credit/debit card mandate, and grants cloud access only after a signed subscription webhook.

`NEXT_PUBLIC_SHORTCUT_INSTALL_URL` is the public iCloud share URL for the prebuilt Apple Shortcut.
The Shortcut asks for the copied private webhook during import, then dictates a request, posts the
`query`, reads the `answer` field, and speaks it.

Never commit `.env` files or credentials. Environment files are ignored by Git.

## Roadmap

- Shareable prebuilt Apple Shortcut
- Account dashboard and webhook revocation
- Execute connected Composio tools from Gemini function calls
- Streaming and spoken responses
- Audit log and permission controls

## Contributing

Issues and pull requests are welcome. Please avoid committing credentials, personal data, or production connection strings.

## License

MIT
