import { AutoSizer } from 'react-virtualized';
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import React, { Component } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import { WorldGenerator, Hex, Unit, Arbiter } from './engine';
import { KingdomMenu, Selection, HexCell, TurnMenu } from './components';
import './App.css';
import './bootstrap4-sketchy.min.css';

class App extends Component {
    constructor(props, context) {
        super(props, context);

        const world = WorldGenerator.generateHexagon4(false, 'constant-seed-5');

        world.setEntityAt(new Hex(2, -1, -1), new Unit());
        world.setEntityAt(new Hex(-1, -3, 4), new Unit());

        const arbiter = new Arbiter(world);
        arbiter.setCurrentPlayer(world.players[0]);

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

        console.log('selection', this.arbiter.selection);
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
        const { world, selection } = this.state;

        this.initView();

        return (
            <div className="App">
                <div id="selection">
                    <Selection entity={selection} />
                </div>
                <div id="kingdom-menu">
                    <KingdomMenu arbiter={this.arbiter} onUpdate={() => { this.update(); }} />
                </div>
                <div id="turn-menu">
                    <TurnMenu
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
