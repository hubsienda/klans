# KLANS

KLANS is the website and browser adaptation for the KLANS tabletop card game.

## Website

The App Router site contains five core routes:

- `/` — KLANS homepage
- `/play` — Human-vs-Computer online adaptation
- `/rules` — complete tabletop rules
- `/factions` — ROMAN, VIKING, EGYPT and SAMURAI, with all twenty supplied unit images
- `/action-cards` — the seven official action-card types using the supplied artwork

The entire site supports English/Spanish and light/dark themes.

## Online adaptation

The browser game is intentionally solo: one human against one rule-based computer. It uses only the two active factions, so the online common deck contains 40 action cards.

The online game implements:

- random starting player
- one-card draw at the beginning of every normal turn
- no fixed action limit
- a five-card end-of-turn hand limit
- reactive DEFENCE
- ATTACK and AMBUSH targeting
- DOCTOR restoration
- SPY hand information
- SACK card transfer
- SABOTAGE skipped turns
- enemy SPY, SACK and SABOTAGE discard penalties
- conquest/victory when the opposing faction loses its last living unit
- SIMPLE and SKILLED rule-based computer opponents

Diplomacy, alliances, exchanges, negotiation and betrayal remain tabletop multiplayer features and are documented on `/rules`; they are not simulated in the Human-vs-Computer browser game.

There are no faction passive abilities in the current rules.

## Architecture

All game state runs locally in React. There are no accounts, databases, backend game sessions, sockets, environment variables or external AI/API calls required for gameplay.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run test:engine
npm run build
```
