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
            <div class="card">
                <h3 class="card-header d-none d-md-block">Game menu</h3>
                <div class="card-body">
                    <div class="row">
                        <div class="col-6 col-md-12">
                            <p class="lead d-none d-md-inline">Turn number: { arbiter.world.turn + 1 }</p>
                            <p>
                                <button
                                    class={ "btn btn-block btn-success" }
                                    onClick={ () => { this.endTurn(); } }
                                >End turn</button>
                            </p>
                        </div>
                        <div class="col-6 col-md-6">
                            <p>
                                <button
                                    class={ "btn btn-block btn-outline-primary" + this.enabledIf(arbiter.hasUndo()) }
                                    onClick={ () => { this.undo(); } }
                                >Undo</button>
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p class="d-none d-md-block">
                                <button
                                    class={ "btn btn-block btn-outline-primary" + this.enabledIf(arbiter.hasRedo()) }
                                    onClick={ () => { this.redo(); } }
                                >Redo</button>
                            </p>
                        </div>
                        <div class="col-md-12">
                            <p class="d-none d-md-block">
                                <button
                                    class={ "btn btn-block btn-outline-warning" + this.enabledIf(arbiter.hasUndo()) }
                                    onClick={ () => { this.undoAll(); } }
                                >Reset turn</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
