import React, { Component } from 'react';
import Themes from '../themes';
import { Unit, Tower } from '../engine';
import { I18n } from 'react-i18next';
import i18next from 'i18next';

export default class KingdomMenu extends Component {
    buyUnit() {
        try {
            this.props.arbiter.buyUnit();

            if (this.props.onUpdate) {
                this.props.onUpdate();
            }
        } catch (e) {
            this.props.handleArbiterError(e);
        }
    }

    buyTower() {
        try {
            this.props.arbiter.buyTower();

            if (this.props.onUpdate) {
                this.props.onUpdate();
            }
        } catch (e) {
            this.props.handleArbiterError(e);
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
            return ' disabled text-danger';
        }

        return '';
    }

    render() {
        const kingdom = this.props.arbiter.currentKingdom;

        if (!kingdom) {
            return <div></div>;
        }

        return (
            <I18n i18n={ i18next }>
                {t => (
                    <div className="kingdom-menu">
                        <h3 className="card-header d-none d-md-block">{ t('kingdom_menu') }</h3>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-4 col-md-6">
                                    <p className="money-display h5">
                                        <img
                                            src={Themes.getImageForMoney(kingdom.money)}
                                            className="d-none d-sm-inline"
                                            alt="gold"
                                        />
                                        &nbsp;
                                        <b>{ kingdom.money }</b>
                                        &nbsp;
                                        { this.getBalanceDiff(kingdom.balance) }
                                    </p>

                                    { kingdom.balance ? (
                                        <p className="d-none d-md-block">
                                            { t('economy.last_turn', { money: kingdom.balance.lastCapital }) }<br />
                                            { t('economy.income', { money: kingdom.balance.income }) }<br />
                                            { t('economy.maintenance', { money: kingdom.balance.maintenance }) }
                                        </p>
                                    ) : '' }
                                </div>
                                <div className="col-2 col-md-6">
                                    <h4 className="card-title d-none d-md-block text-center">{ t('selection') }</h4>
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
                                    <h4 className="card-title d-none d-md-block">{ t('military') }</h4>
                                    <div className="inline-buttons">
                                        <button
                                            className={"btn btn-success buy-unit" + this.disabledBefore(10)}
                                            onClick={ () => { this.buyUnit(); } }>
                                                <img
                                                    src={Themes.getImageFor(new Unit())}
                                                    alt="unit"
                                                />
                                                <span className={'d-none d-sm-inline'}>
                                                    <img
                                                        src={Themes.getImageForMoney()}
                                                        alt="unit"
                                                    />
                                                    10
                                                </span>
                                        </button>
                                        <button
                                            className={"btn btn-success buy-tower" + this.disabledBefore(15)}
                                            onClick={ () => { this.buyTower(); } }>
                                                <img
                                                    src={Themes.getImageFor(new Tower())}
                                                    alt="tower"
                                                />
                                                <span className={'d-none d-sm-inline'}>
                                                    <img
                                                        src={Themes.getImageForMoney()}
                                                        alt="unit"
                                                    />
                                                    15
                                                </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </I18n>
        );
    }
}
