import { AutoSizer } from 'react-virtualized';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import React, { Component } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import { WorldGenerator, Hex, Unit, Arbiter } from './engine';
import { KingdomMenu, HexCell, GameMenu } from './components';
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
        };

        this.arbiter = arbiter;
    }

    clickHex(hex) {
        console.log('hex', hex);

        try {
            this.arbiter.smartAction(hex);

        } catch (e) {
            console.warn(e.message);
        }

        this.update();
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
        const { world } = this.state;

        this.initView();

        return (
            <div className={"App"}>
                <div className={"card card-menu d-md-none card-menu-small card-menu-small-kingdom"}>
                    <KingdomMenu arbiter={this.arbiter} onUpdate={() => { this.update(); }} />
                </div>
                <div className={"card card-menu d-md-none card-menu-small card-menu-small-game"}>
                    <GameMenu
                        arbiter={this.arbiter}
                        updateCallback={() => this.update()}
                        onEndTurn={() => { this.arbiter.endTurn();this.update(); }}
                        onUndo={() => { this.arbiter.undo();this.update(); }}
                        onRedo={() => { this.arbiter.redo();this.update(); }}
                        onUndoAll={() => { this.arbiter.undoAll();this.update(); }}
                    />
                </div>

                <div className={"card card-menu card-menu-large d-none d-md-block"}>
                    <KingdomMenu arbiter={this.arbiter} onUpdate={() => { this.update(); }} />
                    <GameMenu
                        arbiter={this.arbiter}
                        updateCallback={() => this.update()}
                        onEndTurn={() => { this.arbiter.endTurn();this.update(); }}
                        onUndo={() => { this.arbiter.undo();this.update(); }}
                        onRedo={() => { this.arbiter.redo();this.update(); }}
                        onUndoAll={() => { this.arbiter.undoAll();this.update(); }}
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
                                            highlight={null !== hex.kingdom && hex.kingdom === this.state.currentKingdom}
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
