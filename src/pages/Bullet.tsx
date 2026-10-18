import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, Swords, Timer, Trophy, Zap } from 'lucide-react';
import { Board } from '../components/Board';
import { Avatar, Markdown, Piece, PlayerBar } from '../components/ui';
import { BOTS, type Bot } from '../bots';
import { botRatingHistory, currentRating, isBullet, store, tcLabel, type GameRecord, type RushRecord } from '../lib/data';
import { navigate } from '../router';
import type { GameSetup } from '../components/Home';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const TIME_CONTROLS = [
  { base: 30, inc: 0, hint: 'Ultrabullet' },
  { base: 60, inc: 0, hint: 'Klassisches Bullet' },
  { base: 60, inc: 1, hint: 'Mit Inkrement' },
  { base: 120, inc: 1, hint: 'Etwas ruhiger' },
  { base: 180, inc: 0, hint: 'Blitz-Übergang' },
];
const RUSH_MODES = [60, 180, 300];

const TIPS = `**Bullet ist ein eigenes Spiel.** Nicht der beste Zug gewinnt, sondern der gute Zug, der schnell kommt.

### Eröffnung
- Spiel **immer dasselbe System** (z. B. Londoner System mit Weiß). Die ersten 8–10 Züge sollten fast ohne Nachdenken kommen.
- Übe deine Eröffnung im Bereich **Lernen → Eröffnungen** im Üben-Modus.

### Zeit
- Plane grob **2–3 Sekunden pro Zug** in 1+0. Wer am Ende mehr Zeit hat, gewinnt oft auch verlorene Stellungen.
- Schnelle Züge in **einfachen Stellungen** sparen Zeit für die kritischen Momente.

### Vorzüge (Premoves)
- Ziehe deine Figur schon, während der Gegner denkt – der Zug wird sofort ausgeführt.
- Ideal für **erzwungene Antworten**: Zurückschlagen, Bauernvorstöße im Endspiel, Rochade.
- Vorsicht: Nie einen Premove machen, wenn der Gegner deine Figur einfach schlagen kann.

### Stellungen
- **Vereinfachen** wenn du vorne bist: Tauschen, Damen runter.
- **Komplex machen** wenn du hinten bist oder mehr Zeit hast.
- Vor jedem Zug ein Blitz-Check: **Schach? Schlagen? Hängt etwas?**

### Am Ende
- Mit wenig Zeit: Bauern und König schnell ziehen, Figuren vom Rand fernhalten, auf Zeit spielen ist legitim.`;

export function Bullet({ onStart }: { onStart: (s: GameSetup) => void }) {
  const [tab, setTab] = useState<'play' | 'rush' | 'tips'>(() => (localStorage.getItem('bulletTab') as any) ?? 'play');
  const [tcIdx, setTcIdx] = useState(() => Number(localStorage.getItem('bulletTc') ?? 1));
  const [bot, setBot] = useState<Bot>(() => BOTS.find((b) => b.id === localStorage.getItem('bulletBot')) ?? BOTS.find((b) => b.id === 'lena')!);
  const [color, setColor] = useState<'w' | 'b' | 'r'>('r');
  const [games, setGames] = useState<GameRecord[]>([]);
  const [rush, setRush] = useState<RushRecord[]>([]);

  useEffect(() => {
    store.list('games').then(setGames).catch(() => {});
    store.list('rush').then(setRush).catch(() => {});
  }, []);
  useEffect(() => {
    localStorage.setItem('bulletTab', tab);
  }, [tab]);

  const bullet = useMemo(() => games.filter(isBullet), [games]);
  const rating = currentRating(botRatingHistory(bullet), 800);
  const wins = bullet.filter((g) => g.result === 'win').length;
  const flags = bullet.filter((g) => g.reason.includes('Zeit') && g.result === 'loss').length;
  const tc = TIME_CONTROLS[tcIdx] ?? TIME_CONTROLS[1];

  function start() {
    localStorage.setItem('bulletTc', String(tcIdx));
    localStorage.setItem('bulletBot', bot.id);
    onStart({
      bot,
      color: color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : color,
      coach: false,
      timeControl: { base: tc.base, inc: tc.inc },
      backTo: 'bullet',
    });
  }

  return (
    <div className="layout">
      <div className="board-col">
        <PlayerBar avatar={bot.id} name={bot.name} rating={bot.rating} right={<div className="clock">{tcLabel(tc)}</div>} />
        <div className="board-wrap">
          <Board fen={START} orientation={color === 'b' ? 'black' : 'white'} movable={null} onMove={() => {}} viewOnly />
        </div>
        <PlayerBar avatar="you" name="Du" rating={bullet.length ? rating : undefined} right={<div className="clock">{tcLabel(tc)}</div>} />
      </div>

      <section className="panel">
        <header className="panel-head">
          <Zap size={22} />
          <h1>Bullet-Training</h1>
        </header>
        <div className="seg-tabs flat">
          <button className={tab === 'play' ? 'on' : ''} onClick={() => setTab('play')}>
            <Swords size={15} /> Spielen
          </button>
          <button className={tab === 'rush' ? 'on' : ''} onClick={() => setTab('rush')}>
            <Zap size={15} /> Puzzle Rush
          </button>
          <button className={tab === 'tips' ? 'on' : ''} onClick={() => setTab('tips')}>
            <Lightbulb size={15} /> Tipps
          </button>
        </div>

        {tab === 'play' && (
          <>
            <div className="panel-body">
              <div className="stat-row">
                <div>
                  <span>Bullet-Wertung</span>
                  <b>{bullet.length ? rating : '–'}</b>
                </div>
                <div>
                  <span>Siege</span>
                  <b>
                    {wins}/{bullet.length}
                  </b>
                </div>
                <div>
                  <span>Zeit verloren</span>
                  <b>{flags}×</b>
                </div>
              </div>
              <div>
                <div className="field-label">Zeitkontrolle</div>
                <div className="tc-grid">
                  {TIME_CONTROLS.map((t, i) => (
                    <button key={i} className={`tc ${i === tcIdx ? 'on' : ''}`} onClick={() => setTcIdx(i)}>
                      <b>{tcLabel(t)}</b>
                      <span>{t.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="field-label">Gegner</div>
                <div className="bot-grid compact">
                  {BOTS.map((b) => (
                    <button key={b.id} className={`bot-tile ${bot.id === b.id ? 'on' : ''}`} onClick={() => setBot(b)} title={`${b.name} – ${b.styleLabel}`}>
                      <Avatar id={b.id} size={48} />
                      <span>{b.rating}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="hint-text">
                Premoves sind aktiv: Zieh einfach schon, während der Bot denkt. Der Coach schweigt während der Partie und wertet danach in der Analyse aus (inkl. Zeitverbrauch).
              </p>
            </div>
            <footer className="panel-foot">
              <div className="foot-row">
                <span className="foot-label">Ich spiele</span>
                <div className="seg">
                  {(['w', 'r', 'b'] as const).map((c) => (
                    <button key={c} className={color === c ? 'on' : ''} onClick={() => setColor(c)} title={c === 'w' ? 'Weiß' : c === 'b' ? 'Schwarz' : 'Zufällig'}>
                      {c === 'r' ? (
                        <span className="random-king">
                          <Piece type="k" color="w" size={26} />
                          <Piece type="k" color="b" size={26} />
                        </span>
                      ) : (
                        <Piece type="k" color={c} size={26} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn primary xl" onClick={start}>
                <Timer size={22} /> {tcLabel(tc)} spielen
              </button>
            </footer>
          </>
        )}

        {tab === 'rush' && (
          <div className="panel-body">
            <p className="hint-text">Mustererkennung ist im Bullet alles. Löse so viele Aufgaben wie möglich, bevor die Zeit abläuft – die Aufgaben werden immer schwerer, nach 3 Fehlern ist Schluss.</p>
            <div className="rush-modes">
              {RUSH_MODES.map((m) => {
                const runs = rush.filter((r) => r.mode === m);
                const best = Math.max(0, ...runs.map((r) => r.score));
                return (
                  <button key={m} className="rush-mode" onClick={() => navigate(`rush/${m}`)}>
                    <Zap size={22} />
                    <b>
                      {m / 60} {m === 60 ? 'Minute' : 'Minuten'}
                    </b>
                    <span>
                      <Trophy size={13} /> Rekord {best || '–'}
                    </span>
                    <small>{runs.length} Läufe</small>
                  </button>
                );
              })}
            </div>
            {rush.length > 0 && (
              <div className="rush-recent">
                <div className="field-label">Letzte Läufe</div>
                {[...rush]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 6)
                  .map((r) => (
                    <div key={r.id} className="rush-row">
                      <span>{new Date(r.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</span>
                      <span>{r.mode / 60} Min</span>
                      <b>{r.score} gelöst</b>
                      <span className="muted-text">bis {r.maxRating || '–'}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {tab === 'tips' && (
          <div className="panel-body">
            <div className="text tips">
              <Markdown text={TIPS} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
