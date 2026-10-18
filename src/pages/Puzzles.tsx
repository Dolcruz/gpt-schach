import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, Eye, Lightbulb, Microscope, Puzzle as PuzzleIcon, RotateCcw, X } from 'lucide-react';
import { Board } from '../components/Board';
import { CoachChat, type CoachChatHandle } from '../components/CoachChat';
import { Avatar } from '../components/ui';
import { PuzzleStatus } from '../components/PuzzleStatus';
import { currentRating, dayKey, difficultyFor, puzzleRatingHistory, store, streak, type PuzzleAttempt } from '../lib/data';
import { META_THEMES, PUZZLE_FILTERS, themeName } from '../lib/themes';
import { usePuzzle, type PuzzleData, type PuzzleOutcome } from '../lib/usePuzzle';
import { positionBlock } from '../coach';
import { navigate } from '../router';
import type { PageProps } from '../App';
import type { Key } from 'chessground/types';
import { useVariationView, variationShapes } from '../lib/variation';
import { VariationBar } from '../components/Variation';


async function fetchPuzzle(daily: boolean, angle: string, difficulty: string): Promise<PuzzleData> {
  const q = new URLSearchParams();
  if (angle) q.set('angle', angle);
  q.set('difficulty', difficulty);
  const r = await fetch(daily ? '/api/puzzle/daily' : `/api/puzzle/next?${q}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? 'Puzzle konnte nicht geladen werden');
  return j;
}

export function Puzzles({ daily, loggedIn, settings }: PageProps & { daily: boolean }) {
  const [attempts, setAttempts] = useState<PuzzleAttempt[] | null>(null);
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [error, setError] = useState('');
  const [angle, setAngle] = useState(() => localStorage.getItem('puzzleAngle') ?? '');
  const [delta, setDelta] = useState<number | null>(null);
  const [session, setSession] = useState<{ id: string; ok: boolean }[]>([]);
  const prefetch = useRef<Promise<PuzzleData> | null>(null);
  const chat = useRef<CoachChatHandle>(null);
  const [arrows, setArrows] = useState<string[]>([]);
  const vv = useVariationView();
  useEffect(() => vv.close(), [puzzle, vv.close]);

  const history = useMemo(() => puzzleRatingHistory(attempts ?? []), [attempts]);
  const rating = currentRating(history, 1200);
  const today = dayKey();
  const dailyDone = attempts?.find((a) => a.daily === today);
  const dailyStreak = useMemo(() => streak((attempts ?? []).filter((a) => a.daily && a.solved).map((a) => a.daily!)), [attempts]);

  useEffect(() => {
    store.list('puzzles').then(setAttempts).catch(() => setAttempts([]));
  }, []);

  const load = useCallback(
    async (useAngle = angle) => {
      setError('');
      setDelta(null);
      setArrows([]);
      try {
        const next = prefetch.current && !daily ? await prefetch.current : await fetchPuzzle(daily, useAngle, difficultyFor(rating));
        prefetch.current = null;
        setPuzzle(next);
        chat.current?.clear();
        if (!daily) prefetch.current = fetchPuzzle(false, useAngle, difficultyFor(rating)).catch(() => null as any);
      } catch (e: any) {
        prefetch.current = null;
        setError(e.message);
      }
    },
    [angle, daily, rating],
  );

  // Erst laden, wenn die bisherigen Versuche (für die Schwierigkeit) da sind
  useEffect(() => {
    if (attempts && !puzzle) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts]);

  const onOutcome = useCallback(
    (o: PuzzleOutcome) => {
      if (!puzzle || !attempts) return;
      setSession((s) => [...s, { id: puzzle.id, ok: o.solved && !o.assisted }]);
      // Jede Aufgabe zählt nur einmal fürs Rating
      if (attempts.some((a) => a.id === puzzle.id)) return;
      const rec: PuzzleAttempt = {
        id: puzzle.id,
        date: new Date().toISOString(),
        rating: puzzle.rating,
        themes: puzzle.themes,
        solved: o.solved,
        assisted: o.assisted,
        daily: daily ? (puzzle.day ?? today) : undefined,
        seconds: o.seconds,
      };
      const next = [...attempts, rec];
      setDelta(currentRating(puzzleRatingHistory(next), 1200) - rating);
      setAttempts(next);
      store.put('puzzles', rec).catch(() => {});
    },
    [puzzle, attempts, daily, today, rating],
  );

  const pz = usePuzzle(puzzle, onOutcome);
  const finished = pz.status === 'solved' || pz.status === 'shown';
  const sideName = puzzle?.color === 'w' ? 'Weiß' : 'Schwarz';
  const themes = (puzzle?.themes ?? []).filter((t) => !META_THEMES.has(t));

  const shapes = arrows.length
    ? arrows.map((a) => ({ orig: a.slice(0, 2) as Key, dest: a.slice(2, 4) as Key, brush: 'green' }))
    : pz.shapes;

  const context = useCallback(() => {
    if (!puzzle) return '';
    return positionBlock(pz.fen, [
      `Taktikaufgabe (Rating ${puzzle.rating}). Ausgangsstellung: ${puzzle.fen}`,
      `Der Schüler spielt ${sideName}.`,
      `Korrekte Lösung (geprüft): ${pz.solutionSan().join(' ')}`,
      `Motive: ${themes.map(themeName).join(', ') || 'unbekannt'}`,
      finished ? 'Die Aufgabe ist beendet – du darfst die Lösung erklären.' : 'Die Aufgabe läuft noch – verrate die Lösung NICHT, gib höchstens Hinweise.',
    ]);
  }, [puzzle, pz, sideName, themes, finished]);

  const statusBox = <PuzzleStatus status={puzzle ? pz.status : 'loading'} color={puzzle?.color ?? 'w'} failed={pz.failed} delta={delta} error={error} />;

  return (
    <div className="layout">
      <div className="board-col">
        {vv.active && <VariationBar vv={vv} />}
        <div className="player-bar" hidden={vv.active}>
          <span className="bar-icon">{daily ? <CalendarDays size={22} /> : <PuzzleIcon size={22} />}</span>
          <div className="player-info">
            <div className="player-name">
              <b>{daily ? `Tagesrätsel · ${new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}` : 'Taktikaufgabe'}</b>
              {finished && puzzle && <span className="rating">({puzzle.rating})</span>}
            </div>
            <div className="bar-sub">
              {finished ? (
                <span className="theme-list">{themes.map(themeName).join(' · ')}</span>
              ) : (
                puzzle && <span className="muted-text">Zug {pz.moveNumber} von {pz.totalMoves}</span>
              )}
            </div>
          </div>
        </div>
        <div className="board-wrap">
          <Board
            fen={vv.fen ?? pz.fen}
            orientation={puzzle?.color === 'b' ? 'black' : 'white'}
            movable={pz.canMove && !vv.active ? (puzzle!.color === 'w' ? 'white' : 'black') : null}
            lastMove={vv.active ? vv.lastMove : pz.lastMove}
            shapes={vv.active ? variationShapes(vv) : shapes}
            badge={vv.active ? undefined : pz.badge}
            onMove={(f, t) => {
              setArrows([]);
              pz.onMove(f, t);
            }}
          />
        </div>
        <div className="player-bar">
          <Avatar id="you" size={40} />
          <div className="player-info">
            <div className="player-name">
              <b>Du</b>
              <span className="rating">({rating})</span>
            </div>
            <div className="bar-sub session-dots">
              {session.slice(-14).map((s, i) => (
                <span key={i} className={s.ok ? 'ok' : 'fail'}>
                  {s.ok ? <Check size={11} strokeWidth={4} /> : <X size={11} strokeWidth={4} />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="panel">
        <header className="panel-head">
          {daily ? <CalendarDays size={21} /> : <PuzzleIcon size={21} />}
          <h1>{daily ? 'Tagesrätsel' : 'Puzzles'}</h1>
        </header>
        <div className="panel-top">
          {statusBox}
          <div className="stat-row">
            <div>
              <span>Puzzle-Rating</span>
              <b>{rating}</b>
            </div>
            <div>
              <span>{daily ? 'Serie' : 'Gelöst'}</span>
              <b>{daily ? `${dailyStreak} ${dailyStreak === 1 ? 'Tag' : 'Tage'}` : (attempts ?? []).filter((a) => a.solved && !a.assisted).length}</b>
            </div>
            <div>
              <span>Heute</span>
              <b>{(attempts ?? []).filter((a) => dayKey(a.date) === today).length}</b>
            </div>
          </div>
          {daily && dailyDone && pz.status === 'play' && puzzle?.id === dailyDone.id && (
            <p className="hint-text">Du hast das heutige Rätsel schon {dailyDone.solved && !dailyDone.assisted ? 'gelöst' : 'gespielt'} – du kannst es nochmal ungewertet lösen.</p>
          )}
          {!daily && (
            <label className="select inline">
              <span>Thema</span>
              <div className="select-box">
                <select
                  value={angle}
                  onChange={(e) => {
                    setAngle(e.target.value);
                    localStorage.setItem('puzzleAngle', e.target.value);
                    prefetch.current = null;
                    load(e.target.value);
                  }}
                >
                  {PUZZLE_FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </div>
            </label>
          )}
          <div className="btn-row">
            {!finished ? (
              <>
                <button className="btn" onClick={pz.hint} disabled={!puzzle}>
                  <Lightbulb size={16} /> Hinweis
                </button>
                <button className="btn" onClick={pz.showSolution} disabled={!puzzle}>
                  <Eye size={16} /> Lösung
                </button>
              </>
            ) : (
              <button className="btn" onClick={() => puzzle && navigate(`analysis/fen:${encodeURIComponent(puzzle.fen)}`)}>
                <Microscope size={16} /> Analysieren
              </button>
            )}
            {daily ? (
              <button className="btn primary grow" onClick={() => navigate('puzzles')}>
                <PuzzleIcon size={16} /> Weitere Puzzles
              </button>
            ) : (
              <button className={`btn grow ${finished ? 'primary' : ''}`} onClick={() => load()}>
                {finished ? 'Nächstes Puzzle' : <><RotateCcw size={15} /> Überspringen</>}
              </button>
            )}
          </div>
        </div>
        <CoachChat
          ref={chat}
          vv={vv}
          fens={() => [pz.fen, puzzle?.fen ?? '']}
          loggedIn={loggedIn}
          settings={settings}
          level={rating}
          context={context}
          onArrows={setArrows}
          intro={daily ? 'Das Rätsel des Tages! Lass dir Zeit – und frag mich, wenn du nicht weiterkommst.' : 'Finde den stärksten Zug. Wenn du feststeckst, frag mich nach einem Tipp.'}
          quick={
            finished
              ? [
                  { label: 'Erklär mir die Lösung', prompt: 'Erkläre die Lösung Zug für Zug: Welches Motiv steckt dahinter und warum funktionieren andere Züge nicht? Zeichne den Schlüsselzug als Pfeil.' },
                  { label: 'Woran erkenne ich so was?', prompt: 'Woran kann ich solche Stellungen in eigenen Partien erkennen? Nenne 2–3 konkrete Signale.' },
                ]
              : [{ label: 'Gib mir einen Tipp', prompt: 'Gib mir einen kleinen Tipp, ohne den Zug zu verraten. Keine Pfeile.' }]
          }
        />
      </section>
    </div>
  );
}
