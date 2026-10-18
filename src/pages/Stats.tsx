import { L, locale } from '../i18n';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Crown, Flame, Puzzle, Swords, Target, Timer, TrendingUp, Trophy, Zap } from 'lucide-react';
import { botRatingHistory, currentRating, dayKey, isBullet, puzzleRatingHistory, store, streak, isTimeLoss, type GameRecord, type LessonProgress, type PuzzleAttempt, type RushRecord } from '../lib/data';
import { META_THEMES, themeName } from '../lib/themes';
import { LineChart, GroupedBars } from '../components/Charts';
import { BOTS, categoryLabel, type Category } from '../bots';
import { crownSummary } from '../lib/crowns';
import { navigate } from '../router';

const DAY = 86400000;
const RECENT_DAYS = 30;

function categoryOf(g: GameRecord): Category {
  const b = BOTS.find((x) => x.id === g.botId);
  if (b) return b.category;
  const r = g.botRating;
  return r < 800 ? 'Anfänger' : r < 1600 ? 'Fortgeschritten' : r < 2100 ? 'Erfahren' : r < 3000 ? 'Meister' : 'Engine';
}

function Delta({ v, suffix = '' }: { v: number | null; suffix?: string }) {
  if (v === null || v === 0) return <span className="delta flat">±0{suffix}</span>;
  return (
    <span className={`delta ${v > 0 ? 'up' : 'down'}`}>
      {v > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {v > 0 ? '+' : ''}
      {v}
      {suffix}
    </span>
  );
}

export function Stats() {
  const [games, setGames] = useState<GameRecord[] | null>(null);
  const [puzzles, setPuzzles] = useState<PuzzleAttempt[]>([]);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [rush, setRush] = useState<RushRecord[]>([]);

  useEffect(() => {
    store.list('games').then(setGames).catch(() => setGames([]));
    store.list('puzzles').then(setPuzzles).catch(() => {});
    store.list('lessons').then(setLessons).catch(() => {});
    store.list('rush').then(setRush).catch(() => {});
  }, []);

  const s = useMemo(() => {
    // Normale Wertung ohne Partien mit Uhr – Bullet wird getrennt gewertet
    const gs = (games ?? []).filter((g) => g.mode !== 'practice' && !g.timeControl);
    const bullet = (games ?? []).filter(isBullet);
    const bulletHist = botRatingHistory(bullet);
    const now = Date.now();
    const recentCut = new Date(now - RECENT_DAYS * DAY).toISOString();
    const botHist = botRatingHistory(gs);
    const pzHist = puzzleRatingHistory(puzzles);
    const ratingBefore = (h: { date: string; rating: number }[], start: number) => {
      const older = h.filter((p) => p.date < recentCut);
      return older.length ? older[older.length - 1].rating : start;
    };
    const botR = currentRating(botHist, 800);
    const pzR = currentRating(pzHist, 1200);
    const wins = gs.filter((g) => g.result === 'win').length;
    const draws = gs.filter((g) => g.result === 'draw').length;
    const losses = gs.length - wins - draws;

    const accGames = gs.filter((g) => (g.analysis?.accuracy[g.color] ?? g.accuracy) != null).sort((a, b) => a.date.localeCompare(b.date));
    const accOf = (g: GameRecord) => Math.round((g.analysis?.accuracy[g.color] ?? g.accuracy ?? 0) * 10) / 10;
    const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
    const accRecent = avg(accGames.slice(-10).map(accOf));
    const accOld = accGames.length > 10 ? avg(accGames.slice(0, -10).map(accOf)) : null;

    const cats: Category[] = ['Anfänger', 'Fortgeschritten', 'Erfahren', 'Meister', 'Engine'];
    const rate = (xs: GameRecord[]) => ({ value: xs.length ? ((xs.filter((g) => g.result === 'win').length + 0.5 * xs.filter((g) => g.result === 'draw').length) / xs.length) * 100 : null, n: xs.length });
    const groups = cats
      .map((c) => {
        const inCat = gs.filter((g) => categoryOf(g) === c);
        return { label: categoryLabel(c), values: [rate(inCat.filter((g) => g.date < recentCut)), rate(inCat.filter((g) => g.date >= recentCut))], total: inCat.length };
      })
      .filter((g) => g.total > 0);

    // Taktikmotive: Erfolgsquote je Thema (mind. 3 Versuche)
    const byTheme = new Map<string, { ok: number; n: number }>();
    for (const p of puzzles)
      for (const t of p.themes) {
        if (META_THEMES.has(t) || /Endgame$|^(opening|middlegame|endgame)$/.test(t)) continue;
        const e = byTheme.get(t) ?? { ok: 0, n: 0 };
        e.n++;
        if (p.solved && !p.assisted) e.ok++;
        byTheme.set(t, e);
      }
    const themes = [...byTheme.entries()].filter(([, v]) => v.n >= 3).map(([t, v]) => ({ t, rate: v.ok / v.n, n: v.n }));
    themes.sort((a, b) => b.rate - a.rate);

    const activity = [...gs.map((g) => g.date), ...puzzles.map((p) => p.date), ...lessons.map((l) => l.date).filter(Boolean)];
    const blunders = (g: GameRecord) => g.analysis?.plies.filter((p, i) => (i % 2 === 0) === (g.color === 'w') && p.c === 'blunder').length;
    const analyzed = gs.filter((g) => g.analysis).sort((a, b) => a.date.localeCompare(b.date));

    return {
      gs,
      bullet,
      bulletHist,
      bulletR: currentRating(bulletHist, 800),
      bulletDelta: bulletHist.length ? currentRating(bulletHist, 800) - ratingBefore(bulletHist, 800) : null,
      bulletWins: bullet.filter((g) => g.result === 'win').length,
      bulletFlags: bullet.filter(isTimeLoss).length,
      botHist,
      pzHist,
      botR,
      pzR,
      botDelta: botHist.length ? botR - ratingBefore(botHist, 800) : null,
      pzDelta: pzHist.length ? pzR - ratingBefore(pzHist, 1200) : null,
      wins,
      draws,
      losses,
      accRecent,
      accDelta: accRecent !== null && accOld !== null ? Math.round((accRecent - accOld) * 10) / 10 : null,
      accSeries: accGames.slice(-40).map((g) => ({ date: g.date, value: accOf(g), label: `${L('gegen', 'vs')} ${g.botName} · ${new Date(g.date).toLocaleDateString(locale)}` })),
      groups,
      strong: themes.slice(0, 4),
      weak: [...themes].reverse().slice(0, 4),
      solved: puzzles.filter((p) => p.solved && !p.assisted).length,
      puzzlesToday: puzzles.filter((p) => dayKey(p.date) === dayKey()).length,
      streak: streak(activity),
      lessonsDone: lessons.filter((l) => l.completed).length,
      blundersRecent: analyzed.length ? (analyzed.slice(-10).reduce((a, g) => a + (blunders(g) ?? 0), 0) / Math.min(10, analyzed.length)).toFixed(1) : null,
    };
  }, [games, puzzles, lessons]);

  const crowns = useMemo(() => crownSummary(games ?? []), [games]);
  const rushBest = (m: number) => Math.max(0, ...rush.filter((r) => r.mode === m).map((r) => r.score));
  const rush3 = [...rush].filter((r) => r.mode === 180).sort((a, b) => a.date.localeCompare(b.date));

  if (!games) return <div className="page" />;
  const empty = !s.gs.length && !puzzles.length && !s.bullet.length && !rush.length;

  return (
    <div className="page">
      <header className="page-head">
        <TrendingUp size={26} />
        <div>
          <h1>{L('Statistik', 'Stats')}</h1>
          <p>{L(`Dein Fortschritt über die Zeit – „früher“ heißt älter als ${RECENT_DAYS} Tage.`, `Your progress over time – "earlier" means older than ${RECENT_DAYS} days.`)}</p>
        </div>
      </header>

      {empty && (
        <div className="empty-card">
          <b>{L('Noch keine Daten', 'No data yet')}</b>
          <p>{L('Spiel ein paar Partien oder löse Puzzles – hier siehst du dann, wie du dich entwickelst.', "Play a few games or solve puzzles – then you'll see how you're improving.")}</p>
          <div className="btn-row">
            <button className="btn primary" onClick={() => navigate('coach')}>
              <Swords size={16} /> {L('Partie spielen', 'Play a game')}
            </button>
            <button className="btn" onClick={() => navigate('puzzles')}>
              <Puzzle size={16} /> {L('Puzzles lösen', 'Solve puzzles')}
            </button>
          </div>
        </div>
      )}

      <div className="tiles">
        <div className="tile">
          <span className="tile-label">
            <Swords size={15} /> {L('Spielstärke (Bots)', 'Rating (bots)')}
          </span>
          <b>{s.botR}</b>
          <Delta v={s.botDelta} />
          <span className="tile-sub">{s.gs.length ? L(`aus ${s.gs.length} gewerteten Partien`, `from ${s.gs.length} rated games`) : L('Start bei 800', 'Starts at 800')}</span>
        </div>
        <div className="tile">
          <span className="tile-label">
            <Puzzle size={15} /> {L('Puzzle-Rating', 'Puzzle rating')}
          </span>
          <b>{s.pzR}</b>
          <Delta v={s.pzDelta} />
          <span className="tile-sub">{L(`${s.solved} gelöst · heute ${s.puzzlesToday}`, `${s.solved} solved · today ${s.puzzlesToday}`)}</span>
        </div>
        <div className="tile">
          <span className="tile-label">
            <Trophy size={15} /> {L('Bilanz', 'Record')}
          </span>
          <b className="wdl">
            <span className="w">{s.wins}</span>/<span>{s.draws}</span>/<span className="l">{s.losses}</span>
          </b>
          <span className="tile-sub">{L('Siege / Remis / Niederlagen', 'Wins / draws / losses')}</span>
        </div>
        <div className="tile">
          <span className="tile-label">
            <Target size={15} /> {L('Genauigkeit', 'Accuracy')}
          </span>
          <b>{s.accRecent !== null ? `${s.accRecent}%` : '–'}</b>
          <Delta v={s.accDelta} suffix=" %" />
          <span className="tile-sub">{s.blundersRecent !== null ? L(`Ø ${s.blundersRecent} Patzer/Partie (letzte 10)`, `Ø ${s.blundersRecent} blunders/game (last 10)`) : L('Ø der letzten 10 Partien', 'Ø of the last 10 games')}</span>
        </div>
        <div className="tile">
          <span className="tile-label">
            <Crown size={15} /> {L('Kronen', 'Crowns')}
          </span>
          <b>
            {crowns.earned}
            <small className="of">/{crowns.total}</small>
          </b>
          <span className="tile-sub">
            {L(`${crowns.beaten} von ${BOTS.length} Bots besiegt`, `${crowns.beaten} of ${BOTS.length} bots defeated`)}{crowns.next ? L(` · nächstes Ziel: ${crowns.next.name}`, ` · next target: ${crowns.next.name}`) : ''}
          </span>
        </div>
        <div className="tile">
          <span className="tile-label">
            <Flame size={15} /> {L('Serie', 'Streak')}
          </span>
          <b>{s.streak}</b>
          <span className="tile-sub">
            {s.streak === 1 ? L('Tag', 'day') : L('Tage', 'days')} {L('in Folge aktiv', 'active in a row')} · {L(`${s.lessonsDone} Lektionen fertig`, `${s.lessonsDone} lessons done`)}
          </span>
        </div>
      </div>

      <div className="chart-grid">
        <section className="chart-card">
          <h2>{L('Spielstärke gegen Bots', 'Rating vs bots')}</h2>
          <p className="chart-sub">{L('Elo-Schätzung aus deinen Ergebnissen gegen die Bot-Ratings', 'Elo estimate from your results against the bot ratings')}</p>
          <LineChart points={s.botHist.map((p) => ({ date: p.date, value: p.rating }))} color="var(--series-1)" />
        </section>
        <section className="chart-card">
          <h2>{L('Puzzle-Rating', 'Puzzle rating')}</h2>
          <p className="chart-sub">{L('Nur der erste Versuch je Aufgabe zählt; Hinweise = nicht gelöst', 'Only the first attempt per puzzle counts; hints = not solved')}</p>
          <LineChart points={s.pzHist.map((p) => ({ date: p.date, value: p.rating }))} color="var(--series-1)" />
        </section>
        <section className="chart-card">
          <h2>{L('Siegquote nach Gegnerstärke', 'Win rate by opponent strength')}</h2>
          <p className="chart-sub">{L('Remis zählen halb', 'Draws count as half')}</p>
          {s.groups.length ? (
            <GroupedBars
              groups={s.groups}
              series={[
                { name: L('Früher', 'Earlier'), color: 'var(--series-2)' },
                { name: L(`Letzte ${RECENT_DAYS} Tage`, `Last ${RECENT_DAYS} days`), color: 'var(--series-1)' },
              ]}
            />
          ) : (
            <div className="chart-empty">{L('Noch keine Partien', 'No games yet')}</div>
          )}
        </section>
        <section className="chart-card">
          <h2>{L('Genauigkeit pro Partie', 'Accuracy per game')}</h2>
          <p className="chart-sub">{L('Aus Coach-Partien und analysierten Partien', 'From coach games and analyzed games')}</p>
          <LineChart points={s.accSeries} color="var(--series-1)" unit=" %" />
        </section>
      </div>

      {(s.bullet.length > 0 || rush.length > 0) && (
        <>
          <h2 className="section-title">
            <Zap size={18} /> Bullet
          </h2>
          <div className="tiles">
            <div className="tile">
              <span className="tile-label">
                <Timer size={15} /> {L('Bullet-Wertung', 'Bullet rating')}
              </span>
              <b>{s.bullet.length ? s.bulletR : '–'}</b>
              <Delta v={s.bulletDelta} />
              <span className="tile-sub">
                {L(`${s.bulletWins} Siege aus ${s.bullet.length} · ${s.bulletFlags}× auf Zeit verloren`, `${s.bulletWins} wins of ${s.bullet.length} · ${s.bulletFlags}× lost on time`)}
              </span>
            </div>
            {[60, 180, 300].map((m) => (
              <div className="tile" key={m}>
                <span className="tile-label">
                  <Zap size={15} /> Puzzle Rush {m / 60} min
                </span>
                <b>{rushBest(m) || '–'}</b>
                <span className="tile-sub">{L('Rekord', 'Best')} · {rush.filter((r) => r.mode === m).length} {L('Läufe', 'runs')}</span>
              </div>
            ))}
          </div>
          <div className="chart-grid">
            <section className="chart-card">
              <h2>{L('Bullet-Wertung', 'Bullet rating')}</h2>
              <p className="chart-sub">{L('Partien mit Uhr bis 3 Minuten, getrennt von deiner normalen Wertung', 'Games with a clock up to 3 minutes, separate from your regular rating')}</p>
              <LineChart points={s.bulletHist.map((p) => ({ date: p.date, value: p.rating }))} color="var(--series-1)" />
            </section>
            <section className="chart-card">
              <h2>{L('Puzzle Rush (3 Minuten)', 'Puzzle Rush (3 minutes)')}</h2>
              <p className="chart-sub">{L('Gelöste Aufgaben pro Lauf', 'Puzzles solved per run')}</p>
              <LineChart points={rush3.map((r) => ({ date: r.date, value: r.score, label: L(`${r.score} gelöst · bis Rating ${r.maxRating || '–'}`, `${r.score} solved · up to rating ${r.maxRating || '–'}`) }))} color="var(--series-1)" />
            </section>
          </div>
        </>
      )}

      {(s.strong.length > 0 || s.weak.length > 0) && (
        <div className="chart-grid">
          <section className="chart-card">
            <h2>{L('Deine Stärken', 'Your strengths')}</h2>
            <p className="chart-sub">{L('Taktikmotive mit der höchsten Lösungsquote', 'Tactical motifs with the highest solve rate')}</p>
            <ThemeList items={s.strong} />
          </section>
          <section className="chart-card">
            <h2>{L('Hier lohnt sich Training', 'Worth training')}</h2>
            <p className="chart-sub">{L('Taktikmotive mit der niedrigsten Lösungsquote', 'Tactical motifs with the lowest solve rate')}</p>
            <ThemeList items={s.weak} />
          </section>
        </div>
      )}
    </div>
  );
}

function ThemeList({ items }: { items: { t: string; rate: number; n: number }[] }) {
  return (
    <ul className="theme-rows">
      {items.map((x) => (
        <li key={x.t}>
          <span className="theme-name">{themeName(x.t)}</span>
          <div className="progress">
            <i style={{ width: `${x.rate * 100}%` }} />
          </div>
          <span className="theme-val">
            {Math.round(x.rate * 100)}% <small>({x.n})</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
