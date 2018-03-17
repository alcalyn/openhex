import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { WorldGenerator } from '../engine';
import { OpenHexGrid } from '.';

export default class Home extends Component {
    render() {
        const world = WorldGenerator.generate();

        return (
            <div className={'home'}>
                <main>
                    <div className={'jumbotron'}>
                        <div className={'container text-center'}>
                            <h1 className={'display-4'}>OpenHex</h1>
                            <p className={'lead'}>
                                Simple strategy game inspired by Slay.
                            </p>
                        </div>
                    </div>
                    <div className={'container text-center'}>
                        <div className={'row'}>
                            <div className={'col-sm-6 offset-sm-3 col-lg-4 offset-lg-4 main-menu'}>
                                <Link to="/game" className={'btn btn-lg btn-block btn-success'}>Play</Link>
                                <Link to="/create-custom-game" className={'btn btn-lg btn-block btn-success'}>Custom game</Link>
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
        );
    }
}
