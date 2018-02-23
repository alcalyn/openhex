import React, { Component } from 'react';
import Themes from '../themes';

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
                <h3 class="card-header d-none d-md-block">Kingdom menu</h3>
                <div class="card-body">
                    <div class="row">
                        <div class="col-4 col-md-12">
                            <p class="h4">
                                <span class="d-none d-md-inline">Money:</span>
                                <b>{ kingdom.money }</b>
                                &nbsp;
                                { this.getBalanceDiff(kingdom.balance) }
                            </p>

                            { kingdom.balance ? (
                                <p class="d-none d-md-block">
                                    Last turn: { kingdom.balance.lastCapital }<br />
                                    Income: +{ kingdom.balance.income }<br />
                                    Units: -{ kingdom.balance.maintenance }
                                </p>
                            ) : '' }
                        </div>
                        <div class="col-4 col-md-12">
                            <h4 className="card-title d-none d-md-block">Selection</h4>
                            <div class="selection-container d-block text-center">
                                {!this.props.arbiter.selection ? '' :
                                    <img
                                        src={Themes.getImageFor(this.props.arbiter.selection)}
                                        alt="selection"
                                    />
                                }
                            </div>
                        </div>
                        <div class="col-4 col-md-12">
                            <h4 className="card-title d-none d-md-block">Military</h4>
                            <p><button className={"btn btn-success btn-block" + this.disabledBefore(10)} onClick={ () => { this.buyUnit(); } }>Buy Unit ($10)</button></p>
                            <p><button className={"btn btn-success btn-block" + this.disabledBefore(15)} onClick={ () => { this.buyTower(); } }>Buy Tower ($15)</button></p>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
