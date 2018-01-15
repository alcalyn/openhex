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

    hexContentClasses(hex) {
        const classes = [];

        if (hex.hasUnit()) {
            classes.push('unit');

            if (this.props.unitHasMove) {
                classes.push('has-move');
            }
        }

        return classes.join(' ');
    }

    hexContent(hex) {
        if (hex.entity) {
            return (
                <image
                    x={-1}
                    y={-1}
                    width={2}
                    height={2}
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
