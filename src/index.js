import './assets/css/bootstrap4-sketchy.min.css';
import './assets/css/bootstrap4-sketchy-override.css';
import './assets/fonts/fonts.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import { App, CreateCustomGame, GameRules, Home } from './components';

ReactDOM.render(
    (
        <HashRouter>
            <Switch>
                <Route path="/game" component={ App }/>
                <Route path="/create-custom-game" component={ CreateCustomGame }/>
                <Route path="/game-rules" component={ GameRules }/>
                <Route path="/" component={ Home }/>
            </Switch>
        </HashRouter>
    ),
    document.getElementById('root')
);

registerServiceWorker();
