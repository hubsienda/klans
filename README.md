# KLANS — Solo Playtest Edition

A browser-based prototype for testing the simplified KLANS card-game loop before producing a physical deck.

## Playtest scope

- One human player versus one rule-based computer player
- ROMAN, VIKING, EGYPT and SAMURAI factions
- Simple and Skilled computer difficulty
- English and Spanish interface
- Light and dark themes
- Five visible units per side
- Forty-card common deck using only the two active factions
- Seven non-unit card types: ATTACK, DEFENCE, DOCTOR, SPY, SACK, SABOTAGE and AMBUSH
- One passive ability per faction, usable once per match
- Enemy-card discard penalties
- All game state runs locally in the browser

There are no accounts, databases, environment variables, external AI services or backend game state.

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

The engine smoke test plays 96 complete automated matches across every faction pairing and both computer difficulty levels. GitHub Actions repeats the type-check, engine suite and production build under Node.js 24.

## Vercel

Import `hubsienda/klans`, use `main` as the production branch and keep the root directory as `./`. No environment variables are required.
