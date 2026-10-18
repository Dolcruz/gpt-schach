import { L } from '../i18n';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { streamCoach, type ChatMsg } from '../api';
import { TRAINER_INSTRUCTIONS } from '../coach';
import { extractMarkers, hideMarkers, resolveVariation, scrollFeedToEnd, type Variation, type VariationView } from '../lib/variation';
import { VariationLine } from './Variation';
import type { CoachSettings } from './AccountBar';
import { Avatar, Markdown } from './ui';

interface Msg {
  id: number;
  from: 'coach' | 'user';
  text: string;
  streaming?: boolean;
  error?: boolean;
  variations?: Variation[];
}

export interface CoachChatHandle {
  /** Frage an das Modell stellen; `shown` ist der Text, der als Nutzer-Nachricht erscheint (leer = keine) */
  ask: (prompt: string, shown?: string) => Promise<void>;
  /** Coach-Nachricht ohne KI hinzufügen */
  say: (text: string) => void;
  clear: () => void;
}

interface Props {
  loggedIn: boolean;
  settings: CoachSettings;
  /** Aktuelle Stellung/Situation als Text für das Modell */
  context: () => Promise<string> | string;
  level?: number;
  intro?: string;
  placeholder?: string;
  quick?: { label: string; prompt: string }[];
  onArrows?: (arrows: string[]) => void;
  /** Stellungen, ab denen Coach-Varianten gelten können (die erste passende wird genommen) */
  fens?: () => string[];
  /** Variante auf dem Brett anzeigen */
  vv?: VariationView;
}

let nextId = 0;

export const CoachChat = forwardRef<CoachChatHandle, Props>(function CoachChat(
  { loggedIn, settings, context, level = 1200, intro, placeholder = L('Frag den Coach …', 'Ask the coach …'), quick, onArrows, fens, vv },
  ref,
) {
  const [msgs, setMsgs] = useState<Msg[]>(() => (intro ? [{ id: ++nextId, from: 'coach', text: intro }] : []));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const live = useRef({ msgs, settings, context, onArrows, loggedIn, fens });
  live.current = { msgs, settings, context, onArrows, loggedIn, fens };
  const ctl = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollFeedToEnd(end.current);
  }, [msgs]);
  useEffect(() => () => ctl.current?.abort(), []);

  const patch = (id: number, p: Partial<Msg>) => setMsgs((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const ask = useCallback(async (prompt: string, shown?: string) => {
    if (shown) setMsgs((ms) => [...ms, { id: ++nextId, from: 'user', text: shown }]);
    if (!live.current.loggedIn) {
      setMsgs((ms) => [...ms, { id: ++nextId, from: 'coach', text: L('Melde dich links unten mit ChatGPT an, dann erkläre ich dir alles im Detail.', "Sign in with ChatGPT at the bottom left and I'll explain everything in detail."), error: true }]);
      return;
    }
    const id = ++nextId;
    const history: ChatMsg[] = live.current.msgs
      .filter((m) => m.text && !m.error && !m.streaming)
      .slice(-8)
      .map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));
    setMsgs((ms) => [...ms, { id, from: 'coach', text: '', streaming: true }]);
    setBusy(true);
    ctl.current?.abort();
    ctl.current = new AbortController();
    try {
      const ctx = await live.current.context();
      const { model, effort } = live.current.settings;
      const full = await streamCoach(
        {
          model,
          effort,
          instructions: TRAINER_INSTRUCTIONS.replace('{LEVEL}', String(level)),
          messages: [...history, { role: 'user', content: `${ctx}\n\n${prompt}` }],
        },
        (t) => patch(id, { text: hideMarkers(t) }),
        ctl.current.signal,
      );
      const { text, arrows, lines } = extractMarkers(full);
      const candidates = live.current.fens?.() ?? [];
      const variations = lines.map((l, i) => resolveVariation(l, candidates, lines.length > 1 ? `${L('Coach-Variante', 'Coach line')} ${i + 1}` : L('Coach-Variante', 'Coach line'))).filter((v): v is Variation => !!v);
      patch(id, { text, streaming: false, variations });
      if (arrows.length) live.current.onArrows?.(arrows);
    } catch (e: any) {
      if (e.name === 'AbortError') setMsgs((ms) => ms.filter((m) => m.id !== id || m.text));
      else patch(id, { text: `${L('Coach nicht erreichbar', 'Coach unavailable')}: ${e.message}`, streaming: false, error: true });
    } finally {
      setBusy(false);
    }
  }, [level]);

  useImperativeHandle(
    ref,
    () => ({
      ask,
      say: (text) => setMsgs((ms) => [...ms, { id: ++nextId, from: 'coach', text }]),
      clear: () => {
        ctl.current?.abort();
        setMsgs(intro ? [{ id: ++nextId, from: 'coach', text: intro }] : []);
      },
    }),
    [ask, intro],
  );

  function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    ask(`${L('Frage des Schülers', "Student's question")}: ${q}`, q);
  }

  return (
    <div className="coach-chat">
      <div className="feed">
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.from} ${m.error ? 'error' : ''}`}>
            {m.from === 'coach' && <Avatar id="coach" size={36} />}
            <div className="bubble">
              {m.text && (
                <div className="text">
                  <Markdown text={m.text} />
                </div>
              )}
              {vv && m.variations?.map((v, i) => <VariationLine key={i} v={v} onOpen={vv.open} active={vv.variation === v} activeIdx={vv.idx} />)}
              {m.streaming && !m.text && (
                <div className="typing">
                  <i />
                  <i />
                  <i />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      {quick && quick.length > 0 && (
        <div className="quick">
          {quick.map((q) => (
            <button key={q.label} className="chip" disabled={busy} onClick={() => ask(q.prompt, q.label)}>
              {q.label}
            </button>
          ))}
        </div>
      )}
      <form
        className="ask"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={loggedIn ? placeholder : L('Anmelden, um Fragen zu stellen', 'Sign in to ask questions')} disabled={!loggedIn} />
        <button className="send" disabled={busy || !input.trim()} title={L('Senden', 'Send')}>
          <SendHorizontal size={18} />
        </button>
      </form>
    </div>
  );
});
