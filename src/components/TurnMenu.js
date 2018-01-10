import React, { Component } from 'react';

export default class TurnMenu extends Component {
    endTurn() {
        if (this.props.onEndTurn) {
            this.props.onEndTurn();
        }
    }

    render() {
        return (
            <div>
                <button onClick={ () => { this.endTurn(); } }>End turn</button>
            </div>
        );
    }
}
