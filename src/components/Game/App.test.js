import React from 'react';
import ReactDOM from 'react-dom';
import { Arbiter, WorldConfig, WorldGenerator } from '../../engine';
import { App, OpenHexGrid } from '.';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

it('renders game without crashing', () => {
  const worldConfig = WorldConfig({
    size: 6,
  });
  const world = WorldGenerator.generate('seed-test', worldConfig);
  const arbiter = new Arbiter(world);

  const div = document.createElement('div');
  ReactDOM.render(<OpenHexGrid
    world={ world }
    arbiter={ arbiter }
  />, div);
});
