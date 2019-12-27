import React, { Component } from 'react';
import { Alert } from '.';

export default class Alerts extends Component {
    render() {
        return (
            <div className={'alerts-wrapper'}>
                <div className={'alerts container'}>
                    <div className={'row'}>
                        <div className={'col-12'}>
                            { this.props.alerts.map((alert, i) => (
                                <Alert
                                    key={'alert-'+i}
                                    alert={ alert }
                                />)
                            ) }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
