import { useEffect, useState } from 'react';
import { History, Microscope, Trash2 } from 'lucide-react';
import { store, tcLabel, type GameRecord } from '../lib/data';
import { Avatar, Piece } from '../components/ui';
import { navigate } from '../router';

const RESULT: Record<GameRecord['result'], { label: string; cls: string }> = {
  win: { label: 'Sieg', cls: 'win' },
  loss: { label: 'Niederlage', cls: 'loss' },
  draw: { label: 'Remis', cls: 'draw' },
};
const MODE: Record<GameRecord['mode'], string> = { coach: 'Coach', bot: 'Bot', practice: 'Training' };

export function Games() {
  const [games, setGames] = useState<GameRecord[] | null>(null);
  const [filter, setFilter] = useState<'all' | GameRecord['mode']>('all');

  useEffect(() => {
    store.list('games').then((g) => setGames([...g].sort((a, b) => b.date.localeCompare(a.date)))).catch(() => setGames([]));
  }, []);

  const shown = (games ?? []).filter((g) => filter === 'all' || g.mode === filter);

  return (
    <div className="page">
      <header className="page-head">
        <History size={26} />
        <div>
          <h1>Partien</h1>
          <p>{games ? `${games.length} gespeicherte Partien – klick eine an, um sie zu analysieren.` : 'Lade …'}</p>
        </div>
      </header>

      <div className="tabs">
        {(['all', 'coach', 'bot', 'practice'] as const).map((f) => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Alle' : MODE[f]}
          </button>
        ))}
      </div>

      {games && !shown.length && (
        <div className="empty-card">
          <b>Noch keine Partien</b>
          <p>Fertige Partien werden automatisch hier gespeichert.</p>
        </div>
      )}

      <div className="game-list">
        {shown.map((g) => {
          const acc = g.analysis?.accuracy[g.color] ?? g.accuracy;
          return (
            <div key={g.id} className="game-row" onClick={() => navigate(`analysis/${g.id}`)}>
              <Avatar id={g.botId} size={44} />
              <div className="gr-main">
                <b>
                  {g.botName} <span className="rating">({g.botRating})</span>
                </b>
                <span className="gr-sub">
                  <Piece type="k" color={g.color} size={15} /> {g.timeControl ? `Bullet ${tcLabel(g.timeControl)}` : MODE[g.mode]} · {Math.ceil(g.sans.length / 2)} Züge · {g.reason}
                  {g.takebacks > 0 && ` · ${g.takebacks}× zurückgenommen`}
                </span>
              </div>
              <span className={`result ${RESULT[g.result].cls}`}>{RESULT[g.result].label}</span>
              <span className="gr-acc">{acc != null ? `${Math.round(acc * 10) / 10}%` : '–'}</span>
              <span className="gr-date">{new Date(g.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
              <button className="icon-btn" title="Analysieren">
                <Microscope size={17} />
              </button>
              <button
                className="icon-btn"
                title="Löschen"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm('Diese Partie wirklich löschen?')) return;
                  await store.remove('games', g.id);
                  setGames((gs) => gs!.filter((x) => x.id !== g.id));
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
