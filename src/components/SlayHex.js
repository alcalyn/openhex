import React, { Component } from 'react';
import { Hexagon } from 'react-hexgrid';
import Themes from '../themes';

export default class SlayHex extends Component {
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

        return classes.join(' ');
    }

    hexContent(hex) {
        if (hex.hasUnit()) {
            return (
                <image
                    x={-1}
                    y={-1}
                    width={2}
                    height={2}
                    xlinkHref={Themes.units[hex.entity.level]}
                    className={hex.entity.played ? 'unit' : 'unit has-move'}
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
