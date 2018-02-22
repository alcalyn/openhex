import React, { Component } from 'react';

export default class TurnMenu extends Component {
    endTurn() {
        if (this.props.onEndTurn) {
            this.props.onEndTurn();
        }
    }

    undo() {
        if (this.props.onUndo) {
            this.props.onUndo();
        }
    }

    redo() {
        if (this.props.onRedo) {
            this.props.onRedo();
        }
    }

    undoAll() {
        if (this.props.onUndoAll) {
            this.props.onUndoAll();
        }
    }

    render() {
        return (
            <div>
                <button class="btn btn-success btn-lg" onClick={ () => { this.endTurn(); } }>End turn</button>
                <button class="btn btn-outline-primary" onClick={ () => { this.undo(); } }>Undo</button>
                <button class="btn btn-outline-primary" onClick={ () => { this.redo(); } }>Redo</button>
                <button class="btn btn-outline-warning" onClick={ () => { this.undoAll(); } }>Reset turn</button>
            </div>
        );
    }
}
