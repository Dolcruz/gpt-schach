import { L } from '../i18n';
import { useEffect, useState } from 'react';
import { BookOpen, Check, Crown, Swords } from 'lucide-react';
import { DRILLS, groupLabel, LESSON_GROUPS, LESSON_TARGET, LESSONS, levelLabel } from '../lib/lessons';
import { familyLabel, OPENINGS } from '../lib/openings';
import { store, type LessonProgress, type OpeningProgress } from '../lib/data';
import { BOTS } from '../bots';
import { navigate } from '../router';
import { Piece } from '../components/ui';
import type { GameSetup } from '../components/Home';
import type { PageProps } from '../App';
import { LessonView } from './LessonView';
import { OpeningTrainer } from './OpeningTrainer';

interface Props extends PageProps {
  param?: string;
  onPractice: (s: GameSetup) => void;
}

type Tab = 'lessons' | 'openings' | 'endgames';

export function Learn({ param, onPractice, ...page }: Props) {
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [openings, setOpenings] = useState<OpeningProgress[]>([]);
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem('learnTab') as Tab) ?? 'lessons');

  useEffect(() => {
    store.list('lessons').then(setLessons).catch(() => {});
    store.list('openings').then(setOpenings).catch(() => {});
  }, [param]);
  useEffect(() => {
    localStorage.setItem('learnTab', tab);
  }, [tab]);

  if (param?.startsWith('lesson:')) {
    const l = LESSONS.find((x) => x.id === param.slice(7));
    if (l) return <LessonView key={l.id} lesson={l} {...page} />;
  }
  if (param?.startsWith('opening:')) {
    const o = OPENINGS.find((x) => x.id === param.slice(8));
    if (o) return <OpeningTrainer key={o.id} opening={o} {...page} onPractice={onPractice} />;
  }

  const lp = (id: string) => lessons.find((x) => x.id === id);
  const op = (id: string) => openings.find((x) => x.id === id);
  const doneLessons = LESSONS.filter((l) => lp(l.id)?.completed).length;
  const doneOpenings = OPENINGS.filter((o) => (op(o.id)?.perfect ?? 0) > 0).length;

  return (
    <div className="page">
      <header className="page-head">
        <BookOpen size={26} />
        <div>
          <h1>{L('Lernen', 'Learn')}</h1>
          <p>
            {L(`${doneLessons} von ${LESSONS.length} Lektionen abgeschlossen · ${doneOpenings} von ${OPENINGS.length} Eröffnungen gemeistert`, `${doneLessons} of ${LESSONS.length} lessons completed · ${doneOpenings} of ${OPENINGS.length} openings mastered`)}
          </p>
        </div>
      </header>

      <div className="tabs">
        <button className={tab === 'lessons' ? 'on' : ''} onClick={() => setTab('lessons')}>
          {L('Lektionen', 'Lessons')}
        </button>
        <button className={tab === 'openings' ? 'on' : ''} onClick={() => setTab('openings')}>
          {L('Eröffnungen', 'Openings')}
        </button>
        <button className={tab === 'endgames' ? 'on' : ''} onClick={() => setTab('endgames')}>
          {L('Endspieltechnik', 'Endgame technique')}
        </button>
      </div>

      {tab === 'lessons' &&
        LESSON_GROUPS.map((g) => (
          <section key={g} className="card-section">
            <h2>{groupLabel(g)}</h2>
            <div className="card-grid">
              {LESSONS.filter((l) => l.group === g).map((l) => {
                const p = lp(l.id);
                const pct = Math.min(1, (p?.solved ?? 0) / LESSON_TARGET);
                return (
                  <button key={l.id} className={`learn-card ${p?.completed ? 'done' : ''}`} onClick={() => navigate(`learn/lesson:${l.id}`)}>
                    <div className="learn-card-top">
                      <span className={`level-tag ${l.level}`}>{levelLabel(l.level)}</span>
                      {p?.completed && (
                        <span className="done-badge">
                          <Check size={13} strokeWidth={3.5} />
                        </span>
                      )}
                    </div>
                    <b>{l.title}</b>
                    <span className="learn-sum">{l.summary}</span>
                    <div className="progress">
                      <i style={{ width: `${pct * 100}%` }} />
                    </div>
                    <span className="learn-meta">
                      {Math.min(p?.solved ?? 0, LESSON_TARGET)}/{LESSON_TARGET} {L('Übungen', 'exercises')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

      {tab === 'openings' &&
        (['Offene Spiele (1.e4 e5)', 'Halboffene Spiele (1.e4 andere)', 'Geschlossene Spiele (1.d4)', 'Flankeneröffnungen'] as const).map((fam) => (
          <section key={fam} className="card-section">
            <h2>{familyLabel(fam)}</h2>
            <div className="card-grid">
              {OPENINGS.filter((o) => o.family === fam).map((o) => {
                const p = op(o.id);
                return (
                  <button key={o.id} className={`learn-card ${p?.perfect ? 'done' : ''}`} onClick={() => navigate(`learn/opening:${o.id}`)}>
                    <div className="learn-card-top">
                      <span className="eco">{o.eco}</span>
                      <span className="side-tag">
                        <Piece type="k" color={o.side} size={18} /> {o.side === 'w' ? L('Weiß', 'White') : L('Schwarz', 'Black')}
                      </span>
                      {!!p?.perfect && (
                        <span className="done-badge">
                          <Check size={13} strokeWidth={3.5} />
                        </span>
                      )}
                    </div>
                    <b>{o.name}</b>
                    <span className="learn-sum mono">{o.moves.slice(0, 6).map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}.${m}` : m)).join(' ')} …</span>
                    <span className="learn-meta">{p ? L(`${p.runs}× geübt · ${p.perfect}× fehlerfrei`, `practiced ${p.runs}× · ${p.perfect}× perfect`) : L('Noch nicht geübt', 'Not practiced yet')}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

      {tab === 'endgames' && (
        <section className="card-section">
          <h2>{L('Gegen Stockfish in voller Stärke', 'Against full-strength Stockfish')}</h2>
          <p className="section-hint">{L('Grundlegende Gewinntechniken. Stockfish verteidigt perfekt – der Coach hilft dir mit Hinweisen und erklärt deine Züge.', 'Basic winning techniques. Stockfish defends perfectly – the coach helps with hints and explains your moves.')}</p>
          <div className="card-grid">
            {DRILLS.map((d) => (
              <button
                key={d.id}
                className="learn-card"
                onClick={() =>
                  onPractice({
                    bot: { ...BOTS.find((b) => b.id === 'max')!, lines: {} },
                    color: 'w',
                    coach: true,
                    startFen: d.fen,
                    goal: d.goal,
                    backTo: 'learn',
                  })
                }
              >
                <div className="learn-card-top">
                  <span className="level-tag Fortgeschritten">
                    <Crown size={12} /> {L('Technik', 'Technique')}
                  </span>
                </div>
                <b>{d.title}</b>
                <span className="learn-sum">{d.summary}</span>
                <span className="learn-meta">
                  <Swords size={13} /> {L('Gegen Stockfish üben', 'Practice vs Stockfish')}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
