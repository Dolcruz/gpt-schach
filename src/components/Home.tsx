import { L } from '../i18n';
import { useEffect, useMemo, useState } from 'react';
import { Bot as BotIcon, ChevronDown, Crown, Target as TargetIcon, GraduationCap, Lightbulb, MessageSquareText, RotateCcw, Target } from 'lucide-react';
import { BOTS, COACH_BOT, categoryLabel, coachOpponent, type Bot, type Category } from '../bots';
import { Board } from './Board';
import { Avatar, Piece, PlayerBar } from './ui';
import type { Mode } from '../App';
import { store, type GameRecord } from '../lib/data';
import { CROWNS, crownSummary, type CrownId } from '../lib/crowns';

export interface GameSetup {
  bot: Bot;
  color: 'w' | 'b';
  coach: boolean;
  /** Übungsstellung statt Grundstellung (z. B. Endspiel-Training) */
  startFen?: string;
  /** Aufgabe, die im Coach-Feed angezeigt wird */
  goal?: string;
  /** Route, zu der „Menü“ zurückführt */
  backTo?: string;
  /** Schachuhr in Sekunden (z. B. Bullet 60+0) */
  timeControl?: { base: number; inc: number };
}

interface Props {
  mode: Mode;
  loggedIn: boolean;
  onStart: (s: GameSetup) => void;
}

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const CATEGORIES: { id: Category; hint: string }[] = [
  { id: 'Anfänger', hint: '250 – 700' },
  { id: 'Fortgeschritten', hint: '850 – 1500' },
  { id: 'Erfahren', hint: '1600 – 2050' },
  { id: 'Meister', hint: '2100 – 2500' },
  { id: 'Engine', hint: '3200' },
];

function levelName(r: number) {
  return categoryLabel(r < 800 ? 'Anfänger' : r < 1400 ? 'Fortgeschritten' : r < 1900 ? 'Erfahren' : 'Meister');
}

export function Home({ mode, loggedIn, onStart }: Props) {
  const [bot, setBot] = useState<Bot>(() => BOTS.find((b) => b.id === localStorage.getItem('lastBot')) ?? BOTS.find((b) => b.id === 'lena')!);
  const [open, setOpen] = useState<Category>(bot.category);
  const [color, setColor] = useState<'w' | 'b' | 'r'>('w');
  const [coachWithBot, setCoachWithBot] = useState(true);
  const [coachLevel, setCoachLevel] = useState(() => Number(localStorage.getItem('coachLevel') ?? 1000));
  const [games, setGames] = useState<GameRecord[]>([]);
  useEffect(() => {
    store.list('games').then(setGames).catch(() => {});
  }, []);
  const crowns = useMemo(() => crownSummary(games), [games]);
  const pick = (b: Bot) => {
    setBot(b);
    setOpen(b.category);
  };

  const isCoach = mode === 'coach';
  const shown = isCoach ? { ...COACH_BOT, rating: coachLevel } : bot;

  function start() {
    const c = color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    if (isCoach) {
      localStorage.setItem('coachLevel', String(coachLevel));
      onStart({ bot: coachOpponent(coachLevel), color: c, coach: true });
    } else {
      localStorage.setItem('lastBot', bot.id);
      onStart({ bot, color: c, coach: coachWithBot });
    }
  }

  return (
    <div className="layout">
      <div className="board-col">
        <PlayerBar avatar={shown.id} name={shown.name} rating={shown.rating} />
        <div className="board-wrap">
          <Board fen={START} orientation={color === 'b' ? 'black' : 'white'} movable={null} onMove={() => {}} viewOnly />
        </div>
        <PlayerBar avatar="you" name={L('Du', 'You')} />
      </div>

      <section className="panel">
        <header className="panel-head">
          {isCoach ? <GraduationCap size={22} /> : <BotIcon size={22} />}
          <h1>{isCoach ? L('Mit Coach spielen', 'Play with Coach') : L('Gegen Bots spielen', 'Play Bots')}</h1>
        </header>

        <div className="panel-body">
          <div className="hero">
            <Avatar id={shown.id} size={92} className="hero-avatar" />
            <div className="speech">{isCoach ? L('Ich spiele auf deinem Niveau und erkläre dir jeden Zug. Bereit?', "I'll play at your level and explain every move. Ready?") : bot.lines.greet?.[0]}</div>
          </div>
          <div className="hero-name">
            <b>{shown.name}</b>
            <span className="rating">{shown.rating}</span>
            <span className="tag">{isCoach ? levelName(coachLevel) : bot.styleLabel}</span>
          </div>
          {!isCoach && <CrownGoals have={crowns.per.get(bot.id) ?? new Set()} />}

          {isCoach ? (
            <>
              <div className="level">
                <div className="level-head">
                  <span>{L('Spielstärke', 'Strength')}</span>
                  <b>{coachLevel}</b>
                </div>
                <input
                  type="range"
                  min={400}
                  max={2400}
                  step={100}
                  value={coachLevel}
                  onChange={(e) => setCoachLevel(Number(e.target.value))}
                  style={{ ['--p' as any]: `${((coachLevel - 400) / 2000) * 100}%` }}
                />
                <div className="level-scale">
                  <span>{categoryLabel('Anfänger')}</span>
                  <span>{categoryLabel('Meister')}</span>
                </div>
              </div>
              <ul className="features">
                <li>
                  <Target size={18} /> {L('Bewertet jeden Zug – vom besten Zug bis zum Patzer', 'Rates every move – from best move to blunder')}
                </li>
                <li>
                  <MessageSquareText size={18} /> {L('Erklärt Ideen, Drohungen und Pläne in Worten', 'Explains ideas, threats and plans in plain words')}
                </li>
                <li>
                  <Lightbulb size={18} /> {L('Hinweise in drei Stufen, wenn du feststeckst', "Hints in three steps when you're stuck")}
                </li>
                <li>
                  <RotateCcw size={18} /> {L('Fehler zurücknehmen und nochmal versuchen', 'Take back mistakes and try again')}
                </li>
              </ul>
              {!loggedIn && <p className="note">{L('Ohne Anmeldung zeigt der Coach nur Engine-Bewertungen. Melde dich links unten mit ChatGPT an.', 'Without signing in, the coach only shows engine ratings. Sign in with ChatGPT at the bottom left.')}</p>}
            </>
          ) : (
            <div className="categories">
              <div className="crown-progress">
                <div className="cp-top">
                  <Crown size={20} />
                  <b>
                    {crowns.earned} / {crowns.total} {L('Kronen', 'crowns')}
                  </b>
                  <span>
                    {L(`${crowns.beaten} von ${BOTS.length} Bots besiegt`, `${crowns.beaten} of ${BOTS.length} bots defeated`)}
                  </span>
                </div>
                <div className="progress">
                  <i style={{ width: `${(crowns.earned / crowns.total) * 100}%` }} />
                </div>
                {crowns.next ? (
                  <button className="next-opponent" onClick={() => pick(crowns.next!)}>
                    <TargetIcon size={15} /> {L('Nächster Gegner:', 'Next opponent:')}
                    <Avatar id={crowns.next.id} size={22} />
                    <b>{crowns.next.name}</b>
                    <span className="rating">{crowns.next.rating}</span>
                  </button>
                ) : (
                  <span className="next-opponent done">{L('Alle Bots besiegt – jetzt alle Kronen holen!', 'All bots defeated – now collect every crown!')}</span>
                )}
              </div>
              {CATEGORIES.map((cat) => {
                const bots = BOTS.filter((b) => b.category === cat.id);
                const isOpen = open === cat.id;
                return (
                  <div key={cat.id} className={`category ${isOpen ? 'open' : ''}`}>
                    <button className="category-head" onClick={() => setOpen(cat.id)}>
                      <div className="category-faces">
                        {bots.slice(0, 3).map((b) => (
                          <Avatar key={b.id} id={b.id} size={28} />
                        ))}
                      </div>
                      <span className="category-name">{categoryLabel(cat.id)}</span>
                      <span className="category-meta">
                        {bots.filter((b) => crowns.per.get(b.id)?.has('win')).length}/{bots.length} {L('besiegt', 'defeated')} · {cat.hint}
                      </span>
                      <ChevronDown size={18} className="chev" />
                    </button>
                    {isOpen && (
                      <div className="bot-grid">
                        {bots.map((b) => (
                          <button key={b.id} className={`bot-tile ${bot.id === b.id ? 'on' : ''} ${crowns.per.get(b.id)?.has('win') ? 'beaten' : ''}`} onClick={() => setBot(b)} title={`${b.name} (${b.rating}) – ${b.styleLabel}`}>
                            <span className="tile-avatar">
                              <Avatar id={b.id} size={64} />
                              <TileCrowns have={crowns.per.get(b.id) ?? new Set()} />
                            </span>
                            <span>{b.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="panel-foot">
          <div className="foot-row">
            <span className="foot-label">{L('Ich spiele', 'I play')}</span>
            <div className="seg">
              {(['w', 'r', 'b'] as const).map((c) => (
                <button key={c} className={color === c ? 'on' : ''} onClick={() => setColor(c)} title={c === 'w' ? L('Weiß', 'White') : c === 'b' ? L('Schwarz', 'Black') : L('Zufällig', 'Random')}>
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
          {!isCoach && (
            <label className="switch-row">
              <span>{L('Coach schaut zu', 'Coach watches')}</span>
              <input type="checkbox" className="switch" checked={coachWithBot} onChange={(e) => setCoachWithBot(e.target.checked)} />
            </label>
          )}
          <button className="btn primary xl" onClick={start}>
            {L('Spielen', 'Play')}
          </button>
        </footer>
      </section>
    </div>
  );
}

/** Kleine Kronen auf dem Bot-Porträt */
function TileCrowns({ have }: { have: Set<CrownId> }) {
  if (!have.size) return null;
  return (
    <span className="tile-crowns" title={L(`${have.size} von ${CROWNS.length} Kronen`, `${have.size} of ${CROWNS.length} crowns`)}>
      {CROWNS.map((c) => (
        <Crown key={c.id} size={11} className={have.has(c.id) ? 'got' : ''} fill={have.has(c.id) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

/** Die drei Kronen-Ziele für den ausgewählten Bot */
function CrownGoals({ have }: { have: Set<CrownId> }) {
  return (
    <div className="crown-goals">
      {CROWNS.map((c) => (
        <div key={c.id} className={`crown-goal ${have.has(c.id) ? 'got' : ''}`} title={c.desc}>
          <Crown size={18} fill={have.has(c.id) ? 'currentColor' : 'none'} />
          <div>
            <b>{c.label}</b>
            <span>{c.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
