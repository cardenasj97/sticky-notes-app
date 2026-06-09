import { useState } from 'react';
import { useNotes } from './hooks/useNotes';
import { NOTE_COLORS } from './types';
import { Board } from './components/Board';
import { Toolbar } from './components/Toolbar';
import './App.css';

const STATUS_LABEL: Record<string, string> = {
  loading: 'Loading…',
  saving: 'Saving…',
  ready: 'All changes saved',
};

function App() {
  const { notes, dispatch, status } = useNotes();
  const [activeColor, setActiveColor] = useState<string>(NOTE_COLORS[0]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Sticky Notes</h1>
        <Toolbar activeColor={activeColor} onColorChange={setActiveColor} />
        <span className={`app__status app__status--${status}`} role="status">
          {STATUS_LABEL[status]}
        </span>
      </header>
      <Board notes={notes} dispatch={dispatch} activeColor={activeColor} />
    </div>
  );
}

export default App;
