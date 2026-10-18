import { createRoot } from 'react-dom/client';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.cburnett.css';
import './styles.css';
import './pages.css';
import './variation.css';
import './bullet.css';
import './crowns.css';
import './explore.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
