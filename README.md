# ♞ GPT-Schach

**Schach-Training mit KI-Coach – lokal auf deinem Rechner, mit deinem eigenen ChatGPT-Abo.**
Bots mit Persönlichkeit, ein Coach, der jeden Zug erklärt, unbegrenzt Taktikaufgaben, Lektionen, Eröffnungstrainer, Partie-Analyse, Bullet-Training und Statistiken – ohne weiteres Abo, ohne Konto bei einer Schachseite.

![GPT-Schach – Bots mit Kronen](docs/screenshot-bots.png)

> 🇬🇧 *A local chess trainer in the style of the big chess sites: bots with personalities, a coach that explains every move (powered by your own ChatGPT subscription via “Sign in with ChatGPT”), unlimited puzzles, lessons, opening trainer, game review, bullet training and stats. UI is in German.*

---

## Funktionen

| Bereich | Was du bekommst |
|---|---|
| **Coach** | Spielt auf deinem Niveau, bewertet jeden Zug (Bester Zug … Patzer), erklärt Ideen in Worten, Hinweise in 3 Stufen, Zurücknehmen/Wiederholen, Varianten zum Durchklicken |
| **Bots** | 20 Bots von 250 bis 3200 mit eigenen Spielstilen (Angreifer, Tauscherin, Nachmacher, Gambitspieler …) und **Kronen** zum Freispielen |
| **Erkunden** | Mitten in der Partie frei für beide Seiten ziehen und live sehen, wie Stockfish die Stellung bewertet |
| **Bullet** | Partien mit Schachuhr (30 s – 3+0) und Premoves, **Puzzle Rush**, Auswertung deiner Bedenkzeit |
| **Puzzles** | Unbegrenzte Taktikaufgaben aus der offenen Lichess-Datenbank, Tagesrätsel, eigenes Puzzle-Rating, Themenfilter |
| **Lernen** | 30 Lektionen (Taktik, Mattbilder, Angriff, Endspiele), 16 Eröffnungen zum Üben, Endspieltechnik gegen Stockfish |
| **Analyse** | Jede Partie wird gespeichert: Genauigkeit, Fehler, Bewertungsgraph, Zeitverbrauch, Besprechung durch den Coach; freies Analysebrett mit FEN/PGN |
| **Statistik** | Spielstärke, Puzzle-Rating, Bullet-Wertung, Siegquote früher vs. jetzt, Stärken und Schwächen |

Die Schach-Engine (Stockfish 17.1) läuft direkt im Browser. Der Coach nutzt dein ChatGPT-Konto – ohne Anmeldung funktioniert alles außer den Text-Erklärungen.

## Screenshots

| Puzzles | Lernen | Bullet |
|---|---|---|
| ![Puzzles](docs/screenshot-puzzles.png) | ![Lernen](docs/screenshot-learn.png) | ![Bullet](docs/screenshot-bullet.png) |

## Installation

Du brauchst **[Node.js](https://nodejs.org) ab Version 20** (einfach die LTS-Version installieren) und **[Git](https://git-scm.com)** – oder lade das Repo als ZIP herunter (grüner Knopf „Code“ → „Download ZIP“) und entpacke es.

```bash
git clone https://github.com/Dolcruz/gpt-schach.git
cd gpt-schach
npm install
npm start
```

Der Browser öffnet sich automatisch unter **http://gpt-schach.localhost:8080**. Beim ersten Start wird die App einmal gebaut (ein paar Sekunden). Beenden mit `Strg + C`.

### Windows: Desktop-Symbol

```bash
npm run shortcut
```

Legt „GPT-Schach“ auf dem Desktop und im Startmenü an. Ein Doppelklick startet alles unsichtbar im Hintergrund und öffnet **http://gpt-schach.localhost**. Beenden: `stop.vbs` im Ordner doppelklicken.

### Aktualisieren

```bash
git pull
npm install
```

Beim nächsten Start wird automatisch neu gebaut. Deine Partien und Fortschritte bleiben erhalten.

## Mit ChatGPT anmelden

Links unten auf **„Mit ChatGPT anmelden“** klicken und im Fenster mit deinem ChatGPT-Konto einloggen (gleicher Login wie bei der Codex CLI). Danach wählst du das Coach-Modell und den Denkaufwand.

- Benötigt ein ChatGPT-Abo, mit dem du Codex nutzen kannst (z. B. Plus oder Pro).
- Nutzt du bereits die **Codex CLI oder die Codex-App**, reicht ein Klick auf **„Codex-Login übernehmen“**.
- Für den Login wird kurz der Port `1455` auf deinem Rechner benutzt (wie bei Codex) – nicht gleichzeitig mit einem Codex-Login starten.

## Wo liegen meine Daten?

Alles bleibt auf deinem Rechner im Ordner `data/`:
- `data/auth.json` – deine Anmelde-Tokens (verlassen deinen Rechner nur in Richtung OpenAI)
- `data/store.json` – Partien, Puzzles, Lernfortschritt

Der Server lauscht nur auf `localhost` und ist von anderen Geräten nicht erreichbar.

## Häufige Fragen

**Die Seite öffnet sich nicht?** `*.localhost`-Adressen funktionieren in Chrome, Edge und Firefox automatisch. Alternativ `http://localhost:8080` öffnen.

**Port belegt?** Anderen Port wählen: `PORT=9000 npm start` (Windows PowerShell: `$env:PORT=9000; npm start`).

**Die Modell-Liste ist leer?** Die verfügbaren Modelle hängen von der gemeldeten Codex-Version ab: `CODEX_CLIENT_VERSION=<aktuelle Codex-Version> npm start`.

**Wie stark ist die Engine?** Stockfish 17.1 (WASM). Der Coach rechnet mit Tiefe 18, die Partie-Analyse mit Tiefe 16, die Live-Analyse bis Tiefe 24 – für Spieler bis weit über 2000 Elo verlässlich.

## Entwicklung

```bash
npm run dev      # Server auf :3001 + Vite auf :5173 mit Hot Reload
npm run build    # Typprüfung + Produktions-Build nach dist/
```

Aufbau: `src/` (React-Frontend), `server/` (Login, Coach-Proxy, Datenspeicher, Puzzle-Proxy), `public/engine/` (Stockfish).

## Hinweise

- **Inoffizielles Hobbyprojekt.** Nicht verbunden mit OpenAI, Lichess oder chess.com. Die Anmeldung nutzt denselben Weg wie die offizielle Codex CLI; OpenAI kann diesen jederzeit ändern. Nutzung auf eigene Verantwortung und im Rahmen der Nutzungsbedingungen deines ChatGPT-Abos.
- Die Puzzles stammen aus der [Lichess-Puzzle-Datenbank](https://database.lichess.org/#puzzles) (CC0) und werden über die öffentliche Lichess-API geladen.

## Lizenz & Danksagung

GPT-Schach steht unter der **GNU GPL v3** (siehe [LICENSE](LICENSE)).

- [Stockfish](https://stockfishchess.org) & [stockfish.js](https://github.com/nmrugg/stockfish.js) – GPL-3.0
- [chessground](https://github.com/lichess-org/chessground) (Brett & cburnett-Figuren) – GPL-3.0
- [chess.js](https://github.com/jhlywa/chess.js) – BSD-2-Clause
- [DiceBear](https://www.dicebear.com) (Avatare, Stile „Avataaars“ von Pablo Stanley und „Bottts“ von Pablo Stanley) – siehe dortige Lizenzen
- [Lucide](https://lucide.dev) Icons – ISC
- Puzzles: [Lichess](https://lichess.org) – CC0
