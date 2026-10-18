import { L } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { api, type AuthInfo, type ModelInfo } from '../api';

export interface CoachSettings {
  model: string;
  effort: string;
}

interface Props {
  auth: AuthInfo | null;
  setAuth: (a: AuthInfo) => void;
  settings: CoachSettings;
  setSettings: (s: CoachSettings) => void;
}

const EFFORT_LABEL: Record<string, string> = {
  none: L('Aus', 'Off'), minimal: 'Minimal', low: L('Niedrig', 'Low'), medium: L('Mittel', 'Medium'), high: L('Hoch', 'High'), xhigh: L('Sehr hoch', 'Very high'), max: 'Max', ultra: 'Ultra',
};

/** Konto- und Modellbereich unten in der Sidebar */
export function AccountBar({ auth, setAuth, settings, setSettings }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const poll = useRef<number>();

  useEffect(() => {
    if (!auth?.loggedIn) return;
    api
      .models()
      .then(({ models }) => {
        setModels(models);
        setError('');
        if (models.length && !models.some((m) => m.id === settings.model)) {
          const m = models[0];
          setSettings({ model: m.id, effort: m.efforts.includes('low') ? 'low' : m.defaultEffort });
        }
      })
      .catch((e) => setError(e.message));
  }, [auth?.loggedIn]);

  useEffect(() => () => clearInterval(poll.current), []);

  async function login() {
    setBusy(true);
    setError('');
    try {
      const { url } = await api.login();
      window.open(url, 'chatgpt-login', 'width=520,height=720');
      clearInterval(poll.current);
      const started = Date.now();
      poll.current = window.setInterval(async () => {
        const s = await api.status().catch(() => null);
        if (s?.loggedIn) {
          clearInterval(poll.current);
          setAuth(s);
          setBusy(false);
        } else if (Date.now() - started > 180_000) {
          clearInterval(poll.current);
          setBusy(false);
        }
      }, 1500);
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }

  async function importCodex() {
    setError('');
    try {
      setAuth(await api.importCodex());
    } catch (e: any) {
      setError(e.message);
    }
  }

  const model = models.find((m) => m.id === settings.model);

  if (!auth?.loggedIn) {
    return (
      <div className="account">
        <div className="account-title">
          <Sparkles size={14} /> Coach-KI
        </div>
        <p className="account-hint">{L('Verbinde dein ChatGPT-Abo, damit der Coach Züge erklärt.', 'Connect your ChatGPT subscription so the coach can explain moves.')}</p>
        <button className="btn primary block" onClick={login} disabled={busy}>
          <OpenAIIcon /> {busy ? L('Warte auf Login …', 'Waiting for login …') : L('Mit ChatGPT anmelden', 'Sign in with ChatGPT')}
        </button>
        <button className="link-btn" onClick={importCodex}>
          {L('Codex-Login übernehmen', 'Use Codex login')}
        </button>
        {error && <p className="account-err">{error}</p>}
      </div>
    );
  }

  return (
    <div className="account">
      <div className="account-title">
        <Sparkles size={14} /> Coach-KI
      </div>
      <Select
        label={L('Modell', 'Model')}
        value={settings.model}
        options={(model ? models : [{ id: settings.model, name: settings.model || '…' } as ModelInfo, ...models]).map((m) => ({ value: m.id, label: m.name }))}
        onChange={(v) => {
          const m = models.find((x) => x.id === v);
          if (m) setSettings({ model: m.id, effort: m.efforts.includes(settings.effort) ? settings.effort : m.defaultEffort });
        }}
      />
      {model && model.efforts.length > 0 && (
        <Select
          label={L('Denkaufwand', 'Reasoning effort')}
          value={settings.effort}
          options={model.efforts.map((e) => ({ value: e, label: EFFORT_LABEL[e] ?? e }))}
          onChange={(v) => setSettings({ ...settings, effort: v })}
        />
      )}
      <div className="account-user">
        <OpenAIIcon />
        <span className="email" title={auth.email}>
          {auth.email ?? 'ChatGPT'}
        </span>
        {auth.plan && <span className="plan">{auth.plan}</span>}
        <button className="icon-btn" title={L('Abmelden', 'Sign out')} onClick={async () => setAuth(await api.logout())}>
          <LogOut size={15} />
        </button>
      </div>
      {error && <p className="account-err">{error}</p>}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="select">
      <span>{label}</span>
      <div className="select-box">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} />
      </div>
    </label>
  );
}

function OpenAIIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zM13.26 22.43a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zM3.6 18.3a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97V11.6a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.87zm16.6 3.86-5.83-3.39 2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.41-.66zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86 6.29 11.7a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.39.68zm1.1-2.37 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
    </svg>
  );
}
