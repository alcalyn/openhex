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

    getBalanceDiff(balance) {
        if (!balance) {
            return;
        }

        const diff = balance.diff();

        if (diff > 0) {
            return <span className="balance">(<span className="text-success">+{ diff }</span>)</span>;
        }

        if (diff < 0) {
            return <span className="balance">(<span className="text-danger">{ diff }</span>)</span>;
        }

        return <span className="balance">(±0)</span>;
    }

    disabledBefore(money) {
        if (this.props.arbiter.currentKingdom.money < money) {
            return ' disabled';
        }

        return '';
    }

    render() {
        const kingdom = this.props.arbiter.currentKingdom;

        if (!kingdom) {
            return <div></div>;
        }

        return (
            <div class="card">
                <h3 class="card-header">Kingdom menu</h3>
                <div class="card-body">
                    <p class="h2">
                        Money: <b>{ kingdom.money }</b>
                        &nbsp;
                        { this.getBalanceDiff(kingdom.balance) }
                    </p>

                    { kingdom.balance ? (
                        <p class>
                            Last turn: { kingdom.balance.lastCapital }<br />
                            Income: +{ kingdom.balance.income }<br />
                            Units: -{ kingdom.balance.maintenance }
                        </p>
                    ) : '' }

                </div>
                <div className="card-body">
                    <h4 className="card-title">Military</h4>
                    <p><button className={"btn btn-success btn-lg btn-block" + this.disabledBefore(10)} onClick={ () => { this.buyUnit(); } }>Buy Unit ($10)</button></p>
                    <p><button className={"btn btn-success btn-lg btn-block" + this.disabledBefore(15)} onClick={ () => { this.buyTower(); } }>Buy Tower ($15)</button></p>
                </div>
            </div>
        );
    }
}
