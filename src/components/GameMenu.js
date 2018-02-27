import React, { Component } from 'react';

export default class GameMenu extends Component {
    endTurn() {
        this.props.arbiter.endTurn();
        this.props.updateCallback();
    }

    undo() {
        this.props.arbiter.undo();
        this.props.updateCallback();
    }

    redo() {
        this.props.arbiter.redo();
        this.props.updateCallback();
    }

    undoAll() {
        this.props.arbiter.undoAll();
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
