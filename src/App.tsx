import { useEffect, useState } from 'react';
import { BookOpen, Bot, CalendarDays, GraduationCap, History, Languages, Microscope, Puzzle, TrendingUp, Zap } from 'lucide-react';
import { api, type AuthInfo } from './api';
import { AccountBar, type CoachSettings } from './components/AccountBar';
import { Home, type GameSetup } from './components/Home';
import { Game } from './components/Game';
import { Piece } from './components/ui';
import { Puzzles } from './pages/Puzzles';
import { Learn } from './pages/Learn';
import { Analysis } from './pages/Analysis';
import { Games } from './pages/Games';
import { Stats } from './pages/Stats';
import { Bullet } from './pages/Bullet';
import { Rush } from './pages/Rush';
import { useRoute, navigate } from './router';
import { L, lang, setLang } from './i18n';

function loadSettings(): CoachSettings {
  try {
    return { model: '', effort: 'low', ...JSON.parse(localStorage.getItem('coachSettings') ?? '{}') };
  } catch {
    return { model: '', effort: 'low' };
  }
}

export type Mode = 'coach' | 'bots';

const NAV = [
  { route: 'coach', label: 'Coach', icon: GraduationCap },
  { route: 'bots', label: 'Bots', icon: Bot },
  { route: 'bullet', label: 'Bullet', icon: Zap },
  { route: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { route: 'daily', label: L('Tagesrätsel', 'Daily puzzle'), icon: CalendarDays },
  { route: 'learn', label: L('Lernen', 'Learn'), icon: BookOpen },
  { route: 'analysis', label: L('Analyse', 'Analysis'), icon: Microscope },
  { route: 'games', label: L('Partien', 'Games'), icon: History },
  { route: 'stats', label: L('Statistik', 'Stats'), icon: TrendingUp },
] as const;

export interface PageProps {
  loggedIn: boolean;
  settings: CoachSettings;
}

export function App() {
  const [auth, setAuth] = useState<AuthInfo | null>(null);
  const [settings, setSettings] = useState<CoachSettings>(loadSettings);
  const [setup, setSetup] = useState<GameSetup | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [route, param] = useRoute();

  useEffect(() => {
    api.status().then(setAuth).catch(() => setAuth({ loggedIn: false }));
  }, []);
  useEffect(() => {
    localStorage.setItem('coachSettings', JSON.stringify(settings));
  }, [settings]);

  const loggedIn = !!auth?.loggedIn && !!settings.model;
  const page = { loggedIn, settings };

  function startGame(s: GameSetup) {
    setSetup(s);
    setGameKey((k) => k + 1);
    navigate('play');
  }

  let content;
  if (route === 'play' && setup)
    content = (
      <Game
        key={gameKey}
        setup={setup}
        loggedIn={loggedIn}
        settings={settings}
        onExit={() => navigate(setup.backTo ?? (setup.coach && setup.bot.id === 'coach' ? 'coach' : 'bots'))}
        onRematch={() => startGame({ ...setup, color: setup.startFen ? setup.color : setup.color === 'w' ? 'b' : 'w' })}
        onNewGame={setup.startFen ? undefined : (line) => startGame({ ...setup, openingLine: line })}
      />
    );
  else if (route === 'puzzles' || route === 'daily') content = <Puzzles key={route} daily={route === 'daily'} {...page} />;
  else if (route === 'learn') content = <Learn {...page} param={param} onPractice={startGame} />;
  else if (route === 'analysis') content = <Analysis key={param ?? 'free'} gameId={param} {...page} />;
  else if (route === 'games') content = <Games />;
  else if (route === 'stats') content = <Stats />;
  else if (route === 'bullet') content = <Bullet onStart={startGame} />;
  else if (route === 'rush') content = <Rush key={param ?? '180'} seconds={[60, 180, 300].includes(Number(param)) ? Number(param) : 180} />;
  else content = <Home mode={route === 'bots' ? 'bots' : 'coach'} loggedIn={loggedIn} onStart={startGame} />;

  const active = route === 'rush' ? 'bullet' : route === 'play' ? (setup?.backTo ?? (setup?.bot.id === 'coach' ? 'coach' : 'bots')).split('/')[0] : route;

  return (
    <div className="app">
      <aside className="sidebar">
        <button className="logo" onClick={() => navigate('coach')}>
          <Piece type="n" color="w" size={30} />
          <span>
            GPT-<b>Schach</b>
          </span>
        </button>
        <nav>
          {NAV.map(({ route: r, label, icon: Icon }) => (
            <button key={r} className={active === r ? 'on' : ''} onClick={() => navigate(r)}>
              <Icon size={21} /> {label}
            </button>
          ))}
        </nav>
        <AccountBar auth={auth} setAuth={setAuth} settings={settings} setSettings={setSettings} />
        <div className="lang-switch" title={L('Sprache', 'Language')}>
          <Languages size={14} />
          {(['de', 'en'] as const).map((l) => (
            <button key={l} className={lang === l ? 'on' : ''} onClick={() => lang !== l && setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </aside>
      <main>{content}</main>
    </div>
  );
}
