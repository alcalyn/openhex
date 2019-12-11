import React from 'react';
import ReactDOM from 'react-dom';
import GameRules from './GameRules';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<GameRules />, div);
});
