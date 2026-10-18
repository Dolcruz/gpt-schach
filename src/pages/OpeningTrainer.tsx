import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import { ArrowLeft, BookOpen, Check, Eye, GraduationCap, RotateCcw, Swords, X } from 'lucide-react';
import { Board } from '../components/Board';
import { CoachChat } from '../components/CoachChat';
import { Avatar, Piece } from '../components/ui';
import { store, type OpeningProgress } from '../lib/data';
import type { Opening } from '../lib/openings';
import { coachOpponent } from '../bots';
import { positionBlock } from '../coach';
import { navigate } from '../router';
import { playSound } from '../sound';
import type { GameSetup } from '../components/Home';
import type { PageProps } from '../App';
import type { Classification } from '../coach';
import { useVariationView, variationShapes } from '../lib/variation';
import { VariationBar } from '../components/Variation';


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function OpeningTrainer({ opening, loggedIn, settings, onPractice }: PageProps & { opening: Opening; onPractice: (s: GameSetup) => void }) {
  const chess = useRef(new Chess());
  const token = useRef(0);
  const [ply, setPly] = useState(0);
  const [fen, setFen] = useState(chess.current.fen());
  const [lastMove, setLastMove] = useState<[string, string]>();
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [badge, setBadge] = useState<{ square: string; c: Classification }>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<OpeningProgress | null>(null);
  const [reveal, setReveal] = useState(false);
  const [arrows, setArrows] = useState<string[]>([]);
  const vv = useVariationView();
  useEffect(() => vv.close(), [ply, vv.close]);

  const total = opening.moves.length;
  const done = ply >= total;
  const myTurn = !done && (ply % 2 === 0 ? 'w' : 'b') === opening.side;

  useEffect(() => {
    store
      .list('openings')
      .then((l) => setProgress(l.find((x) => x.id === opening.id) ?? null))
      .catch(() => {});
  }, [opening.id]);

  const apply = (san: string) => {
    const m = chess.current.move(san);
    playSound(m.captured ? 'capture' : m.san.includes('+') ? 'check' : 'move');
    setFen(chess.current.fen());
    setLastMove([m.from, m.to]);
    return m;
  };

  /** Gegnerzüge automatisch nachspielen, bis du wieder dran bist */
  const autoplay = useCallback(
    async (from: number) => {
      const t = token.current;
      let p = from;
      setBusy(true);
      while (p < total && (p % 2 === 0 ? 'w' : 'b') !== opening.side) {
        await sleep(p === 0 ? 300 : 550);
        if (t !== token.current) return;
        apply(opening.moves[p]);
        p++;
        setPly(p);
      }
      setBusy(false);
    },
    [opening, total],
  );

  const restart = useCallback(
    (m: 'learn' | 'practice' = mode) => {
      token.current++;
      chess.current = new Chess();
      setMode(m);
      setFen(chess.current.fen());
      setLastMove(undefined);
      setPly(0);
      setMistakes(0);
      setWrong(null);
      setBadge(undefined);
      setReveal(false);
      setArrows([]);
      autoplay(0);
    },
    [mode, autoplay],
  );

  useEffect(() => {
    restart('learn');
    return () => {
      token.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening.id]);

  // Am Ende Fortschritt speichern
  useEffect(() => {
    if (!done || ply === 0) return;
    const next: OpeningProgress = {
      id: opening.id,
      runs: (progress?.runs ?? 0) + 1,
      perfect: (progress?.perfect ?? 0) + (mistakes === 0 && mode === 'practice' ? 1 : 0),
      date: new Date().toISOString(),
    };
    setProgress(next);
    store.put('openings', next).catch(() => {});
    playSound('end');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  async function onMove(from: string, to: string) {
    if (!myTurn || busy) return;
    const c = chess.current;
    const expected = opening.moves[ply];
    let m;
    try {
      m = c.move({ from, to, promotion: 'q' });
    } catch {
      setFen(c.fen());
      return;
    }
    setFen(c.fen());
    setLastMove([m.from, m.to]);
    setArrows([]);
    if (m.san === expected) {
      playSound(m.captured ? 'capture' : 'move');
      setBadge({ square: m.to, c: 'book' });
      setWrong(null);
      setReveal(false);
      const p = ply + 1;
      setPly(p);
      autoplay(p);
    } else {
      setBadge({ square: m.to, c: 'mistake' });
      setWrong(m.san);
      setMistakes((x) => x + 1);
      setBusy(true);
      const t = token.current;
      await sleep(650);
      if (t !== token.current) return;
      c.undo();
      setFen(c.fen());
      const prev = c.history({ verbose: true }).at(-1);
      setLastMove(prev ? [prev.from, prev.to] : undefined);
      setBadge(undefined);
      setBusy(false);
      if (mode === 'learn') setReveal(true);
    }
  }

  // Im Lernmodus zeigt ein Pfeil immer den nächsten Theoriezug
  let shapes: DrawShape[] = arrows.map((a) => ({ orig: a.slice(0, 2) as Key, dest: a.slice(2, 4) as Key, brush: 'green' }));
  if (!shapes.length && myTurn && !busy && (mode === 'learn' || reveal)) {
    const probe = new Chess(fen);
    try {
      const m = probe.move(opening.moves[ply]);
      shapes = [{ orig: m.from as Key, dest: m.to as Key, brush: mode === 'learn' ? 'green' : 'yellow' }];
    } catch {}
  }

  const context = () =>
    positionBlock(fen, [
      `Eröffnung: ${opening.name} (${opening.eco}). Der Schüler übt die Seite ${opening.side === 'w' ? 'Weiß' : 'Schwarz'}.`,
      `Grundidee: ${opening.idea}`,
      `Hauptvariante (Theorie): ${opening.moves.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}.${m}` : m)).join(' ')}`,
      `Bisher gespielt: ${opening.moves.slice(0, ply).join(' ') || '(noch nichts)'}`,
      !done ? `Nächster Theoriezug: ${opening.moves[ply]}` : 'Die Linie ist komplett gespielt.',
      wrong ? `Der Schüler hat eben ${wrong} versucht – das ist nicht die Hauptvariante.` : '',
    ]);

  const moveList = opening.moves.map((m, i) => ({ m, i })).filter(({ i }) => i < ply || (done && i < total));
  const pairs: { n: number; w?: string; b?: string }[] = [];
  moveList.forEach(({ m, i }) => {
    if (i % 2 === 0) pairs.push({ n: i / 2 + 1, w: m });
    else if (pairs.length) pairs[pairs.length - 1].b = m;
    else pairs.push({ n: 1, b: m });
  });

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
              <b>{opening.name}</b>
              <span className="rating">{opening.eco}</span>
            </div>
            <div className="bar-sub">
              <span className="muted-text">
                Zug {Math.min(Math.floor(ply / 2) + 1, Math.ceil(total / 2))} von {Math.ceil(total / 2)}
              </span>
            </div>
          </div>
        </div>
        <div className="board-wrap">
          <Board
            fen={vv.fen ?? fen}
            orientation={opening.side === 'w' ? 'white' : 'black'}
            movable={myTurn && !busy && !vv.active ? (opening.side === 'w' ? 'white' : 'black') : null}
            lastMove={vv.active ? vv.lastMove : lastMove}
            shapes={vv.active ? variationShapes(vv) : shapes}
            badge={vv.active ? undefined : badge}
            onMove={onMove}
          />
        </div>
        <div className="player-bar">
          <Avatar id="you" size={40} />
          <div className="player-info">
            <div className="player-name">
              <b>Du</b>
              <span className="rating">· {opening.side === 'w' ? 'Weiß' : 'Schwarz'}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="panel">
        <header className="panel-head">
          <button className="head-back" onClick={() => navigate('learn')} title="Zurück zur Übersicht">
            <ArrowLeft size={18} />
          </button>
          <Piece type="k" color={opening.side} size={22} />
          <h1>{opening.name}</h1>
        </header>
        <div className="panel-top">
          <div className="seg-tabs">
            <button className={mode === 'learn' ? 'on' : ''} onClick={() => restart('learn')}>
              <GraduationCap size={15} /> Lernen
            </button>
            <button className={mode === 'practice' ? 'on' : ''} onClick={() => restart('practice')}>
              <Swords size={15} /> Üben
            </button>
          </div>
          <p className="idea">{opening.idea}</p>
          {done ? (
            <div className="status-box good">
              <span className="status-icon">
                <Check size={22} strokeWidth={3} />
              </span>
              <div>
                <b>{mistakes === 0 ? 'Linie fehlerfrei gespielt!' : `Linie geschafft – ${mistakes} ${mistakes === 1 ? 'Fehler' : 'Fehler'}`}</b>
                <span>{mode === 'learn' ? 'Jetzt im Üben-Modus ohne Pfeile probieren.' : progress ? `${progress.perfect}× fehlerfrei geübt` : ''}</span>
              </div>
            </div>
          ) : wrong ? (
            <div className="status-box bad">
              <span className="status-icon">
                <X size={22} strokeWidth={3} />
              </span>
              <div>
                <b>{wrong} ist hier nicht die Theorie</b>
                <span>{mode === 'learn' || reveal ? 'Der Pfeil zeigt den Hauptzug.' : 'Versuch es nochmal.'}</span>
              </div>
            </div>
          ) : (
            <div className="status-box">
              <span className="status-icon piece">
                <Piece type="k" color={opening.side} size={30} />
              </span>
              <div>
                <b>{myTurn ? 'Dein Zug' : 'Gegner zieht …'}</b>
                <span>{mode === 'learn' ? 'Folge dem grünen Pfeil und merk dir die Idee.' : 'Spiel die Hauptvariante aus dem Gedächtnis.'}</span>
              </div>
            </div>
          )}
          <div className="line-moves">
            {pairs.map((p) => (
              <span key={p.n}>
                <i>{p.n}.</i> {p.w ?? '…'} {p.b ?? ''}
              </span>
            ))}
            {!done && <span className="muted-text">…</span>}
          </div>
          <div className="btn-row">
            <button className="btn" onClick={() => restart()}>
              <RotateCcw size={15} /> Neu starten
            </button>
            {!done && mode === 'practice' && (
              <button className="btn" onClick={() => setReveal(true)} disabled={!myTurn}>
                <Eye size={15} /> Zug zeigen
              </button>
            )}
            {done && (
              <button
                className="btn primary grow"
                onClick={() =>
                  onPractice({
                    bot: coachOpponent(Number(localStorage.getItem('coachLevel') ?? 1000)),
                    color: opening.side,
                    coach: true,
                    startFen: fen,
                    goal: `Wir spielen ab dem Ende der **${opening.name}** weiter. Setze die typischen Pläne um: ${opening.idea}`,
                    backTo: `learn/opening:${opening.id}`,
                  })
                }
              >
                <Swords size={15} /> Weiterspielen
              </button>
            )}
          </div>
        </div>
        <CoachChat
          vv={vv}
          fens={() => [fen, new Chess().fen()]}
          loggedIn={loggedIn}
          settings={settings}
          context={context}
          onArrows={setArrows}
          intro={`Wir üben die **${opening.name}** mit ${opening.side === 'w' ? 'Weiß' : 'Schwarz'}. Frag mich zu jedem Zug, warum er gespielt wird.`}
          quick={[
            { label: 'Warum dieser Zug?', prompt: 'Erkläre kurz die Idee hinter dem zuletzt gespielten Zug und dem nächsten Theoriezug.' },
            { label: 'Typische Pläne', prompt: 'Welche typischen Pläne und Strukturen ergeben sich aus dieser Eröffnung für meine Seite? Max. 150 Wörter.' },
            { label: 'Fallen', prompt: 'Welche typischen Fallen oder Fehler gibt es in dieser Eröffnung (für beide Seiten)? Nur Dinge, bei denen du dir sicher bist.' },
          ]}
        />
      </section>
    </div>
  );
}
