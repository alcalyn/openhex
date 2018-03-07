import i18next from 'i18next';
import { AutoSizer } from 'react-virtualized';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import React, { Component } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import { WorldGenerator, Arbiter } from './engine';
import { Alerts, KingdomMenu, HexCell, GameMenu } from './components';
import './locales';
import './bootstrap4-sketchy.min.css';
import './App.css';

class App extends Component {
    constructor(props, context) {
        super(props, context);

        const world = WorldGenerator.generate();
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

    hexUnitHasMove(hex) {
        if (this.arbiter.currentPlayer !== hex.player) {
            return false;
        }

        if (!hex.hasUnit()) {
            return false;
        }

        return !hex.entity.played;
    }

    update() {
        this.setState({
            world: this.state.world,
            selection: this.arbiter.selection,
            currentKingdom: this.arbiter.currentKingdom,
        });
    }

    initView(viewer) {
        if (!this.viewInitialized && viewer) {
            this.viewInitialized = true;

            viewer.setPointOnViewerCenter(0, 0, 1);
        }
    }

    render() {
        const { world, warningEntities, currentKingdom, alert } = this.state;

        this.initView();

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

                <div id="grid">

                    <AutoSizer>
                        {(({width, height}) => width === 0 || height === 0 ? null : (

                            <ReactSVGPanZoom
                                width={width} height={height}
                                tool={'auto'}
                                ref={viewer => this.initView(viewer)}
                                SVGBackground={'rgba(0, 0, 0, 0)'}
                                background={'rgba(0, 0, 0, 0)'}
                                toolbarPosition={'none'}
                                miniaturePosition={'none'}
                                detectAutoPan={false}
                                scaleFactorOnWheel={1.15}
                                disableDoubleClickZoomWithToolAuto={true}
                            >
                                <HexGrid id="grid" width={400} height={400}>
                                    <Layout size={{ x: 20, y: 20 }} spacing={1.06}>
                                        { world.hexs.map((hex, i) => <HexCell
                                            key={i}
                                            hex={hex}
                                            highlight={null !== hex.kingdom && hex.kingdom === currentKingdom}
                                            warningEntity={hex.entity && (-1 !== warningEntities.indexOf(hex.entity))}
                                            unitHasMove={this.hexUnitHasMove(hex)}
                                            onClick={() => { this.clickHex(hex); }}
                                        />) }
                                    </Layout>
                                </HexGrid>
                            </ReactSVGPanZoom>

                        ))}
                    </AutoSizer>

                </div>
            </div>
        );
    }
}

export default App;
