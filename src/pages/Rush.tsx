import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Flame, Microscope, RotateCcw, Timer, Trophy, X, Zap } from 'lucide-react';
import { Board } from '../components/Board';
import { Avatar, Piece } from '../components/ui';
import { store, uid, type RushRecord } from '../lib/data';
import { usePuzzle, type PuzzleData, type PuzzleOutcome } from '../lib/usePuzzle';
import { navigate } from '../router';
import { playSound } from '../sound';

const MAX_ERRORS = 3;
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Schwierigkeit steigt mit jeder gelösten Aufgabe – wie bei Puzzle Rush */
function tierFor(solved: number) {
  return solved < 6 ? 'easiest' : solved < 12 ? 'easier' : solved < 18 ? 'normal' : solved < 25 ? 'harder' : 'hardest';
}

async function fetchBatch(difficulty: string): Promise<PuzzleData[]> {
  const r = await fetch(`/api/puzzle/pool?difficulty=${difficulty}&n=3`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? 'Aufgaben konnten nicht geladen werden');
  return j;
}

export function Rush({ seconds }: { seconds: number }) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'running' | 'done'>('loading');
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [results, setResults] = useState<{ p: PuzzleData; ok: boolean }[]>([]);
  const [left, setLeft] = useState(seconds * 1000);
  const [history, setHistory] = useState<RushRecord[]>([]);
  const [error, setError] = useState('');
  const queue = useRef<PuzzleData[]>([]);
  const loading = useRef(false);
  const endAt = useRef(0);
  const savedRef = useRef(false);

  const score = results.filter((r) => r.ok).length;
  const errors = results.length - score;
  const best = useMemo(() => Math.max(0, ...history.filter((h) => h.mode === seconds).map((h) => h.score)), [history, seconds]);

  useEffect(() => {
    store.list('rush').then(setHistory).catch(() => {});
  }, []);

  /** Vorrat für die aktuelle Stufe auffüllen */
  const topUp = useCallback(async (solved: number) => {
    if (loading.current || queue.current.length >= 3) return;
    loading.current = true;
    try {
      const batch = await fetchBatch(tierFor(solved));
      const seen = new Set([...queue.current.map((q) => q.id)]);
      queue.current.push(...batch.filter((b) => !seen.has(b.id)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      loading.current = false;
    }
  }, []);

  // Erste Aufgaben vorladen
  useEffect(() => {
    (async () => {
      await topUp(0);
      if (queue.current.length) setPhase('ready');
    })();
  }, [topUp]);

  const next = useCallback(
    (solved: number) => {
      const p = queue.current.shift() ?? null;
      setPuzzle(p);
      topUp(solved);
      if (!p) {
        // Vorrat leer: kurz warten und erneut versuchen
        setTimeout(() => {
          const q = queue.current.shift();
          if (q) setPuzzle(q);
        }, 800);
      }
    },
    [topUp],
  );

  function start() {
    setResults([]);
    savedRef.current = false;
    endAt.current = performance.now() + seconds * 1000;
    setLeft(seconds * 1000);
    setPhase('running');
    next(0);
  }

  // Countdown
  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => {
      const l = endAt.current - performance.now();
      setLeft(Math.max(0, l));
      if (l <= 0) setPhase('done');
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const onOutcome = useCallback(
    (o: PuzzleOutcome) => {
      if (!puzzle || phase !== 'running') return;
      const ok = o.solved && !o.assisted;
      setResults((rs) => {
        const nextRs = [...rs, { p: puzzle, ok }];
        const solved = nextRs.filter((r) => r.ok).length;
        if (nextRs.length - solved >= MAX_ERRORS) setTimeout(() => setPhase('done'), 450);
        else setTimeout(() => next(solved), ok ? 120 : 450);
        return nextRs;
      });
      if (!ok) playSound('check');
    },
    [puzzle, phase, next],
  );

  const pz = usePuzzle(puzzle, onOutcome, { fast: true });

  // Ergebnis speichern
  useEffect(() => {
    if (phase !== 'done' || savedRef.current || !results.length) return;
    savedRef.current = true;
    playSound('end');
    const rec: RushRecord = {
      id: uid(),
      date: new Date().toISOString(),
      mode: seconds,
      score,
      errors,
      maxRating: Math.max(0, ...results.filter((r) => r.ok).map((r) => r.p.rating)),
      failed: results.filter((r) => !r.ok).map((r) => ({ id: r.p.id, fen: r.p.fen, rating: r.p.rating })),
    };
    setHistory((h) => [...h, rec]);
    store.put('rush', rec).catch(() => {});
  }, [phase, results, score, errors, seconds]);

  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);
  const newBest = phase === 'done' && score > 0 && score >= best && history.filter((h) => h.mode === seconds).length > 0 && score === Math.max(...history.filter((h) => h.mode === seconds).map((h) => h.score));

  return (
    <div className="layout">
      <div className="board-col">
        <div className="player-bar">
          <span className="bar-icon">
            <Zap size={22} />
          </span>
          <div className="player-info">
            <div className="player-name">
              <b>Puzzle Rush · {seconds / 60} {seconds === 60 ? 'Minute' : 'Minuten'}</b>
              {puzzle && phase === 'running' && <span className="rating">({puzzle.rating})</span>}
            </div>
            <div className="bar-sub">
              <span className="muted-text">{phase === 'running' && puzzle ? `${puzzle.color === 'w' ? 'Weiß' : 'Schwarz'} am Zug` : 'So viele Aufgaben wie möglich – 3 Fehler und vorbei'}</span>
            </div>
          </div>
        </div>
        <div className="board-wrap">
          <Board
            fen={puzzle ? pz.fen : START_FEN}
            orientation={puzzle?.color === 'b' ? 'black' : 'white'}
            movable={phase === 'running' && pz.canMove ? (puzzle!.color === 'w' ? 'white' : 'black') : null}
            lastMove={phase === 'running' ? pz.lastMove : undefined}
            shapes={[]}
            badge={phase === 'running' ? pz.badge : undefined}
            onMove={(f, t) => pz.onMove(f, t)}
          />
          {phase !== 'running' && (
            <div className="over">
              <div className="over-card rush-card">
                {phase === 'done' ? (
                  <>
                    <div className="over-head">
                      <Trophy size={26} />
                      <h2>{score} gelöst</h2>
                      <p>{newBest ? 'Neuer Rekord!' : best ? `Dein Rekord: ${best}` : 'Erster Lauf'}</p>
                    </div>
                    <div className="rush-summary">
                      <div>
                        <span>Fehler</span>
                        <b>{errors}</b>
                      </div>
                      <div>
                        <span>Schwerste gelöst</span>
                        <b>{Math.max(0, ...results.filter((r) => r.ok).map((r) => r.p.rating)) || '–'}</b>
                      </div>
                    </div>
                    <div className="over-btns">
                      <button className="btn primary block" onClick={start}>
                        <RotateCcw size={16} /> Nochmal
                      </button>
                      <button className="btn block" onClick={() => navigate('bullet')}>
                        <ArrowLeft size={16} /> Zum Bullet-Training
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="over-head">
                      <Zap size={26} />
                      <h2>Puzzle Rush</h2>
                      <p>
                        {seconds / 60} {seconds === 60 ? 'Minute' : 'Minuten'} · 3 Fehler und vorbei · Aufgaben werden immer schwerer
                      </p>
                    </div>
                    {error && <p className="err-text" style={{ padding: '0 18px' }}>{error}</p>}
                    <div className="over-btns">
                      <button className="btn primary block xl" onClick={start} disabled={phase !== 'ready'}>
                        {phase === 'ready' ? 'Los!' : 'Lade Aufgaben …'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="player-bar">
          <Avatar id="you" size={40} />
          <div className="player-info">
            <div className="player-name">
              <b>Du</b>
              <span className="rating">Rekord {best}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="panel">
        <header className="panel-head">
          <button className="head-back" onClick={() => navigate('bullet')} title="Zurück">
            <ArrowLeft size={18} />
          </button>
          <Zap size={21} />
          <h1>Puzzle Rush</h1>
        </header>
        <div className="panel-top">
          <div className={`rush-timer ${left < 10_000 && phase === 'running' ? 'low' : ''}`}>
            <Timer size={26} />
            {mm}:{String(ss).padStart(2, '0')}
          </div>
          <div className="rush-stats">
            <div className="rush-score">
              <span>Gelöst</span>
              <b>{score}</b>
            </div>
            <div className="rush-errors">
              <span>Fehler</span>
              <div>
                {Array.from({ length: MAX_ERRORS }, (_, i) => (
                  <i key={i} className={i < errors ? 'hit' : ''}>
                    <X size={16} strokeWidth={3.5} />
                  </i>
                ))}
              </div>
            </div>
          </div>
          {phase === 'running' && puzzle && (
            <div className="status-box">
              <span className="status-icon piece">
                <Piece type="k" color={puzzle.color} size={30} />
              </span>
              <div>
                <b>{puzzle.color === 'w' ? 'Weiß' : 'Schwarz'} am Zug</b>
                <span>Finde den besten Zug – schnell!</span>
              </div>
            </div>
          )}
        </div>
        <div className="panel-body tight">
          <div className="rush-list">
            {[...results].reverse().map((r, i) => (
              <div key={results.length - i} className={`rush-item ${r.ok ? 'ok' : 'fail'}`}>
                <span className="ri-icon">{r.ok ? <Check size={14} strokeWidth={3.5} /> : <X size={14} strokeWidth={3.5} />}</span>
                <span>Aufgabe {results.length - i}</span>
                <span className="ri-rating">{r.p.rating}</span>
                {phase === 'done' && (
                  <button className="icon-btn" title="Analysieren" onClick={() => navigate(`analysis/fen:${encodeURIComponent(r.p.fen)}`)}>
                    <Microscope size={15} />
                  </button>
                )}
              </div>
            ))}
            {!results.length && (
              <p className="hint-text">
                <Flame size={14} style={{ verticalAlign: -2, color: 'var(--green)' }} /> Tipp: Im Rush zählt Mustererkennung. Schau zuerst auf Schachs, Schlagzüge und Drohungen.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
