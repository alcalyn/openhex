import React, { Component } from 'react';
import { Hexagon } from 'react-hexgrid';
import Themes from '../themes';
import { Arbiter } from '../engine';

export default class HexCell extends Component {
    onClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e, this);
        }
    }

    hexClasses(hex) {
        const classes = ['hex'];

        classes.push('color-'+hex.player.color);

        if (this.props.highlight) {
            classes.push('highlight');
        }

        if (this.props.clickable) {
            classes.push('hex-clickable');
        }

        return classes.join(' ');
    }

    hexContentClasses(hex) {
        const classes = [];

        if (hex.hasUnit()) {
            classes.push('unit');

            if (this.props.unitHasMove) {
                classes.push('has-move');
            }
        }

        if (this.props.warningEntity) {
            classes.push('warning-entity');
        }

        if (hex.hasCapital() && this.props.currentPlayer && hex.kingdom.money >= Math.min(Arbiter.UNIT_PRICE, Arbiter.TOWER_PRICE)) {
            classes.push('capital-can-buy');
        }

        return classes.join(' ');
    }

    hexContent(hex) {
        if (hex.entity) {
            return (
                <image
                    x={-12}
                    y={-12}
                    width={24}
                    height={24}
                    xlinkHref={Themes.getImageFor(hex.entity)}
                    className={this.hexContentClasses(hex)}
                />
            );
        }

        return '';
    }

    render() {
        const { hex } = this.props;

        return (
            <Hexagon
                q={hex.q}
                r={hex.r}
                s={hex.s}
                className={this.hexClasses(hex)}
                onClick={e => this.onClick(e)}
            >
                {this.hexContent(hex)}
            </Hexagon>
        );
    }
}
