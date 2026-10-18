import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Eye, Lightbulb, RotateCcw } from 'lucide-react';
import type { Key } from 'chessground/types';
import { Board } from '../components/Board';
import { CoachChat, type CoachChatHandle } from '../components/CoachChat';
import { PuzzleStatus } from '../components/PuzzleStatus';
import { Avatar, Markdown } from '../components/ui';
import { currentRating, difficultyFor, puzzleRatingHistory, store, type LessonProgress, type PuzzleAttempt } from '../lib/data';
import { LESSON_TARGET, type Lesson } from '../lib/lessons';
import { usePuzzle, type PuzzleData, type PuzzleOutcome } from '../lib/usePuzzle';
import { positionBlock } from '../coach';
import { navigate } from '../router';
import type { PageProps } from '../App';
import { useVariationView, variationShapes } from '../lib/variation';
import { VariationBar } from '../components/Variation';


const EASIER: Record<string, string> = { hardest: 'harder', harder: 'normal', normal: 'easier', easier: 'easiest', easiest: 'easiest' };

export function LessonView({ lesson, loggedIn, settings }: PageProps & { lesson: Lesson }) {
  const [attempts, setAttempts] = useState<PuzzleAttempt[] | null>(null);
  const [progress, setProgress] = useState<LessonProgress>({ id: lesson.id, solved: 0, attempts: 0, completed: false, date: '' });
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [error, setError] = useState('');
  const [showText, setShowText] = useState(true);
  const [arrows, setArrows] = useState<string[]>([]);
  const chat = useRef<CoachChatHandle>(null);
  const vv = useVariationView();
  useEffect(() => vv.close(), [puzzle, vv.close]);

  const rating = useMemo(() => currentRating(puzzleRatingHistory(attempts ?? []), 1200), [attempts]);

  useEffect(() => {
    store.list('puzzles').then(setAttempts).catch(() => setAttempts([]));
    store
      .list('lessons')
      .then((ls) => {
        const p = ls.find((x) => x.id === lesson.id);
        if (p) setProgress(p);
      })
      .catch(() => {});
  }, [lesson.id]);

  const load = useCallback(async () => {
    setError('');
    setArrows([]);
    try {
      // Übungen eine Stufe leichter als das eigene Niveau – es geht ums Muster
      const q = new URLSearchParams({ angle: lesson.theme, difficulty: EASIER[difficultyFor(rating)] });
      const r = await fetch(`/api/puzzle/next?${q}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? 'Übung konnte nicht geladen werden');
      setPuzzle(j);
    } catch (e: any) {
      setError(e.message);
    }
  }, [lesson.theme, rating]);

  useEffect(() => {
    if (attempts && !puzzle) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts]);

  const onOutcome = useCallback(
    (o: PuzzleOutcome) => {
      if (!puzzle) return;
      const ok = o.solved && !o.assisted;
      const next: LessonProgress = {
        id: lesson.id,
        solved: progress.solved + (ok ? 1 : 0),
        attempts: progress.attempts + 1,
        completed: progress.completed || progress.solved + (ok ? 1 : 0) >= LESSON_TARGET,
        date: new Date().toISOString(),
      };
      setProgress(next);
      store.put('lessons', next).catch(() => {});
      if (attempts && !attempts.some((a) => a.id === puzzle.id)) {
        const rec: PuzzleAttempt = { id: puzzle.id, date: new Date().toISOString(), rating: puzzle.rating, themes: puzzle.themes, solved: o.solved, assisted: o.assisted, seconds: o.seconds };
        setAttempts([...attempts, rec]);
        store.put('puzzles', rec).catch(() => {});
      }
    },
    [puzzle, lesson.id, progress, attempts],
  );

  const pz = usePuzzle(puzzle, onOutcome);
  const finished = pz.status === 'solved' || pz.status === 'shown';
  const solved = Math.min(progress.solved, LESSON_TARGET);
  const shapes = arrows.length ? arrows.map((a) => ({ orig: a.slice(0, 2) as Key, dest: a.slice(2, 4) as Key, brush: 'green' })) : pz.shapes;

  const context = useCallback(() => {
    const base = [`Lektion: „${lesson.title}“ – ${lesson.summary}`, `Lektionstext:\n${lesson.body}`];
    if (!puzzle) return base.join('\n');
    return positionBlock(pz.fen, [
      ...base,
      `Aktuelle Übungsaufgabe (Rating ${puzzle.rating}), Ausgangsstellung: ${puzzle.fen}. Der Schüler spielt ${puzzle.color === 'w' ? 'Weiß' : 'Schwarz'}.`,
      `Korrekte Lösung (geprüft): ${pz.solutionSan().join(' ')}`,
      finished ? 'Die Übung ist beendet – du darfst die Lösung erklären.' : 'Die Übung läuft noch – verrate die Lösung NICHT.',
    ]);
  }, [lesson, puzzle, pz, finished]);

  return (
    <div className="layout">
      <div className="board-col">
        {vv.active && <VariationBar vv={vv} />}
        <div className="player-bar" hidden={vv.active}>
          <span className="bar-icon">
            <BookOpen size={22} />
          </span>
          <div className="player-info">
            <div className="player-name">
              <b>{lesson.title}</b>
              <span className="rating">· Übung {Math.min(solved + 1, LESSON_TARGET)}</span>
            </div>
            <div className="bar-sub">
              <span className="muted-text">{puzzle ? `Zug ${pz.moveNumber} von ${pz.totalMoves}` : ' '}</span>
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
          </div>
        </div>
      </div>

      <section className="panel">
        <header className="panel-head">
          <button className="head-back" onClick={() => navigate('learn')} title="Zurück zur Übersicht">
            <ArrowLeft size={18} />
          </button>
          <BookOpen size={20} />
          <h1>{lesson.title}</h1>
        </header>
        <div className="panel-top">
          <div className={`lesson-text ${showText ? 'open' : ''}`}>
            <button className="lesson-toggle" onClick={() => setShowText(!showText)}>
              <span>Erklärung</span>
              <ChevronDown size={16} />
            </button>
            {showText && (
              <div className="text">
                <Markdown text={lesson.body} />
              </div>
            )}
          </div>
          <div className="lesson-progress">
            <div className="progress">
              <i style={{ width: `${(solved / LESSON_TARGET) * 100}%` }} />
            </div>
            <span>{progress.completed ? 'Abgeschlossen – weiter üben macht dich sicherer' : `${solved}/${LESSON_TARGET} Übungen gelöst`}</span>
          </div>
          <PuzzleStatus status={puzzle ? pz.status : 'loading'} color={puzzle?.color ?? 'w'} failed={pz.failed} error={error} />
          <div className="btn-row">
            {!finished && (
              <>
                <button className="btn" onClick={pz.hint} disabled={!puzzle}>
                  <Lightbulb size={16} /> Hinweis
                </button>
                <button className="btn" onClick={pz.showSolution} disabled={!puzzle}>
                  <Eye size={16} /> Lösung
                </button>
              </>
            )}
            <button className={`btn grow ${finished ? 'primary' : ''}`} onClick={load}>
              {finished ? 'Nächste Übung' : <><RotateCcw size={15} /> Andere Übung</>}
            </button>
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
          intro={`In dieser Lektion geht es um **${lesson.title}**. Lies die Erklärung und löse dann ${LESSON_TARGET} Übungen. Frag mich jederzeit!`}
          quick={
            finished
              ? [
                  { label: 'Erklär die Lösung', prompt: `Erkläre die Lösung der Übung Zug für Zug und zeige, wie das Motiv „${lesson.title}“ darin vorkommt. Zeichne den Schlüsselzug als Pfeil.` },
                  { label: 'Ausführliche Lektion', prompt: `Gib mir eine ausführlichere Lektion zum Thema „${lesson.title}“: Erklärung, 3 typische Muster, häufige Fehler und wie ich es in meinen Partien finde. Gerne strukturiert mit Überschriften. Max. 250 Wörter.` },
                ]
              : [
                  { label: 'Tipp', prompt: 'Gib mir einen kleinen Tipp zur aktuellen Übung, ohne den Zug zu verraten. Keine Pfeile.' },
                  { label: 'Ausführliche Lektion', prompt: `Gib mir eine ausführlichere Lektion zum Thema „${lesson.title}“: Erklärung, 3 typische Muster, häufige Fehler und wie ich es in meinen Partien finde. Verrate dabei nicht die Lösung der aktuellen Übung. Max. 250 Wörter.` },
                ]
          }
        />
      </section>
    </div>
  );
}
