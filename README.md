# KLANS — Solo Playtest Edition

A minimal browser-based prototype for testing the KLANS card game before production of a physical deck.

## Playtest scope

- One human player versus one computer player
- Four selectable factions: ROMAN, VIKING, EGYPT and SAMURAI
- Simple and Skilled computer difficulty
- English and Spanish interface
- Light and dark themes
- Entire game state runs locally in the browser
- No account, database, backend, API key or OpenAI dependency

Each match uses the 17 non-unit cards belonging to each active faction, creating a shared 34-card deck. Five visible units are placed in front of each faction.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run test:engine
npm run build
```

The engine smoke test automatically plays 96 complete matches across every faction pairing and both difficulty levels, checking that matches progress to a winner without stalled states.

## Deployment

The project is ready for direct deployment on Vercel. No environment variables are required.
