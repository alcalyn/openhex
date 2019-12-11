import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HexGrid, Layout } from 'react-hexgrid';
import { World, HexUtils, Arbiter } from '../engine';
import { HexCell } from '.';

export default class OpenHexGrid extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            warningEntities: [],
        };

        this._handleOnContextMenu = this._handleOnContextMenu.bind(this);
    }

    hexUnitHasMove(hex) {
        if (!this.props.arbiter) {
            return false;
        }

        if (this.props.arbiter.currentPlayer !== hex.player) {
            return false;
        }

        if (!hex.hasUnit()) {
            return false;
        }

        return !hex.entity.played;
    }

    isHexSelected(hex) {
        if (!this.props.arbiter) {
            return false;
        }

        return null !== hex.kingdom && hex.kingdom === this.props.arbiter.currentKingdom;
    }

    createViewBox(hexs, layout, padding) {
        const pixel0 = HexUtils.hexToPixel(hexs[0], layout);
        const worldBorders = [
            pixel0.x,
            pixel0.y,
            pixel0.x,
            pixel0.y,
        ];

        hexs.forEach((hex) => {
            const pixel = HexUtils.hexToPixel(hex, layout);

            worldBorders[0] = Math.min(worldBorders[0], pixel.x);
            worldBorders[1] = Math.min(worldBorders[1], pixel.y);
            worldBorders[2] = Math.max(worldBorders[2], pixel.x);
            worldBorders[3] = Math.max(worldBorders[3], pixel.y);
        });

        worldBorders[0] -= layout.size.x;
        worldBorders[1] -= layout.size.y;
        worldBorders[2] += layout.size.x;
        worldBorders[3] += layout.size.y;

        const viewBox = [
            worldBorders[0],
            worldBorders[1],
            worldBorders[2] - worldBorders[0] + (padding * 2),
            worldBorders[3] - worldBorders[1] + (padding * 2),
        ];

        return viewBox;
    }

    clickHex(hex) {
        this.props.onClickHex(hex);

        if (!this.props.arbiter) {
            return;
        }

        try {
            this.props.arbiter.smartAction(hex);
            this.setState({ warningEntities: [] });
            this.update();
            this.props.onClearError();

        } catch (e) {
            this.setState({ warningEntities: e.warningEntities });
            this.props.onArbiterError(e);
        }
    }

    _handleOnContextMenu(e) {
        e.preventDefault();
        if (!this.props.arbiter) return;
        this.props.arbiter.smartSecondaryAction();
    }

    componentDidMount() {
        document.addEventListener('contextmenu', this._handleOnContextMenu);
    }

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this._handleOnContextMenu);
    }

    update() {
        this.setState({
            warningEntities: this.state.warningEntities,
        });

        this.props.onArbiterUpdate();
    }

    render() {
        const HEX_SIZE = 20;
        const PADDING = 10;
        const { world, arbiter, width, height } = this.props;

        const layout = new Layout();
        layout.orientation = Layout.LAYOUT_FLAT;
        layout.size = { x: HEX_SIZE, y: HEX_SIZE };
        layout.spacing = 1.0;
        layout.origin = { x: 0, y: 0 };

        const viewBox = this.createViewBox(world.hexs, layout, PADDING);

        return (
            <HexGrid width={ width } height={ height } viewBox={ viewBox.join(' ') }>
                <Layout
                    size={ layout.size }
                    spacing={ layout.spacing }
                    origin={ layout.origin }
                    flat={ layout.orientation === Layout.LAYOUT_FLAT }
                    className={ arbiter && arbiter.selection ? 'has-selection' : '' }
                >
                    <g className={'all-hexs'}>
                        { world.hexs.map(hex =>
                            <g key={hex.hash} transform={`translate(${PADDING} ${PADDING})`}>
                                <HexCell
                                    hex={hex}
                                    highlight={this.isHexSelected(hex)}
                                    currentPlayer={arbiter && hex.player === arbiter.currentPlayer}
                                    clickable={arbiter && hex.kingdom && hex.player === arbiter.currentPlayer}
                                    warningEntity={hex.entity && (-1 !== this.state.warningEntities.indexOf(hex.entity))}
                                    unitHasMove={this.hexUnitHasMove(hex)}
                                    onClick={() => { this.clickHex(hex); }}
                                />
                            </g>
                        ) }
                        <g className={'selected-kingdom'} transform={`translate(${PADDING} ${PADDING})`}>
                            { arbiter && arbiter.currentKingdom ? (
                                arbiter.currentKingdom.hexs.map(hex => <HexCell
                                    key={hex.hash}
                                    hex={hex}
                                    highlight={this.isHexSelected(hex)}
                                    currentPlayer={hex.player === arbiter.currentPlayer}
                                    warningEntity={hex.entity && (-1 !== this.state.warningEntities.indexOf(hex.entity))}
                                    unitHasMove={this.hexUnitHasMove(hex)}
                                    onClick={() => { this.clickHex(hex); }}
                                />)
                            ) : ''}
                        </g>
                        <rect
                            fill={`rgba(0, 0, 0, 0`}
                            x={viewBox[0]}
                            y={viewBox[1]}
                            width={width}
                            height={height}
                            style={{ pointerEvents: arbiter && arbiter.winner ? 'auto' : 'none' }}
                        />
                    </g>
                    <defs>
                        <filter id="hex-shadow" x="-200%" y="-200%" width="400%" height="400%">
                            <feFlood floodColor="#FFFFFF" result="outsideColor"/>
                            <feMorphology in="SourceAlpha" operator="dilate" radius="1.5"/>
                            <feGaussianBlur in="outsideBlur" stdDeviation="0.5"/>
                            <feComposite in="outsideColor" in2="outsideBlur" operator="in" result="outsideStroke"/>
                            <feMerge>
                                <feMergeNode in="outsideStroke"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        <filter id="world-shadow" x="0" y="0" width="200%" height="200%">
                            <feOffset result="offOut" in="SourceAlpha" dx="3" dy="6" />
                            <feGaussianBlur in="offOut" stdDeviation="2"/>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        <filter id="world-background" x="0" y="0" width="100%" height="100%">
                            <feTile in="SourceGraphic" x="50" y="50"
                                    width="100" height="100" />
                            <feTile/>
                        </filter>
                        <filter id="gold-highlight" x="-200%" y="-200%" width="400%" height="400%">
                            <feGaussianBlur id="gold-shadow" in="SourceAlpha" stdDeviation="2" result="blur"/>
                            <feFlood floodColor="#FFFF00" result="offsetColor"/>
                            <feComposite in="offsetColor" in2="blur" operator="in" result="offsetBlur"/>
                            <feMerge>
                                <feMergeNode in="offsetBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        <filter id="warn-highlight">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="blur"/>
                            <feFlood floodColor="#FF0000" result="offsetColor"/>
                            <feComposite in="offsetColor" in2="blur" operator="in" result="offsetBlur"/>
                            <feColorMatrix type="saturate" values="8" in="SourceGraphic" result="saturated"/>
                            <feMerge>
                                <feMergeNode in="offsetBlur"/>
                                <feMergeNode in="saturated"/>
                            </feMerge>
                        </filter>
                        <animate
                            xlinkHref="#gold-shadow"
                            attributeName="stdDeviation"
                            from="0.5"
                            to="0.5"
                            values="0.5; 5; 0.5"
                            keyTimes="0; 0.5; 1"
                            begin="0s"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </defs>
                </Layout>
            </HexGrid>
        );
    }
}

OpenHexGrid.propTypes = {
    width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    world: PropTypes.instanceOf(World).isRequired,
    arbiter: PropTypes.instanceOf(Arbiter),
    onClickHex: PropTypes.func,
    onArbiterUpdate: PropTypes.func,
    onArbiterError: PropTypes.func,
    onClearError: PropTypes.func,
};

OpenHexGrid.defaultProps = {
    width: '100%',
    height: '100%',
    arbiter: null,
    onClickHex: () => null,
    onArbiterUpdate: () => null,
    onArbiterError: e => null,
    onClearError: () => null,
};
