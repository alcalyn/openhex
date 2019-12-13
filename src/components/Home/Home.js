import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { I18n } from 'react-i18next';
import i18n from '../../i18n';
import { WorldGenerator } from '../../engine';
import { OpenHexGrid } from '../Game';

export default class Home extends Component {
    render() {
        const world = WorldGenerator.generate();

        return (
            <I18n i18n={ i18n }>
                {t => (
                    <div className={'home'}>
                        <main>
                            <div className={'jumbotron'}>
                                <div className={'container text-center'}>
                                    <h1 className={'display-4'}>OpenHex</h1>
                                    <p className={'lead'}>
                                        { t('project.description') }
                                    </p>
                                </div>
                            </div>
                            <div className={'container text-center'}>
                                <div className={'row'}>
                                    <div className={'col-sm-6 offset-sm-3 col-lg-4 offset-lg-4 main-menu'}>
                                        <Link to="/game" className={'btn btn-lg btn-block btn-success play-button'}>{ t('lets_play') }</Link>
                                        <Link to="/create-custom-game" className={'btn btn-lg btn-block btn-success'}>{ t('custom_game') }</Link>
                                        <Link to="/game-rules" className={'btn btn-lg btn-block btn-success'}>{ t('game_rules') }</Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                        <div className={'splashscreen-background-wrapper'}>
                            <div className={'splashscreen-background-overlay'}>
                            </div>
                            <div className={'splashscreen-background'}>
                                <OpenHexGrid world={ world } width={ '100%' } height={ 500 } />
                            </div>
                        </div>
                    </div>
                )}
            </I18n>
        );
    }
}
