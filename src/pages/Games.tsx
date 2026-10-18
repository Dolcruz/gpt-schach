import { L, locale } from '../i18n';
import { useEffect, useState } from 'react';
import { History, Microscope, Trash2 } from 'lucide-react';
import { reasonLabel, store, tcLabel, type GameRecord } from '../lib/data';
import { Avatar, Piece } from '../components/ui';
import { navigate } from '../router';

const RESULT: Record<GameRecord['result'], { label: string; cls: string }> = {
  win: { label: L('Sieg', 'Win'), cls: 'win' },
  loss: { label: L('Niederlage', 'Loss'), cls: 'loss' },
  draw: { label: L('Remis', 'Draw'), cls: 'draw' },
};
const MODE: Record<GameRecord['mode'], string> = { coach: 'Coach', bot: 'Bot', practice: L('Training', 'Practice') };

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
          <h1>{L('Partien', 'Games')}</h1>
          <p>{games ? L(`${games.length} gespeicherte Partien – klick eine an, um sie zu analysieren.`, `${games.length} saved games – click one to analyze it.`) : L('Lade …', 'Loading …')}</p>
        </div>
      </header>

      <div className="tabs">
        {(['all', 'coach', 'bot', 'practice'] as const).map((f) => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {f === 'all' ? L('Alle', 'All') : MODE[f]}
          </button>
        ))}
      </div>

      {games && !shown.length && (
        <div className="empty-card">
          <b>{L('Noch keine Partien', 'No games yet')}</b>
          <p>{L('Fertige Partien werden automatisch hier gespeichert.', 'Finished games are saved here automatically.')}</p>
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
                  <Piece type="k" color={g.color} size={15} /> {g.timeControl ? `Bullet ${tcLabel(g.timeControl)}` : MODE[g.mode]} · {Math.ceil(g.sans.length / 2)} {L('Züge', 'moves')} · {reasonLabel(g.reason)}
                  {g.takebacks > 0 && L(` · ${g.takebacks}× zurückgenommen`, ` · ${g.takebacks}× taken back`)}
                </span>
              </div>
              <span className={`result ${RESULT[g.result].cls}`}>{RESULT[g.result].label}</span>
              <span className="gr-acc">{acc != null ? `${Math.round(acc * 10) / 10}%` : '–'}</span>
              <span className="gr-date">{new Date(g.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: '2-digit' })}</span>
              <button className="icon-btn" title={L('Analysieren', 'Analyze')}>
                <Microscope size={17} />
              </button>
              <button
                className="icon-btn"
                title={L('Löschen', 'Delete')}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(L('Diese Partie wirklich löschen?', 'Really delete this game?'))) return;
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
