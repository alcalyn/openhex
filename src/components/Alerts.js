import React, { Component } from 'react';
import Alert from './Alert';

export default class Alerts extends Component {
    render() {
        return (
            <div class="alerts-wrapper">
                <div class="alerts container">
                    <div class="row">
                        <div class="col-12">
                            { this.props.alerts.map(alert => <Alert alert={ alert } />) }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
