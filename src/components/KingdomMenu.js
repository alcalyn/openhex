import React, { Component } from 'react';
import Themes from '../themes';
import { Unit, Tower } from '../engine';

export default class KingdomMenu extends Component {
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
            <div className="kingdom-menu">
                <h3 className="card-header d-none d-md-block">Kingdom menu</h3>
                <div className="card-body">
                    <div className="row">
                        <div className="col-4 col-md-12">
                            <p className="h5">
                                <span className="d-none d-md-inline">Money:</span>
                                <b>{ kingdom.money }</b>
                                &nbsp;
                                { this.getBalanceDiff(kingdom.balance) }
                            </p>

                            { kingdom.balance ? (
                                <p className="d-none d-md-block">
                                    Last turn: { kingdom.balance.lastCapital }<br />
                                    Income: +{ kingdom.balance.income }<br />
                                    Units: -{ kingdom.balance.maintenance }
                                </p>
                            ) : '' }
                        </div>
                        <div className="col-2 col-md-12">
                            <h4 className="card-title d-none d-md-block">Selection</h4>
                            <div className="selection-container d-block text-center">
                                {!this.props.arbiter.selection ? '' :
                                    <img
                                        src={Themes.getImageFor(this.props.arbiter.selection)}
                                        alt="selection"
                                    />
                                }
                            </div>
                        </div>
                        <div className="col-6 col-md-12">
                            <h4 className="card-title d-none d-md-block">Military</h4>
                            <div className="inline-buttons">
                                <button
                                    className={"btn btn-success buy-unit" + this.disabledBefore(10)}
                                    onClick={ () => { this.buyUnit(); } }>
                                        <img
                                            src={Themes.getImageFor(new Unit())}
                                            alt="unit"
                                        />
                                </button>
                                <button
                                    className={"btn btn-success buy-tower" + this.disabledBefore(15)}
                                    onClick={ () => { this.buyTower(); } }>
                                        <img
                                            src={Themes.getImageFor(new Tower())}
                                            alt="tower"
                                        />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}
