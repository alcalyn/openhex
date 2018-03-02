import React, { Component } from 'react';

export default class GameMenu extends Component {
    endTurn() {
        try {
            this.props.arbiter.endTurn();
        } catch (e) {
            this.props.handleArbiterError(e);
        }

        this.props.updateCallback();
    }

    undo() {
        this.props.arbiter.undo();
        this.props.updateCallback();
    }

    enabledIf(bool) {
        return !bool ? ' disabled' : '';
    }

    render() {
        const arbiter = this.props.arbiter;

        return (
            <div className="game-menu">
                <h3 className="card-header d-none d-md-block">Turn { arbiter.world.turn + 1 }</h3>
                <div className="card-body">
                    <div className="inline-buttons">
                        <button
                            className={ "btn btn-outline-primary" + this.enabledIf(arbiter.hasUndo()) }
                            onClick={ () => { this.undo(); } }
                        >Undo</button>
                        <button
                            className={ "btn btn-success" }
                            onClick={ () => { this.endTurn(); } }
                        >End turn</button>
                    </div>
                </div>
            </div>
        );
    }
}
