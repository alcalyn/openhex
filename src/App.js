import i18next from 'i18next';
import { AutoSizer } from 'react-virtualized';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import React, { Component } from 'react';
import { WorldGenerator, Arbiter, WorldConfig } from './engine';
import { Alerts, KingdomMenu, GameMenu, OpenHexGrid } from './components';
import './i18n';
import './bootstrap4-sketchy.min.css';
import './bootstrap4-sketchy-override.css';
import './fonts/fonts.css';
import './App.css';

class App extends Component {
    constructor(props, context) {
        super(props, context);

        let config = {
            size: 14,
            seed: null,
        };

        if (props.location && props.location.state && props.location.state.config) {
            config = props.location.state.config;
        }

        const worldConfig = WorldConfig({
            size: config.size,
        });
        const world = WorldGenerator.generate(config.seed, worldConfig);
        const arbiter = new Arbiter(world);

        arbiter.setCurrentPlayer(world.config.players[0]);

        this.state = {
            world,
            selection: arbiter.selection,
            warningEntities: [],
            alert: null,
        };

        this.arbiter = arbiter;
    }

    clickHex(hex) {
        console.log('hex', hex);

        try {
            this.arbiter.smartAction(hex);
            this.clearAlert();
            this.update();
        } catch (e) {
            this.handleArbiterError(e);
        }
    }

    displayAlert(alert, warningEntities = []) {
        this.clearAlert();

        this.alertThread = setTimeout(() => this.clearAlert(), 10000);

        this.setState({
            warningEntities,
            alert,
        });
    }

    clearAlert() {
        if (this.alertThread) {
            clearTimeout(this.alertThread);
        }

        this.setState({
            warningEntities: [],
            alert: null,
        });
    }

    /**
     * Display an alert if arbiter returns a player error.
     *
     * @param {Error} e
     */
    handleArbiterError(e) {
        if ('illegal_move' !== e.type) {
            throw e;
        }

        const alert = {
            level: 'danger',
            message: i18next.t(e.message, e.context),
        };

        this.displayAlert(alert, e.warningEntities);
    }

    update() {
        this.setState({
            world: this.state.world,
            selection: this.arbiter.selection,
            currentKingdom: this.arbiter.currentKingdom,
        });
    }

    render() {
        const { world, warningEntities, currentKingdom, alert } = this.state;

        return (
            <div className={"App"}>
                { alert ? <Alerts alerts={[alert]} /> : null }
                <div className={"card card-menu d-md-none card-menu-small card-menu-small-kingdom"}>
                    <KingdomMenu
                        arbiter={this.arbiter}
                        onUpdate={() => { this.update(); }}
                        handleArbiterError={ e => this.handleArbiterError(e) }
                    />
                </div>
                <div className={"card card-menu d-md-none card-menu-small card-menu-small-game"}>
                    <GameMenu
                        arbiter={this.arbiter}
                        updateCallback={() => this.update()}
                        handleArbiterError={ e => this.handleArbiterError(e) }
                    />
                </div>

                <div className={"card card-menu card-menu-large d-none d-md-block"}>
                    <KingdomMenu
                        arbiter={this.arbiter}
                        onUpdate={() => { this.update(); }}
                        handleArbiterError={ e => this.handleArbiterError(e) }
                    />
                    <GameMenu
                        arbiter={this.arbiter}
                        updateCallback={() => this.update()}
                        handleArbiterError={ e => this.handleArbiterError(e) }
                    />
                </div>

                <div id="grid" className={this.state.selection ? 'has-selection' : ''}>

                    <AutoSizer>
                        {(({width, height}) => width === 0 || height === 0 ? null : (

                            <ReactSVGPanZoom
                                width={width} height={height}
                                tool={'auto'}
                                SVGBackground={'rgba(0, 0, 0, 0)'}
                                background={'rgba(0, 0, 0, 0)'}
                                toolbarPosition={'none'}
                                miniaturePosition={'none'}
                                detectAutoPan={false}
                                scaleFactorOnWheel={1.15}
                                disableDoubleClickZoomWithToolAuto={true}
                            >
                                <svg width={width} height={height}>
                                    <OpenHexGrid
                                        world={ world }
                                        warningEntities={ warningEntities }
                                        currentKingdom={ currentKingdom }
                                        currentPlayer={ this.arbiter.currentPlayer }
                                        clickHex={ hex => this.clickHex(hex) }
                                    />
                                </svg>
                            </ReactSVGPanZoom>

                        ))}
                    </AutoSizer>

                </div>
            </div>
        );
    }
}

export default App;
