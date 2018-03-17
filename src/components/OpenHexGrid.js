import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HexGrid, Layout } from 'react-hexgrid';
import { World, Kingdom, Player, HexUtils } from '../engine';
import { HexCell } from '.';

export default class OpenHexGrid extends Component {

    hexUnitHasMove(hex) {
        if (this.props.currentPlayer !== hex.player) {
            return false;
        }

        if (!hex.hasUnit()) {
            return false;
        }

        return !hex.entity.played;
    }

    isHexSelected(hex) {
        return null !== hex.kingdom && hex.kingdom === this.props.currentKingdom;
    }

    createViewBox(hexs, layout) {
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
            worldBorders[2] - worldBorders[0],
            worldBorders[3] - worldBorders[1],
        ];

        return viewBox;
    }

    render() {
        const HEX_SIZE = 20;
        const { world, warningEntities, currentKingdom, currentPlayer, clickHex, width, height } = this.props;

        const layout = new Layout();
        layout.orientation = Layout.LAYOUT_FLAT;
        layout.size = { x: HEX_SIZE, y: HEX_SIZE };
        layout.spacing = 1.0;
        layout.origin = { x: 0, y: 0 };

        const viewBox = this.createViewBox(world.hexs, layout);

        return (
            <HexGrid width={ width } height={ height } viewBox={ viewBox.join(' ') }>
                <Layout size={ layout.size } spacing={ layout.spacing } origin={ layout.origin } flat={ layout.orientation === Layout.LAYOUT_FLAT }>
                    <g className={'all-hexs'}>
                        { world.hexs.map((hex, i) => <HexCell
                            key={i}
                            hex={hex}
                            highlight={this.isHexSelected(hex)}
                            currentPlayer={hex.player === currentPlayer}
                            clickable={hex.kingdom && hex.player === currentPlayer}
                            warningEntity={hex.entity && (-1 !== warningEntities.indexOf(hex.entity))}
                            unitHasMove={this.hexUnitHasMove(hex)}
                            onClick={() => { clickHex(hex); }}
                        />) }
                        <g className={'selected-kingdom'}>
                            { currentKingdom ? (
                                currentKingdom.hexs.map((hex, i) => <HexCell
                                    key={i}
                                    hex={hex}
                                    highlight={this.isHexSelected(hex)}
                                    currentPlayer={hex.player === currentPlayer}
                                    warningEntity={hex.entity && (-1 !== warningEntities.indexOf(hex.entity))}
                                    unitHasMove={this.hexUnitHasMove(hex)}
                                    onClick={() => { clickHex(hex); }}
                                />)
                            ) : ''}
                        </g>
                    </g>
                    <defs>
                        <filter id="hexshadow" x="-200%" y="-200%" width="400%" height="400%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                        <filter id="gold-highlight" x="-200%" y="-200%" width="400%" height="400%">
                            <feGaussianBlur id="gold-shadow" in="SourceAlpha" stdDeviation="1.7" result="blur"/>
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
                            from="0.1"
                            to="3.0"
                            begin="0s"
                            dur="0.8s"
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
    warningEntities: PropTypes.array,
    currentKingdom: PropTypes.instanceOf(Kingdom),
    currentPlayer: PropTypes.instanceOf(Player),
    clickHex: PropTypes.func,
};

OpenHexGrid.defaultProps = {
    width: '100%',
    height: '100%',
    warningEntities: [],
    currentKingdom: null,
    currentPlayer: null,
    clickHex: () => null,
};
