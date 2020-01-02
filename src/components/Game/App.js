import { AutoSizer } from 'react-virtualized';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import React, { Component } from 'react';
import i18n from '../../i18n';
import { WorldGenerator, Arbiter, WorldConfig } from '../../engine';
import { Alerts, KingdomMenu, GameMenu, OpenHexGrid } from '.';
import './App.css';
import Themes from "../../themes";

class App extends Component {
    constructor(props, context) {
        super(props, context);

        let config = {
            size: 14,
            seed: null,
        };

        if (props.location && props.location.state && props.location.state.config) {
            config = props.location.state.config;

            if (!config.seed || /^\s*$/.test(config.seed)) {
                config.seed = null;
            }
        }

        const worldConfig = WorldConfig({
            size: config.size,
        });
        const world = WorldGenerator.generate(config.seed, worldConfig);
        const arbiter = new Arbiter(world);

        arbiter.setCurrentPlayer(world.config.players[0]);

        this.state = {
            world,
            alert: null,
        };

        this.arbiter = arbiter;
        this.arbiter.onUpdate = () => {
            this.update();
        };

        this._handleMouseMove = this._handleMouseMove.bind(this);
        this.mousePosition = [0, 0];
    }

    displayAlert(alert) {
        this.clearAlert();

        this.alertThread = setTimeout(() => this.clearAlert(), 10000);

        this.setState({
            alert,
        });
    }

    clearAlert() {
        if (this.alertThread) {
            clearTimeout(this.alertThread);
        }

        this.setState({
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
            message: i18n.t(e.message, e.context),
        };

        this.displayAlert(alert);
    }

    update() {
        this.setState({
            world: this.state.world,
        });
    }

    _handleMouseMove(e) {
        if (this.selectionImage && this.reactSvg) {
            const layoutRect = document.getElementById('grid').querySelector('svg g').getBoundingClientRect();
            this.mousePosition = [
                (e.clientX - layoutRect.left) / this.reactSvg.state.value.a,
                (e.clientY - layoutRect.top) / this.reactSvg.state.value.d
            ];
            this.selectionImage.setAttribute('x', this.mousePosition[0]);
            this.selectionImage.setAttribute('y', this.mousePosition[1]);
        }
    }

    componentDidMount() {
        document.addEventListener('mousemove', this._handleMouseMove);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this._handleMouseMove);
    }

    render() {
        const { world, alert } = this.state;
        const positionNone = { position: 'none' };

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

                            <UncontrolledReactSVGPanZoom
                                width={width} height={height}
                                tool={'auto'}
                                SVGBackground={'rgba(0, 0, 0, 0)'}
                                background={'rgba(0, 0, 0, 0)'}
                                toolbarProps={positionNone}
                                miniatureProps={positionNone}
                                detectAutoPan={false}
                                scaleFactorOnWheel={1.15}
                                disableDoubleClickZoomWithToolAuto={true}
                                preventPanOutside={true}
                                ref={node => { this.reactSvg = node; }}
                            >
                                <svg width={width} height={height}>
                                    <OpenHexGrid
                                        world={ world }
                                        arbiter={ this.arbiter }
                                        onArbiterUpdate={ () => this.update() }
                                        onArbiterError={ e => this.handleArbiterError(e) }
                                        onClearError={ () => this.clearAlert() }
                                    />
                                    { this.arbiter && this.arbiter.selection ? (
                                        <image
                                            x={this.mousePosition[0]}
                                            y={this.mousePosition[1]}
                                            width={20}
                                            height={20}
                                            style={{ pointerEvents: 'none' }}
                                            xlinkHref={Themes.getImageFor(this.arbiter.selection)}
                                            ref={node => { this.selectionImage = node; }}
                                        />
                                    ) : ''}
                                </svg>
                            </UncontrolledReactSVGPanZoom>

                        ))}
                    </AutoSizer>

                </div>
            </div>
        );
    }
}

export default App;
