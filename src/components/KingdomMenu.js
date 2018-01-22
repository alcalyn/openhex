import React, { Component } from 'react';

export default class Selection extends Component {
    buyUnit() {
        try {
            this.props.arbiter.buyUnit();

            if (this.props.onUpdate) {
                this.props.onUpdate();
            }
        } catch (e) {
            console.warn(e.message);
        }
    }

    buyTower() {
        try {
            this.props.arbiter.buyTower();

            if (this.props.onUpdate) {
                this.props.onUpdate();
            }
        } catch (e) {
            console.warn(e.message);
        }
    }

    render() {
        const kingdom = this.props.arbiter.currentKingdom;

        if (!kingdom) {
            return <div></div>;
        }

        return (
            <div>
                <p>Money: <span>{ kingdom.money }</span></p>
                <p><button onClick={ () => { this.buyUnit(); } }>Buy Unit ($10)</button></p>
                <p><button onClick={ () => { this.buyTower(); } }>Buy Tower ($15)</button></p>
            </div>
        );
    }
}
