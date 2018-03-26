import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { I18n } from 'react-i18next';
import i18n from '../i18n';
import SizeButton from './SizeButton';

export default class CreateCustomGame extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            size: 16,
            seed: '',
        };
    }

    selectSize(size) {
        this.setState({ size });
    }

    onSeedInputChange(e) {
        this.setState({
            seed: e.target.value,
        });
    }

    render() {
        return (
            <I18n i18n={ i18n }>
                {t => (
                    <main className={'container create-custom-game'}>
                        <h2>{ t('custom_game') }</h2>

                        <h3>{ t('world_size') }</h3>

                        <div className={'row'}>
                            <SizeButton size={ 10 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={ t('size.small') } />
                            <SizeButton size={ 16 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={ t('size.medium') } />
                            <SizeButton size={ 28 } selectedSize={ this.state.size } onSelectSize={ size => this.selectSize(size) } label={ t('size.large') } />
                        </div>

                        <h3>{ t('seed.title') }</h3>

                        <div className={'form-group'}>
                            <input
                                value={ this.state.seed }
                                onChange={e => this.onSeedInputChange(e)}
                                placeholder={ t('seed.placeholder') }
                                className={'form-control form-control-lg'}
                                aria-describedby="seed-help"
                            ></input>
                            <p
                                id="seed-help"
                                className={'form-text text-muted'}
                            >
                                { t('seed.help') }
                            </p>
                        </div>

                        <Link
                            to={{
                                pathname: '/game',
                                state: {
                                    config: this.state,
                                },
                            }}
                            className={'btn btn-lg btn-success btn-block play-button'}
                        >{ t('lets_play') }</Link>
                    </main>
                )}
            </I18n>
        );
    }
}
