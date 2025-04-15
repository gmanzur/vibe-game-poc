import React from 'react';
import Game from './game/Game';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Game />
    </div>
  );
};

export default App;
