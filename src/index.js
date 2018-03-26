import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Home, CreateCustomGame, GameRules } from './components';
import { HashRouter, Route, Switch } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker';

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
